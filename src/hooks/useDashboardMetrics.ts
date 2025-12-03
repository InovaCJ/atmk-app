import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useClientContext } from '@/contexts/ClientContext';

export interface DashboardMetrics {
  availableThemes: {
    value: number | string;
    period: string;
    status: 'ok' | 'error';
    subtitle?: string;
  };
  totalContents: {
    value: number | string;
    period: string;
    status: 'ok' | 'error';
    subtitle?: string;
  };
  automatedContents: {
    value: number | string;
    period: string;
    status: 'ok' | 'error';
    subtitle?: string;
  };
  timeSaved: {
    value: string;
    raw_hours: number;
    period: string;
    status: 'ok' | 'error';
    subtitle?: string;
  };
}

const TIME_PER_CONTENT_MINUTES = 20; // Configurável

export function useDashboardMetrics(startDate: Date, endDate: Date) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedClientId } = useClientContext();

  const periodString = useMemo(() => {
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };
    return `${formatDate(startDate)} a ${formatDate(endDate)}`;
  }, [startDate, endDate]);

  const startDateISO = useMemo(() => startDate.toISOString(), [startDate]);
  const endDateISO = useMemo(() => endDate.toISOString(), [endDate]);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!selectedClientId) {
        setMetrics(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 1. Temas Disponíveis - Notícias ativas no período do cliente selecionado
        let availableThemesCount = 0;
        let availableThemesError = false;
        try {
          // Buscar notícias ativas do cliente no período
          // Usa published_at se disponível, caso contrário created_at
          const { data: newsItems, error: themesError } = await supabase
            .from('news_items')
            .select('id, published_at, created_at')
            .eq('client_id', selectedClientId)
            .eq('is_active', true);

          if (themesError) throw themesError;

          // Filtrar por período usando published_at ou created_at
          const filteredItems = (newsItems || []).filter((item: { published_at?: string | null; created_at?: string | null }) => {
            const dateToUse = item.published_at || item.created_at;
            if (!dateToUse) return false;
            const itemDate = new Date(dateToUse);
            return itemDate >= startDate && itemDate <= endDate;
          });

          availableThemesCount = filteredItems.length;
        } catch (err) {
          console.error('Error fetching available themes:', err);
          availableThemesError = true;
        }

        // 2. Conteúdos Gerados (todos) - Filtrar diretamente por client_id
        let totalContentsCount = 0;
        let totalContentsError = false;
        try {
          // Buscar todos os conteúdos do cliente no período
          const { data: contents, error: contentsError, count } = await supabase
            .from('generated_content')
            .select('id', { count: 'exact' })
            .eq('client_id', selectedClientId)
            .gte('created_at', startDateISO)
            .lte('created_at', endDateISO);

          if (contentsError) throw contentsError;
          totalContentsCount = count || 0;
        } catch (err) {
          console.error('Error fetching total contents:', err);
          totalContentsError = true;
        }

        // 3. Conteúdos Automáticos - Filtrar por automações do cliente
        let automatedContentsCount = 0;
        let automatedContentsError = false;
        try {
          // Primeiro, buscar IDs das automações do cliente
          const { data: automations, error: automationsError } = await supabase
            .from('automations')
            .select('id')
            .eq('client_id', selectedClientId);

          if (automationsError) throw automationsError;
          const automationIds = (automations || []).map(a => a.id);

          if (automationIds.length > 0) {
            const { data: automatedContents, error: automatedError } = await supabase
              .from('automation_queue')
              .select('generated_content_id, created_at')
              .in('automation_id', automationIds)
              .not('generated_content_id', 'is', null)
              .gte('created_at', startDateISO)
              .lte('created_at', endDateISO);

            if (automatedError && !automatedError.message.includes('does not exist')) {
              throw automatedError;
            }
            automatedContentsCount = (automatedContents || []).length;
          }
        } catch (err) {
          console.error('Error fetching automated contents:', err);
          automatedContentsError = true;
        }

        // 4. Tempo Economizado - Baseado em conteúdos automáticos do cliente
        let timeSavedHours = 0;
        let timeSavedError = false;
        try {
          // Primeiro, buscar IDs das automações do cliente
          const { data: automations, error: automationsError } = await supabase
            .from('automations')
            .select('id')
            .eq('client_id', selectedClientId);

          if (automationsError) throw automationsError;
          const automationIds = (automations || []).map(a => a.id);

          if (automationIds.length > 0) {
            const { data: automatedContents, error: timeError } = await supabase
              .from('automation_queue')
              .select('generated_content_id, created_at')
              .in('automation_id', automationIds)
              .not('generated_content_id', 'is', null)
              .gte('created_at', startDateISO)
              .lte('created_at', endDateISO);

            if (timeError && !timeError.message.includes('does not exist')) {
              throw timeError;
            }
            const automatedCount = (automatedContents || []).length;
            const totalMinutes = automatedCount * TIME_PER_CONTENT_MINUTES;
            timeSavedHours = totalMinutes / 60;
          }
        } catch (err) {
          console.error('Error calculating time saved:', err);
          timeSavedError = true;
        }

        // Montar resposta
        const result: DashboardMetrics = {
          availableThemes: {
            value: availableThemesError ? '—' : availableThemesCount,
            period: periodString,
            status: availableThemesError ? 'error' : 'ok',
            subtitle: availableThemesError
              ? 'Sem dados disponíveis'
              : availableThemesCount === 0
              ? 'Nenhum tema disponível no período'
              : undefined,
          },
          totalContents: {
            value: totalContentsError ? '—' : totalContentsCount,
            period: periodString,
            status: totalContentsError ? 'error' : 'ok',
            subtitle: totalContentsError
              ? 'Sem dados disponíveis'
              : totalContentsCount === 0
              ? 'Nenhum conteúdo criado no período'
              : undefined,
          },
          automatedContents: {
            value: automatedContentsError ? '—' : automatedContentsCount,
            period: periodString,
            status: automatedContentsError ? 'error' : 'ok',
            subtitle: automatedContentsError
              ? 'Sem dados disponíveis'
              : automatedContentsCount === 0
              ? 'Nenhuma automação gerou conteúdo'
              : undefined,
          },
          timeSaved: {
            value: timeSavedError
              ? '—'
              : timeSavedHours === 0
              ? '0h'
              : `${timeSavedHours.toFixed(1)}h`,
            raw_hours: timeSavedHours,
            period: periodString,
            status: timeSavedError ? 'error' : 'ok',
            subtitle: timeSavedError
              ? 'Sem dados disponíveis'
              : timeSavedHours === 0
              ? 'Nenhuma automação ativa'
              : undefined,
          },
        };

        setMetrics(result);
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar métricas');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [startDateISO, endDateISO, periodString, selectedClientId, startDate, endDate]);

  return { metrics, loading, error };
}

