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

      // TEMPORÁRIO: Usar dados mockados até resolver o problema de RLS
      const mockClients: Client[] = [
        {
          id: '1',
          slug: 'cliente-exemplo',
          name: 'Cliente Exemplo',
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'active',
          plan: 'free',
          brand_voice: 'Claro e objetivo',
          description: 'Descrição do cliente exemplo',
          industry: 'Tecnologia',
          logo_url: null,
          target_audience: 'Empresas de tecnologia',
          website: 'https://exemplo.com',
          plan_expires_at: null,
        },
        {
          id: '2',
          slug: 'outro-cliente',
          name: 'Outro Cliente',
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'active',
          plan: 'pro',
          brand_voice: 'Profissional e confiável',
          description: 'Descrição do outro cliente',
          industry: 'Marketing',
          logo_url: null,
          target_audience: 'Pequenas empresas',
          website: 'https://outrocliente.com',
          plan_expires_at: null,
        }
      ];
      
      setClients(mockClients);
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
      // TEMPORÁRIO: Simular criação de cliente
      const newClient: Client = {
        id: Date.now().toString(),
        slug: clientData.name.toLowerCase().replace(/\s+/g, '-'),
        name: clientData.name,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'active',
        plan: clientData.plan || 'free',
        brand_voice: clientData.brand_voice,
        description: clientData.description,
        industry: clientData.industry,
        logo_url: clientData.logo_url,
        target_audience: clientData.target_audience,
        website: clientData.website,
        plan_expires_at: clientData.plan_expires_at,
      };

      setClients(prev => [newClient, ...prev]);
      return newClient;
    } catch (err) {
      console.error('Error creating client:', err);
      throw err;
    }
  };

  const updateClient = async (clientId: string, updates: UpdateClientRequest) => {
    try {
      // TEMPORÁRIO: Simular atualização de cliente
      const updatedClient = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      setClients(prev => 
        prev.map(client => 
          client.id === clientId ? { ...client, ...updatedClient } : client
        )
      );

      return updatedClient;
    } catch (err) {
      console.error('Error updating client:', err);
      throw err;
    }
  };

  const deleteClient = async (clientId: string) => {
    try {
      // TEMPORÁRIO: Simular exclusão de cliente
      setClients(prev => prev.filter(client => client.id !== clientId));
    } catch (err) {
      console.error('Error deleting client:', err);
      throw err;
    }
  };

  const duplicateClient = async (clientId: string, newName: string, newSlug: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      // TEMPORÁRIO: Simular duplicação de cliente
      const originalClient = clients.find(c => c.id === clientId);
      if (!originalClient) throw new Error('Cliente não encontrado');

      const newClient: Client = {
        id: Date.now().toString(),
        slug: newSlug,
        name: newName,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'active',
        plan: originalClient.plan,
        brand_voice: originalClient.brand_voice,
        description: originalClient.description,
        industry: originalClient.industry,
        logo_url: originalClient.logo_url,
        target_audience: originalClient.target_audience,
        website: originalClient.website,
        plan_expires_at: originalClient.plan_expires_at,
      };

      setClients(prev => [newClient, ...prev]);
      return newClient;
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