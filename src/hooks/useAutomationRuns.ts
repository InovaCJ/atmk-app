import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AutomationRun } from '@/types/automation';

export function useAutomationRuns(clientId: string | null, limit: number = 20) {
  const [runs, setRuns] = useState<AutomationRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchRuns = useCallback(async () => {
    if (!user || !clientId) {
      setRuns([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('automation_runs')
        .select(`
          *,
          automation:automations (
            name,
            category
          )
        `)
        .eq('client_id', clientId)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Cast the response to match our interface, handling potential nulls from join
      const formattedRuns: AutomationRun[] = (data || []).map((item: any) => ({
        ...item,
        automation: item.automation || { name: 'Automação removida', category: 'post' }
      }));

      setRuns(formattedRuns);
    } catch (err: any) {
      // Gracefully handle missing table during development
      if (err.code === '42P01' || err.message?.includes('does not exist')) {
        console.log('Tabela automation_runs ainda não existe');
        setRuns([]);
      } else {
        console.error('Error fetching automation runs:', err);
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [user, clientId, limit]);

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  return {
    runs,
    loading,
    error,
    refresh: fetchRuns
  };
}