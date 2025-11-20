// New hook: useFeaturedTopics
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FeaturedTopic {
  term: string;
  count: number;
}

export function useFeaturedTopics(clientId: string, days: number = 7, limit: number = 10) {
  const [topics, setTopics] = useState<FeaturedTopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);
  const refresh = () => setRefreshIndex(i => i + 1);

  const sinceIso = useMemo(() => {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return since.toISOString();
  }, [days]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!clientId) return;
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('news_items')
          .select('topics')
          .eq('client_id', clientId)
          .eq('is_active', true)
          .gte('published_at', sinceIso)
          .limit(2000);
        if (error) {
          const msg = String(error.message || '');
          if (msg.includes('404') || msg.includes('relation') || msg.includes('does not exist')) {
            setTopics([]);
            return;
          }
          throw error;
        }
        console.log({ featuredTopics: data, clientId });
        const counts = new Map<string, number>();
        for (const row of data || []) {
          const arr = Array.isArray(row.topics) ? row.topics as string[] : [];
          for (const t of arr) {
            counts.set(t, (counts.get(t) || 0) + 1);
          }
        }
        const ranked = Array.from(counts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, limit)
          .map(([term, count]) => ({ term, count }));

        if (!mounted) return;
        setTopics(ranked);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Erro ao carregar temas');
        setTopics([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [clientId, sinceIso, limit, refreshIndex]);

  return { topics, loading, error, refreshFeaturedTopics: refresh };
}
