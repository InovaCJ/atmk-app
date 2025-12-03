import { useState, useEffect } from 'react';
import { useClientContext } from '@/contexts/ClientContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const usePlanLimits = () => {
  const { selectedClient } = useClientContext();
  const { user } = useAuth();
  const [generatedCount, setGeneratedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Plan limits
  const planLimits = {
    free: 10,
    premium: Infinity,
    enterprise: Infinity
  };

  const currentLimit = planLimits[selectedClient?.plan as keyof typeof planLimits] || planLimits.free;

  useEffect(() => {
    const fetchGeneratedCount = async () => {
      if (!selectedClient?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('generated_content')
          .select('id')
          .eq('user_id', user?.id);
        // .eq('client_id', selectedClient.id);

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
  }, [selectedClient?.id]);

  const canGenerateContent = () => {
    if (selectedClient?.plan === 'pro' || selectedClient?.plan === 'business') {
      return true;
    }
    return generatedCount < currentLimit;
  };

  const getRemainingContent = () => {
    if (selectedClient?.plan === 'pro' || selectedClient?.plan === 'business') {
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