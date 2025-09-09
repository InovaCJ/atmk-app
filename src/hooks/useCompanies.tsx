import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type PlanType = 'free' | 'pro' | 'business';

interface Company {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  website: string | null;
  industry: string | null;
  target_audience: string | null;
  brand_voice: string | null;
  logo_url: string | null;
  plan_type: PlanType;
  plan_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchCompanies();
    } else {
      setCompanies([]);
      setLoading(false);
    }
  }, [user]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching companies:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar empresas.",
          variant: "destructive"
        });
        return;
      }

      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar empresas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async (companyData: Omit<Company, 'id' | 'owner_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('companies')
        .insert({
          ...companyData,
          owner_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating company:', error);
        toast({
          title: "Erro",
          description: "Erro ao criar empresa.",
          variant: "destructive"
        });
        return;
      }

      setCompanies(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Empresa criada com sucesso!"
      });
      
      return data;
    } catch (error) {
      console.error('Error creating company:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar empresa.",
        variant: "destructive"
      });
    }
  };

  const updateCompany = async (id: string, updates: Partial<Company>) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating company:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar empresa.",
          variant: "destructive"
        });
        return;
      }

      setCompanies(prev => prev.map(company => 
        company.id === id ? data : company
      ));
      
      toast({
        title: "Sucesso",
        description: "Empresa atualizada com sucesso!"
      });
      
      return data;
    } catch (error) {
      console.error('Error updating company:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar empresa.",
        variant: "destructive"
      });
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting company:', error);
        toast({
          title: "Erro",
          description: "Erro ao excluir empresa.",
          variant: "destructive"
        });
        return;
      }

      setCompanies(prev => prev.filter(company => company.id !== id));
      toast({
        title: "Sucesso",
        description: "Empresa excluída com sucesso!"
      });
    } catch (error) {
      console.error('Error deleting company:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao excluir empresa.",
        variant: "destructive"
      });
    }
  };

  return {
    companies,
    loading,
    createCompany,
    updateCompany,
    deleteCompany,
    refreshCompanies: fetchCompanies
  };
};