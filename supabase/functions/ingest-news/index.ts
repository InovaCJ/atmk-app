// deno-lint-ignore-file no-explicit-any
// Edge Function: ingest-news
// - Coleta fontes ativas (RSS e fallback via URL configurada)
// - Faz parse do feed, deduplica por url_hash e persiste em news_items
// - Extrai tópicos simples por frequência de termos

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function sanitizeText(text?: string | null): string | null {
  if (!text) return null;
  return text.replace(/\s+/g, " ").trim();
}

function extractTopics(text: string, limit = 8): string[] {
  const normalized = text.toLowerCase().replace(/[^a-zà-ú0-9\s-]/gi, " ");
  const tokens = normalized.split(/\s+/).filter(Boolean);
  const stop = new Set([
    "a", "as", "o", "os", "um", "uma", "de", "da", "do", "e", "é", "em", "para", "por", "com", "no", "na", "que", "se",
  ]);
  const freq = new Map<string, number>();
  for (const t of tokens) {
    if (stop.has(t) || t.length < 3) continue;
    freq.set(t, (freq.get(t) || 0) + 1);
  }
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([t]) => t);
}

async function parseRss(xml: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const items = Array.from(doc.querySelectorAll("item, entry"));
  return items.map((el) => {
    const get = (sel: string) => el.querySelector(sel)?.textContent ?? undefined;
    const title = get("title")?.trim();
    const link = get("link")?.trim() || el.querySelector("link")?.getAttribute("href") || undefined;
    const pub = get("pubDate") || get("updated") || get("published");
    const author = get("author") || el.querySelector("author > name")?.textContent || undefined;
    const summary = get("description") || get("summary") || undefined;
    const content = get("content") || get("content:encoded") || summary;
    return { title, link, pub, author, summary, content };
  }).filter(i => i.title && i.link);
}

