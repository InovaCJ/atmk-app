import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Client, CreateClientRequest, UpdateClientRequest } from '@/types/clients';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchClients = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // TEMPORÁRIO: Usar tabela companies em vez de clients
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Converter dados de companies para o formato de clients
      const convertedClients = (data || []).map(company => ({
        id: company.id,
        slug: company.name.toLowerCase().replace(/\s+/g, '-'),
        name: company.name,
        created_by: company.owner_id,
        created_at: company.created_at,
        updated_at: company.updated_at,
        status: 'active' as const,
        plan: company.plan_type,
        brand_voice: company.brand_voice,
        description: company.description,
        industry: company.industry,
        logo_url: company.logo_url,
        target_audience: company.target_audience,
        website: company.website,
        plan_expires_at: company.plan_expires_at,
      }));
      
      setClients(convertedClients);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (clientData: CreateClientRequest) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      // TEMPORÁRIO: Usar tabela companies em vez de clients
      const { data, error } = await supabase
        .from('companies')
        .insert({
          name: clientData.name,
          description: clientData.description,
          website: clientData.website,
          industry: clientData.industry,
          target_audience: clientData.target_audience,
          brand_voice: clientData.brand_voice,
          logo_url: clientData.logo_url,
          plan_type: clientData.plan || 'free',
          plan_expires_at: clientData.plan_expires_at,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Converter dados de companies para o formato de clients
      const convertedClient = {
        id: data.id,
        slug: data.name.toLowerCase().replace(/\s+/g, '-'),
        name: data.name,
        created_by: data.owner_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        status: 'active' as const,
        plan: data.plan_type,
        brand_voice: data.brand_voice,
        description: data.description,
        industry: data.industry,
        logo_url: data.logo_url,
        target_audience: data.target_audience,
        website: data.website,
        plan_expires_at: data.plan_expires_at,
      };

      setClients(prev => [convertedClient, ...prev]);
      return convertedClient;
    } catch (err) {
      console.error('Error creating client:', err);
      throw err;
    }
  };

  const updateClient = async (clientId: string, updates: UpdateClientRequest) => {
    try {
      // TEMPORÁRIO: Usar tabela companies em vez de clients
      const { data, error } = await supabase
        .from('companies')
        .update({
          name: updates.name,
          description: updates.description,
          website: updates.website,
          industry: updates.industry,
          target_audience: updates.target_audience,
          brand_voice: updates.brand_voice,
          logo_url: updates.logo_url,
          plan_type: updates.plan,
          plan_expires_at: updates.plan_expires_at,
          updated_at: new Date().toISOString(),
        })
        .eq('id', clientId)
        .select()
        .single();

      if (error) throw error;

      // Converter dados de companies para o formato de clients
      const convertedClient = {
        id: data.id,
        slug: data.name.toLowerCase().replace(/\s+/g, '-'),
        name: data.name,
        created_by: data.owner_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        status: 'active' as const,
        plan: data.plan_type,
        brand_voice: data.brand_voice,
        description: data.description,
        industry: data.industry,
        logo_url: data.logo_url,
        target_audience: data.target_audience,
        website: data.website,
        plan_expires_at: data.plan_expires_at,
      };

      setClients(prev => 
        prev.map(client => 
          client.id === clientId ? { ...client, ...convertedClient } : client
        )
      );

      return convertedClient;
    } catch (err) {
      console.error('Error updating client:', err);
      throw err;
    }
  };

  const deleteClient = async (clientId: string) => {
    try {
      // TEMPORÁRIO: Usar tabela companies em vez de clients
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', clientId);

      if (error) throw error;

      setClients(prev => prev.filter(client => client.id !== clientId));
    } catch (err) {
      console.error('Error deleting client:', err);
      throw err;
    }
  };

  const duplicateClient = async (clientId: string, newName: string, newSlug: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      // TEMPORÁRIO: Usar tabela companies em vez de clients
      // Get original client
      const { data: originalClient, error: fetchError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', clientId)
        .single();

      if (fetchError) throw fetchError;

      // Create new client
      const { data: newClient, error: createError } = await supabase
        .from('companies')
        .insert({
          name: newName,
          description: originalClient.description,
          website: originalClient.website,
          industry: originalClient.industry,
          target_audience: originalClient.target_audience,
          brand_voice: originalClient.brand_voice,
          logo_url: originalClient.logo_url,
          plan_type: originalClient.plan_type,
          plan_expires_at: originalClient.plan_expires_at,
          owner_id: user.id,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Converter dados de companies para o formato de clients
      const convertedClient = {
        id: newClient.id,
        slug: newClient.name.toLowerCase().replace(/\s+/g, '-'),
        name: newClient.name,
        created_by: newClient.owner_id,
        created_at: newClient.created_at,
        updated_at: newClient.updated_at,
        status: 'active' as const,
        plan: newClient.plan_type,
        brand_voice: newClient.brand_voice,
        description: newClient.description,
        industry: newClient.industry,
        logo_url: newClient.logo_url,
        target_audience: newClient.target_audience,
        website: newClient.website,
        plan_expires_at: newClient.plan_expires_at,
      };

      setClients(prev => [convertedClient, ...prev]);
      return convertedClient;
    } catch (err) {
      console.error('Error duplicating client:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchClients();
  }, [user]);

  return {
    clients,
    loading,
    error,
    createClient,
    updateClient,
    deleteClient,
    duplicateClient,
    refetch: fetchClients,
  };
}
