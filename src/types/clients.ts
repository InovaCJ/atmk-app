// Types for the multi-tenant clients system

export type ID = string;

export interface User {
  id: ID;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: ID;
  slug: string;
  name: string;
  created_by: ID;
  created_at: string;
  updated_at: string;
  status: 'active' | 'archived';
  plan: 'free' | 'pro' | 'business';
  
  // Legacy fields for migration
  brand_voice?: string;
  description?: string;
  industry?: string;
  logo_url?: string;
  target_audience?: string;
  website?: string;
  plan_expires_at?: string;
}

export interface ClientMember {
  id: ID;
  client_id: ID;
  user_id: ID;
  role: 'client_admin' | 'editor' | 'viewer';
  created_at: string;
  
  // Joined data
  user?: User;
}

export interface ClientInvite {
  id: ID;
  client_id: ID;
  email: string;
  role: 'client_admin' | 'editor' | 'viewer';
  invited_by: ID;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  token: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  inviter?: User;
  client?: Client;
}

export interface SearchTerm {
  id: string;
  term: string;
  enabled: boolean;
}

export interface SearchFrequency {
  id: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
}

export interface ClientSettings {
  id: ID;
  client_id: ID;
  tone_of_voice?: string;
  style_guidelines?: string;
  prompt_directives?: string;
  locale?: string;
  duplication_of?: ID | null;
  search_terms?: SearchTerm[];
  search_frequencies?: SearchFrequency[];
  created_at: string;
  updated_at: string;
}

export interface ClientInput {
  id: ID;
  client_id: ID;
  type: 'text' | 'file' | 'url' | 'structured';
  title?: string;
  content_text?: string;
  file_ref?: string;
  url?: string;
  metadata?: Record<string, any>;
  created_by: ID;
  created_at: string;
  updated_at: string;
  
  // Joined data
  user?: User;
}

export interface KnowledgeBase {
  id: ID;
  client_id: ID;
  name: string;
  indexing_policy: 'fulltext+embeddings' | 'raw';
  vector_store: 'pgvector' | 'pinecone' | 'qdrant' | 'weaviate';
  created_at: string;
  updated_at: string;
}

export interface KBItem {
  id: ID;
  kb_id: ID;
  client_id: ID;
  source_type: 'input' | 'url' | 'file' | 'news' | 'manual';
  source_ref?: string;
  chunk_id?: string;
  text: string;
  embeddings_ref?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface NewsSource {
  id: ID;
  client_id: ID;
  name: string;
  type: 'rss' | 'api' | 'scraper';
  url?: string;
  api_config?: Record<string, any>;
  schedule: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface SearchIntegration {
  id: ID;
  client_id: ID;
  provider: 'serpapi' | 'tavily' | 'bing' | 'custom';
  api_key_ref: string;
  daily_quota?: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgentProfile {
  id: ID;
  client_id: ID;
  name: string;
  system_prompt: string;
  tools: string[];
  rate_limits?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SearchUsage {
  id: ID;
  client_id: ID;
  provider: 'serpapi' | 'tavily' | 'bing' | 'custom';
  tokens_used: number;
  calls_made: number;
  cost_cents: number;
  created_at: string;
}

// API Response types
export interface CreateClientRequest {
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'business';
  tone_of_voice?: string;
  style_guidelines?: string;
  prompt_directives?: string;
  locale?: string;
  duplication_of?: ID;
}

export interface UpdateClientRequest {
  name?: string;
  slug?: string;
  plan?: 'free' | 'pro' | 'business';
  status?: 'active' | 'archived';
  brand_voice?: string;
  description?: string;
  industry?: string;
  logo_url?: string;
  target_audience?: string;
  website?: string;
}

export interface CreateClientMemberRequest {
  email: string;
  role: 'client_admin' | 'editor' | 'viewer';
}

export interface CreateClientInviteRequest {
  email: string;
  role: 'client_admin' | 'editor' | 'viewer';
}

export interface AcceptInviteRequest {
  token: string;
}

export interface CreateClientInputRequest {
  type: 'text' | 'file' | 'url' | 'structured';
  title?: string;
  content_text?: string;
  file_ref?: string;
  url?: string;
  metadata?: Record<string, any>;
}

export interface CreateNewsSourceRequest {
  name: string;
  type: 'rss' | 'api' | 'scraper';
  url?: string;
  api_config?: Record<string, any>;
  schedule?: string;
  enabled?: boolean;
}

export interface CreateSearchIntegrationRequest {
  provider: 'serpapi' | 'tavily' | 'bing' | 'custom';
  api_key: string;
  daily_quota?: number;
  enabled?: boolean;
}

export interface CreateAgentProfileRequest {
  name: string;
  system_prompt: string;
  tools?: string[];
  rate_limits?: Record<string, any>;
}

// Permission types
export type Permission = 
  | 'clients:create'
  | 'clients:read'
  | 'clients:update'
  | 'clients:delete'
  | 'clients:duplicate'
  | 'client.members:manage'
  | 'client.kb:write'
  | 'client.kb:read'
  | 'client.kb:ingest'
  | 'client.integrations:manage';

export interface UserPermissions {
  userId: ID;
  permissions: Permission[];
  clientRoles: Record<ID, 'client_admin' | 'editor' | 'viewer'>;
  isOwner: boolean;
}
