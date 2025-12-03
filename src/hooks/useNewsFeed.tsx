// New hook: useNewsFeed
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface NewsItem {
  id: string;
  client_id: string;
  source_id: string;
  title: string;
  url: string;
  published_at: string | null;
  author?: string | null;
  summary?: string | null;
  content?: string | null;
  topics?: string[];
  is_active: boolean;
  created_at: string;
}

export interface UseNewsFeedParams {
  clientId: string;
  q?: string;
  topics?: string[];
  days?: number; // window, default 7
  page?: number;
  pageSize?: number;
  includeInactive?: boolean;
}

export function useNewsFeed(params: UseNewsFeedParams) {
  const { clientId, q, topics = [], days = 7, page = 1, pageSize = 20, includeInactive = false } = params;

  const [items, setItems] = useState<NewsItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sinceIso = useMemo(() => {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return since.toISOString();
  }, [days]);

  useEffect(() => {
    let mounted = true;

    const fetchFeed = async () => {
      if (!clientId) return;
      setLoading(true);
      setError(null);
      try {
        // Buscar todos os itens primeiro (sem filtro de data) para poder filtrar por published_at ou created_at
        let query = supabase
          .from('news_items')
          .select(`
          *,
          news_sources:source_id (
            name
          )
          `, { count: 'exact' })
          .eq('client_id', clientId)
          .gte('created_at', sinceIso); // Filtro inicial por created_at para reduzir resultados

        if (!includeInactive) {
          query = query.eq('is_active', true);
        }
        if (q && q.trim()) {
          // basic ILIKE filter on title and summary
          // Note: for production, consider pg_trgm or full-text search
          query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%`);
        }
        if (topics.length > 0) {
          // filter if any topic is present
          // Using overlap operator via RPC would be ideal; fallback to contains any by OR
          // Supabase JS doesn't support array overlap directly on JSONB array of text
          // We do a contains that requires all; to be lenient, run multiple ORs client-side later if needed
          for (const t of topics) {
            query = query.contains('topics', [t]);
          }
        }

        const { data: allData, error, count } = await query;

        if (error) {
          // Tolerar primeiro boot sem tabela no remoto (404) ou relação ausente
          const msg = String(error.message || '');
          if (msg.includes('404') || msg.includes('relation') || msg.includes('does not exist')) {
            setItems([]);
            setTotal(0);
            return;
          }
          throw error;
        }

        // Filtrar no cliente: usar published_at se disponível, senão created_at
        const filteredData = (allData || []).filter((item) => {
          const itemDate = item.published_at || item.created_at;
          return itemDate && new Date(itemDate) >= new Date(sinceIso);
        });

        // Ordenar: por published_at quando disponível, senão created_at
        filteredData.sort((a, b) => {
          const dateA = new Date(a.published_at || a.created_at || 0);
          const dateB = new Date(b.published_at || b.created_at || 0);
          return dateB.getTime() - dateA.getTime();
        });

        // Aplicar paginação
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        const data = filteredData.slice(from, to);

        if (!mounted) return;
        setItems(data || []);
        setTotal(filteredData.length);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Erro ao carregar feed');
        setItems([]);
        setTotal(0);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchFeed();
    return () => { mounted = false; };
  }, [clientId, q, topics.join('|'), sinceIso, page, pageSize, includeInactive]);

  return { items, total, loading, error };
}