async function parseHtmlArticles(html: string, baseUrl: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const absolutize = (href: string | null | undefined): string | undefined => {
    if (!href) return undefined;
    try {
      return new URL(href, baseUrl).toString();
    } catch {
      return undefined;
    }
  };

  const items: Array<{ title?: string; link?: string; pub?: string | null; author?: string | null; summary?: string | null; content?: string | null; }> = [];

  // Heurística 1: elementos <article>
  const articles = Array.from(doc.querySelectorAll("article"));
  for (const el of articles) {
    const titleEl = el.querySelector('h1 a, h2 a, h3 a, a[rel="bookmark"], h1, h2, h3');
    const link = absolutize(titleEl?.getAttribute('href')) || absolutize(el.querySelector('a')?.getAttribute('href'));
    const title = (titleEl?.textContent || '').trim() || undefined;
    const timeEl = el.querySelector('time[datetime]');
    const pub = timeEl?.getAttribute('datetime') || null;
    const p = el.querySelector('p');
    const summary = (p?.textContent || '').trim() || null;
    if (title && link) {
      items.push({ title, link, pub, author: null, summary, content: summary });
    }
  }

  // Heurística 2: listas de posts comuns (WordPress etc.)
  if (items.length < 5) {
    const anchors = Array.from(doc.querySelectorAll('h2 a, .post a, .entry-title a, .card a, a[href*="/20"]'));
    for (const a of anchors) {
      const link = absolutize(a.getAttribute('href'));
      const title = (a.textContent || '').trim();
      if (title && link && !items.find(i => i.link === link)) {
        items.push({ title, link, pub: null, author: null, summary: null, content: null });
      }
    }
  }

  // Limitar para evitar excesso
  return items.slice(0, 50);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "missing authorization" }), { status: 401, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    // Supabase client autenticado com o token do usuário
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Optional clientId to scope; if absent, process all with limits
    const { clientId, days, validateOnly } = await req.json().catch(() => ({ clientId: null, days: 7, validateOnly: false }));
    const now = new Date();
    const windowDays = typeof days === 'number' && days > 0 ? days : 7;
    const since = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);

    // Auth: identify user from token
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: corsHeaders });
    }

    // Authorization: ensure user has access to the clientId
    if (!clientId) {
      return new Response(JSON.stringify({ error: "clientId required" }), { status: 400, headers: corsHeaders });
    }

    // Rely on RLS: user can view the client only if member/owner
    const { data: clientRow, error: clientErr } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .maybeSingle();
    if (clientErr || !clientRow) {
      return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: corsHeaders });
    }

    // Load only this client's enabled sources
    const { data: sources, error: sourcesErr } = await supabase
      .from("news_sources")
      .select("id, client_id, type, url, api_config, enabled")
      .eq("client_id", clientId)
      .eq("enabled", true)
      .order("created_at", { ascending: false });
    if (sourcesErr) throw sourcesErr;

    const filtered = sources || [];

    const runStart = new Date();
    const runStats: any[] = [];
    const validation: any[] = [];

    for (const source of filtered) {
      const sourceUrl = source.type === 'rss' ? source.url : (source.api_config?.feed_url || source.url);
      if (!sourceUrl) continue;

      let itemsFetched = 0, itemsInserted = 0, itemsSkipped = 0;
      let status = 'success';
      let errorMessage: string | undefined;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const res = await fetch(sourceUrl, { 
          headers: { 
            'accept': 'application/rss+xml, text/xml, application/xml, text/html',
            'user-agent': 'ATMKBot/1.0 (+contact@atmk.app)'
          },
          signal: controller.signal
        });
        clearTimeout(timeout);
        if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
        const contentType = (res.headers.get('content-type') || '').toLowerCase();
        const body = await res.text();
        const isRss = contentType.includes('xml') || /<rss[\s>]|<feed[\s>]/i.test(body);
        let parsed: any[] = [];
        if (isRss) {
          parsed = await parseRss(body);
        } else {
          // Fallback: tentar extrair artigos de HTML
          parsed = await parseHtmlArticles(body, sourceUrl);
        }
        itemsFetched = parsed.length;

        if (validateOnly) {
          // Apenas validar, sem gravar no banco
          let recent = 0;
          for (const it of parsed) {
            const published_at = it.pub ? new Date(it.pub) : null;
            if (!published_at || published_at >= since) recent++;
          }
          validation.push({ source_id: source.id, url: sourceUrl, isRss, itemsFound: itemsFetched, recentItems: recent });
          status = 'validated';
        }

        for (const it of parsed) {
          const title = sanitizeText(it.title) as string;
          const url = String(it.link);
          const urlHash = await sha256(`${url}`);
          const published_at = it.pub ? new Date(it.pub) : null;
          if (published_at && published_at < since) { itemsSkipped++; continue; }
          const author = sanitizeText(it.author);
          const summary = sanitizeText(it.summary);
          const content = sanitizeText(it.content || it.summary);
          const topics = extractTopics([title, summary, content].filter(Boolean).join(" "));

          if (validateOnly) {
            continue;
          }

          const { error: upErr } = await supabase
            .from('news_items')
            .upsert({
              client_id: source.client_id,
              source_id: source.id,
              title,
              url,
              url_hash: urlHash,
              published_at: published_at ? new Date(published_at) : null,
              author,
              summary,
              content,
              topics,
              is_active: true,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'client_id, url_hash' });

          if (upErr) {
            if (String(upErr.message || '').includes('duplicate')) {
              itemsSkipped++;
            } else {
              throw upErr;
            }
          } else {
            itemsInserted++;
          }
        }
      } catch (e: any) {
        status = 'error';
        errorMessage = e?.message || String(e);
      }

      runStats.push({ source, itemsFetched, itemsInserted, itemsSkipped, status, errorMessage });

      if (!validateOnly) {
        await supabase.from('news_ingestion_runs').insert({
        client_id: source.client_id,
        source_id: source.id,
        started_at: runStart.toISOString(),
        finished_at: new Date().toISOString(),
        status,
        items_fetched: itemsFetched,
        items_inserted: itemsInserted,
        items_skipped: itemsSkipped,
        error_message: errorMessage,
        });
      }

      // If source disabled (edge case), ensure items are inactive
      // This is defensive: trigger in DB already keeps in sync
      if (status === 'success' && source.enabled !== true) {
        await supabase
          .from('news_items')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('source_id', source.id);
      }
    }

    return new Response(JSON.stringify({ ok: true, processed: runStats.length, runs: runStats, validation }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders });
  }
});


