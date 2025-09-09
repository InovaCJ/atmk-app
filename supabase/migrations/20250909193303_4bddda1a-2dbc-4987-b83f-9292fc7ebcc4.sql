-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE public.plan_type AS ENUM ('free', 'pro', 'business');
CREATE TYPE public.content_status AS ENUM ('draft', 'scheduled', 'published', 'failed');
CREATE TYPE public.ai_model AS ENUM ('openai_gpt4', 'openai_gpt35', 'google_gemini', 'perplexity', 'deepseek', 'claude', 'grok');
CREATE TYPE public.content_type AS ENUM ('post', 'story', 'reel', 'article', 'newsletter');

-- Create profiles table for users
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  industry TEXT,
  target_audience TEXT,
  brand_voice TEXT,
  logo_url TEXT,
  plan_type plan_type NOT NULL DEFAULT 'free',
  plan_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create knowledge_base table for storing company knowledge
CREATE TABLE public.knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT, -- 'document', 'url', 'text', etc.
  source_url TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content_calendar table for scheduled content
CREATE TABLE public.content_calendar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type content_type NOT NULL DEFAULT 'post',
  platform TEXT[], -- ['instagram', 'tiktok', 'facebook', etc.]
  scheduled_for TIMESTAMP WITH TIME ZONE,
  status content_status NOT NULL DEFAULT 'draft',
  ai_model ai_model,
  hashtags TEXT[],
  media_urls TEXT[],
  engagement_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trends_data table for storing Google Trends data
CREATE TABLE public.trends_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  search_volume INTEGER,
  trend_score DECIMAL(5,2),
  region TEXT DEFAULT 'BR',
  timeframe TEXT DEFAULT '7d', -- '1d', '7d', '30d', '90d', '12m'
  related_keywords TEXT[],
  opportunity_score DECIMAL(5,2),
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create opportunities table for web scraping results
CREATE TABLE public.opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  source_platform TEXT NOT NULL, -- 'google_news', 'instagram', 'tiktok'
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  content TEXT,
  keywords TEXT[],
  sentiment_score DECIMAL(3,2), -- -1 to 1
  relevance_score DECIMAL(5,2), -- 0 to 100
  engagement_metrics JSONB DEFAULT '{}',
  scraped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ai_generations table for tracking AI usage
CREATE TABLE public.ai_generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ai_model ai_model NOT NULL,
  prompt TEXT NOT NULL,
  generated_content TEXT NOT NULL,
  tokens_used INTEGER,
  cost_estimate DECIMAL(10,4),
  generation_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create api_integrations table for storing API keys and configs
CREATE TABLE public.api_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'openai', 'google', 'perplexity', 'apify', etc.
  api_key_encrypted TEXT, -- Will be encrypted
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, provider)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trends_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_integrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for companies
CREATE POLICY "Users can view their own companies" 
ON public.companies 
FOR SELECT 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create companies" 
ON public.companies 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own companies" 
ON public.companies 
FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own companies" 
ON public.companies 
FOR DELETE 
USING (auth.uid() = owner_id);

-- Create RLS policies for knowledge_base
CREATE POLICY "Users can access knowledge base of their companies" 
ON public.knowledge_base 
FOR ALL
USING (
  company_id IN (
    SELECT id FROM public.companies WHERE owner_id = auth.uid()
  )
);

-- Create RLS policies for content_calendar
CREATE POLICY "Users can access content calendar of their companies" 
ON public.content_calendar 
FOR ALL
USING (
  company_id IN (
    SELECT id FROM public.companies WHERE owner_id = auth.uid()
  )
);

-- Create RLS policies for trends_data
CREATE POLICY "Users can access trends data of their companies" 
ON public.trends_data 
FOR ALL
USING (
  company_id IN (
    SELECT id FROM public.companies WHERE owner_id = auth.uid()
  )
);

-- Create RLS policies for opportunities
CREATE POLICY "Users can access opportunities of their companies" 
ON public.opportunities 
FOR ALL
USING (
  company_id IN (
    SELECT id FROM public.companies WHERE owner_id = auth.uid()
  )
);

-- Create RLS policies for ai_generations
CREATE POLICY "Users can view their AI generations" 
ON public.ai_generations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create AI generations for their companies" 
ON public.ai_generations 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  company_id IN (
    SELECT id FROM public.companies WHERE owner_id = auth.uid()
  )
);

-- Create RLS policies for api_integrations
CREATE POLICY "Users can manage API integrations of their companies" 
ON public.api_integrations 
FOR ALL
USING (
  company_id IN (
    SELECT id FROM public.companies WHERE owner_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX idx_companies_owner_id ON public.companies(owner_id);
CREATE INDEX idx_knowledge_base_company_id ON public.knowledge_base(company_id);
CREATE INDEX idx_content_calendar_company_id ON public.content_calendar(company_id);
CREATE INDEX idx_content_calendar_scheduled_for ON public.content_calendar(scheduled_for);
CREATE INDEX idx_trends_data_company_id ON public.trends_data(company_id);
CREATE INDEX idx_trends_data_keyword ON public.trends_data(keyword);
CREATE INDEX idx_opportunities_company_id ON public.opportunities(company_id);
CREATE INDEX idx_opportunities_scraped_at ON public.opportunities(scraped_at);
CREATE INDEX idx_ai_generations_company_id ON public.ai_generations(company_id);
CREATE INDEX idx_ai_generations_user_id ON public.ai_generations(user_id);
CREATE INDEX idx_api_integrations_company_id ON public.api_integrations(company_id);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email
  );
  RETURN new;
END;
$$;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_knowledge_base_updated_at
  BEFORE UPDATE ON public.knowledge_base
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_calendar_updated_at
  BEFORE UPDATE ON public.content_calendar
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_api_integrations_updated_at
  BEFORE UPDATE ON public.api_integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();