import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerationRequest {
  opportunityId: string;
  contentType: string;
  companyId: string;
}

interface CompanyKnowledge {
  company: any;
  opportunities: any[];
  knowledgeBase: any[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header to identify user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    // Initialize Supabase client with auth token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Parse request
    const { opportunityId, contentType, companyId }: GenerationRequest = await req.json();
    console.log('Generation request:', { opportunityId, contentType, companyId });

    // Gather company knowledge
    const knowledge = await gatherCompanyKnowledge(supabase, companyId, opportunityId);
    console.log('Company knowledge gathered for:', knowledge.company?.name);

    // Create specialized prompt based on content type
    const prompt = createContentPrompt(knowledge, contentType, opportunityId);
    console.log('Generated prompt for content type:', contentType);

    // Generate content with OpenAI
    const generatedContent = await generateWithOpenAI(openAIApiKey, prompt, contentType);
    console.log('Content generated successfully');

    // Save to database
    const savedContent = await saveGeneratedContent(
      supabase, 
      generatedContent, 
      companyId, 
      contentType
    );

    return new Response(
      JSON.stringify({ 
        success: true, 
        content: savedContent,
        message: 'Conteúdo gerado com sucesso!'
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function gatherCompanyKnowledge(supabase: any, companyId: string, opportunityId: string): Promise<CompanyKnowledge> {
  // Get company data
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .maybeSingle();

  if (companyError) {
    console.error('Error fetching company:', companyError);
    throw new Error('Erro ao buscar dados da empresa');
  }

  if (!company) {
    console.error('Company not found with id:', companyId);
    throw new Error('Empresa não encontrada');
  }

  // Get opportunities data
  const { data: opportunities, error: oppError } = await supabase
    .from('opportunities')
    .select('*')
    .eq('company_id', companyId)
    .limit(10);

  if (oppError) {
    console.error('Error fetching opportunities:', oppError);
  }

  // Get knowledge base
  const { data: knowledgeBase, error: kbError } = await supabase
    .from('knowledge_base')
    .select('*')
    .eq('company_id', companyId)
    .limit(20);

  if (kbError) {
    console.error('Error fetching knowledge base:', kbError);
  }

  return {
    company,
    opportunities: opportunities || [],
    knowledgeBase: knowledgeBase || []
  };
}

function createContentPrompt(knowledge: CompanyKnowledge, contentType: string, opportunityId: string): string {
  const { company } = knowledge;
  
  // Base context about the company
  let prompt = `# CONTEXTO DA EMPRESA
Nome: ${company.name}
Descrição: ${company.description || 'Não informado'}
Setor: ${company.industry || 'Não informado'}
Website: ${company.website || 'Não informado'}
Público-alvo: ${company.target_audience || 'Não informado'}
Tom de voz: ${company.brand_voice || 'Profissional e acessível'}

# KNOWLEDGE BASE
`;

  // Add knowledge base context if available
  if (knowledge.knowledgeBase.length > 0) {
    knowledge.knowledgeBase.slice(0, 5).forEach(kb => {
      prompt += `- ${kb.title}: ${kb.content.substring(0, 200)}...\n`;
    });
  } else {
    prompt += "Nenhuma base de conhecimento específica disponível.\n";
  }

  // Add specific instructions based on content type
  switch (contentType) {
    case 'social':
      prompt += `

# TAREFA: GERAR POST PARA REDES SOCIAIS
Crie um post envolvente para redes sociais que:
- Tenha uma legenda cativante com emojis estratégicos
- Inclua hashtags relevantes (máximo 10)
- Seja otimizado para engajamento
- Mantenha o tom de voz da marca
- Tenha entre 100-300 palavras
- Inclua call-to-action claro

Formato de resposta esperado:
{
  "title": "Título do post",
  "content": "Legenda completa do post",
  "hashtags": ["#hashtag1", "#hashtag2"],
  "cta": "Call to action específico"
}`;
      break;

    case 'email':
      prompt += `

# TAREFA: GERAR E-MAIL MARKETING
Crie um e-mail marketing profissional que:
- Tenha assunto irresistível (máximo 60 caracteres)
- Inclua preheader atrativo
- Conteúdo bem estruturado com seções claras
- Personalizações usando [NOME]
- Call-to-action forte e claro
- Tom alinhado com a marca

Formato de resposta esperado:
{
  "title": "Título da campanha",
  "subject": "Assunto do e-mail",
  "preheader": "Texto do preheader",
  "content": "Corpo completo do e-mail em HTML/texto"
}`;
      break;

    case 'blog':
      prompt += `

# TAREFA: GERAR ARTIGO DE BLOG
Crie um artigo completo de blog que:
- Tenha título SEO-otimizado
- Estrutura clara com H2 e H3
- Introdução envolvente
- Conteúdo informativo e valioso (800-1200 palavras)
- Conclusão com CTA
- Slug amigável para URL

Formato de resposta esperado:
{
  "title": "Título do artigo",
  "slug": "titulo-do-artigo",
  "content": "Conteúdo completo em markdown",
  "metaDescription": "Meta descrição SEO (160 chars)"
}`;
      break;

    case 'podcast':
    case 'video':  
    case 'webinar':
      prompt += `

# TAREFA: GERAR ROTEIRO PARA ${contentType.toUpperCase()}
Crie um roteiro estruturado que:
- Tenha abertura cativante
- Blocos bem definidos com tempos
- Transições naturais
- Conteúdo educativo e engajante
- Encerramento com CTA forte
- Duração aproximada: 15-30 minutos

Formato de resposta esperado:
{
  "title": "Título do roteiro",
  "content": "Roteiro completo com marcações de tempo e blocos",
  "estimatedDuration": "Duração estimada",
  "keyPoints": ["Ponto 1", "Ponto 2"]
}`;
      break;
  }

  return prompt;
}

async function generateWithOpenAI(apiKey: string, prompt: string, contentType: string): Promise<any> {
  console.log('Calling OpenAI API...');
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14', // Using reliable GPT-4 model
      messages: [
        {
          role: 'system',
          content: `Você é um assistente especializado em marketing de conteúdo e copywriting. 
                   Gere conteúdos de alta qualidade, estratégicos e alinhados com a marca.
                   SEMPRE responda em formato JSON válido conforme solicitado.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', errorText);
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const generatedText = data.choices[0].message.content;
  
  console.log('OpenAI response received');

  // Try to parse JSON response
  try {
    return JSON.parse(generatedText);
  } catch (e) {
    console.log('Response not in JSON format, using as plain text');
    return {
      title: `Conteúdo ${contentType}`,
      content: generatedText
    };
  }
}

async function saveGeneratedContent(
  supabase: any, 
  content: any, 
  companyId: string, 
  contentType: string
): Promise<any> {
  console.log('Saving generated content to database...');

  // Get user from the authenticated session
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    console.error('Error getting authenticated user:', userError);
    throw new Error('User not authenticated');
  }

  // Map content types to valid enum values
  const mapContentType = (type: string): string => {
    switch (type) {
      case 'social': return 'post';
      case 'email': return 'newsletter';
      case 'blog': return 'article';
      case 'podcast':
      case 'video':
      case 'webinar': return 'post'; // These are mapped to post for now
      default: return 'post';
    }
  };

  // Save to content_calendar table
  const contentData = {
    company_id: companyId,
    title: content.title || `Conteúdo ${contentType}`,
    content: typeof content.content === 'string' ? content.content : JSON.stringify(content),
    content_type: mapContentType(contentType),
    status: 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Add content-specific fields
  if (contentType === 'social' && content.hashtags) {
    contentData.hashtags = content.hashtags;
  }

  if (contentType === 'blog' && content.slug) {
    contentData.platform = ['blog'];
  }

  const { data, error } = await supabase
    .from('content_calendar')
    .insert(contentData)
    .select()
    .single();

  if (error) {
    console.error('Error saving content:', error);
    throw new Error('Erro ao salvar conteúdo gerado');
  }

  // Also save to ai_generations for tracking
  await supabase
    .from('ai_generations')
    .insert({
      user_id: user.id,
      company_id: companyId,
      prompt: `Generated ${contentType} content`,
      generated_content: JSON.stringify(content),
      ai_model: 'gpt-4.1-2025-04-14',
      generation_time_ms: null,
      cost_estimate: null,
      tokens_used: null
    });

  console.log('Content saved successfully:', data.id);
  return data;
}