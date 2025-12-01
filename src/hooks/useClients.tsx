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
    if (!user) {
      setClients([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes');
      setClients([]); // Em caso de erro, retorna array vazio
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (clientData: CreateClientRequest) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          ...clientData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as client_admin
      await supabase
        .from('client_members')
        .insert({
          client_id: data.id,
          user_id: user.id,
          role: 'client_admin',
        });

      setClients(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating client:', err);
      throw err;
    }
  };

  const updateClient = async (clientId: string, updates: UpdateClientRequest) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', clientId)
        .select()
        .single();

      if (error) throw error;

      setClients(prev =>
        prev.map(client =>
          client.id === clientId ? { ...client, ...data } : client
        )
      );

      return data;
    } catch (err) {
      console.error('Error updating client:', err);
      throw err;
    }
  };

  const deleteClient = async (clientId: string) => {
    try {
      const { error } = await supabase
        .from('clients')
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
      // Get original client
      const { data: originalClient, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (fetchError) throw fetchError;

      // Create new client
      const { data: newClient, error: createError } = await supabase
        .from('clients')
        .insert({
          name: newName,
          slug: newSlug,
          plan: originalClient.plan,
          created_by: user.id,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Add creator as client_admin
      await supabase
        .from('client_members')
        .insert({
          client_id: newClient.id,
          user_id: user.id,
          role: 'client_admin',
        });

      // Copy settings if they exist
      const { data: settings } = await supabase
        .from('client_settings')
        .select('*')
        .eq('client_id', clientId)
        .single();

      if (settings) {
        await supabase
          .from('client_settings')
          .insert({
            client_id: newClient.id,
            tone_of_voice: settings.tone_of_voice,
            style_guidelines: settings.style_guidelines,
            prompt_directives: settings.prompt_directives,
            locale: settings.locale,
            duplication_of: clientId,
          });
      }

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
    hasClients: clients?.length > 0,
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
