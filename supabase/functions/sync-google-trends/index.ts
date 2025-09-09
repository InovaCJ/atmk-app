import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { sheetUrl, companyId } = await req.json();
    
    if (!sheetUrl || !companyId) {
      return new Response(
        JSON.stringify({ error: 'sheetUrl e companyId são obrigatórios' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Extract Google Sheets ID from URL
    const sheetIdMatch = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!sheetIdMatch) {
      return new Response(
        JSON.stringify({ error: 'URL do Google Sheets inválida' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const sheetId = sheetIdMatch[1];
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

    console.log('Fetching data from Google Sheets:', csvUrl);

    // Fetch data from Google Sheets
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: 'Erro ao acessar Google Sheets. Certifique-se que está público.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const csvData = await response.text();
    console.log('CSV data received:', csvData.substring(0, 200) + '...');

    // Parse CSV data
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/\"/g, '').trim());
    
    console.log('Headers found:', headers);

    const trends = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.replace(/\"/g, '').trim());
      
      if (values.length >= 4 && values[0]) { // Ensure we have enough data
        const trend = {
          company_id: companyId,
          keyword: values[0] || '',
          search_volume: parseInt(values[1]) || 0,
          trend_score: parseFloat(values[2]) || 0,
          region: values[3] || 'BR',
          timeframe: values[4] || '7d',
          related_keywords: values[5] ? values[5].split(';').filter(k => k.trim()) : [],
          opportunity_score: parseFloat(values[6]) || 0,
          fetched_at: new Date().toISOString()
        };
        
        trends.push(trend);
      }
    }

    console.log('Parsed trends:', trends.length, 'items');

    if (trends.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Nenhum dado válido encontrado no Google Sheets' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Clear existing trends for this company (optional - remove if you want to keep historical data)
    const { error: deleteError } = await supabaseClient
      .from('trends_data')
      .delete()
      .eq('company_id', companyId);

    if (deleteError) {
      console.error('Error clearing old trends:', deleteError);
    }

    // Insert new trends data
    const { data: insertedData, error: insertError } = await supabaseClient
      .from('trends_data')
      .insert(trends)
      .select();

    if (insertError) {
      console.error('Error inserting trends:', insertError);
      return new Response(
        JSON.stringify({ error: 'Erro ao salvar dados no banco', details: insertError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('Successfully inserted trends:', insertedData?.length);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${trends.length} tendências importadas com sucesso`,
        data: insertedData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in sync-google-trends function:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
