import { useState, useEffect } from 'react';
import { useCompanyContext } from '@/contexts/CompanyContext';
import { supabase } from '@/integrations/supabase/client';

export const usePlanLimits = () => {
  const { selectedCompany } = useCompanyContext();
  const [generatedCount, setGeneratedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Plan limits
  const planLimits = {
    free: 10,
    premium: Infinity,
    enterprise: Infinity
  };

  const currentLimit = planLimits[selectedCompany?.plan_type as keyof typeof planLimits] || planLimits.free;

  useEffect(() => {
    const fetchGeneratedCount = async () => {
      if (!selectedCompany?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('content_calendar')
          .select('id')
          .eq('company_id', selectedCompany.id);

        if (error) {
          console.error('Error fetching generated content count:', error);
          setGeneratedCount(0);
        } else {
          setGeneratedCount(data?.length || 0);
        }
      } catch (error) {
        console.error('Error fetching generated content count:', error);
        setGeneratedCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGeneratedCount();
  }, [selectedCompany?.id]);

  const canGenerateContent = () => {
    if (selectedCompany?.plan_type === 'premium' || selectedCompany?.plan_type === 'enterprise') {
      return true;
    }
    return generatedCount < currentLimit;
  };

  const getRemainingContent = () => {
    if (selectedCompany?.plan_type === 'premium' || selectedCompany?.plan_type === 'enterprise') {
      return Infinity;
    }
    return Math.max(0, currentLimit - generatedCount);
  };

  const incrementGeneratedCount = () => {
    setGeneratedCount(prev => prev + 1);
  };

  return {
    canGenerateContent: canGenerateContent(),
    generatedCount,
    remainingContent: getRemainingContent(),
    currentLimit,
    isLoading,
    incrementGeneratedCount
  };
};