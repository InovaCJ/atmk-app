# 📈 Guia Completo: Google Trends + Supabase Integration

## 🎯 **Visão Geral**

Esta integração permite coletar dados do Google Trends automaticamente usando Google Apps Script + Google Sheets, depois importar para o Supabase, e conectar com Looker Studio para dashboards.

**Fluxo:** Google Apps Script → Google Sheets → Supabase → Looker Studio

## 🚀 **Passo 1: Criar Google Apps Script**

### 1.1 Acesse o Google Apps Script
- Vá para [script.google.com](https://script.google.com)
- Clique em "Novo projeto"
- Renomeie para "Google Trends Collector"

### 1.2 Código do Apps Script
Cole este código no editor:

```javascript
/**
 * Google Apps Script para coletar dados do Google Trends
 * Autor: ATMK Platform
 */

function collectTrendsData() {
  const sheet = SpreadsheetApp.getActiveSheet();
  
  // Limpar dados antigos
  sheet.clear();
  
  // Cabeçalhos obrigatórios (não altere a ordem!)
  const headers = [
    'Keyword',
    'Search Volume', 
    'Trend Score',
    'Region',
    'Timeframe',
    'Related Keywords',
    'Opportunity Score'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // 🔥 DADOS DE EXEMPLO - SUBSTITUA POR SUA LÓGICA
  const trendsData = [
    ['marketing digital', 85000, 92.5, 'BR', '7d', 'seo;sem;marketing online', 88.0],
    ['inteligência artificial', 125000, 95.8, 'BR', '7d', 'ia;machine learning;chatbot', 94.2],
    ['automação marketing', 45000, 78.3, 'BR', '7d', 'email marketing;crm;leads', 82.1],
    ['conteúdo viral', 32000, 85.7, 'BR', '7d', 'viral marketing;redes sociais;engajamento', 79.5],
    ['tendências 2024', 67000, 88.9, 'BR', '7d', 'previsões;futuro;inovação', 86.3],
    ['e-commerce brasil', 95000, 87.2, 'BR', '7d', 'loja online;vendas;marketplace', 85.6],
    ['marketing influencer', 42000, 91.4, 'BR', '7d', 'creator economy;parcerias;brand', 89.7],
    ['seo local', 38000, 83.9, 'BR', '7d', 'google my business;busca local;maps', 81.3],
    ['automação vendas', 55000, 86.1, 'BR', '7d', 'crm;pipeline;funil vendas', 84.8],
    ['marketing b2b', 71000, 89.3, 'BR', '7d', 'lead generation;sales;enterprise', 87.5]
  ];
  
  // Inserir dados
  if (trendsData.length > 0) {
    sheet.getRange(2, 1, trendsData.length, headers.length).setValues(trendsData);
  }
  
  // 🎨 Formatação da planilha
  // Cabeçalho azul
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#4285f4')
    .setFontColor('white')
    .setFontWeight('bold');
  
  // Auto-redimensionar colunas
  sheet.autoResizeColumns(1, headers.length);
  
  // Adicionar bordas
  sheet.getRange(1, 1, trendsData.length + 1, headers.length)
    .setBorder(true, true, true, true, true, true);
  
  // Adicionar timestamp
  sheet.getRange(trendsData.length + 3, 1)
    .setValue(`Última atualização: ${new Date().toLocaleString('pt-BR')}`);
  
  Logger.log(`✅ ${trendsData.length} tendências coletadas com sucesso!`);
}

// 🕐 Função para agendar coleta automática
function createAutomaticTrigger() {
  // Remove triggers existentes
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'collectTrendsData') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Cria novo trigger para executar a cada 6 horas
  ScriptApp.newTrigger('collectTrendsData')
    .timeBased()
    .everyHours(6)
    .create();
    
  Logger.log('🔄 Trigger automático configurado para executar a cada 6 horas');
}

// 🧪 Função de teste
function testCollection() {
  Logger.log('🧪 Iniciando teste de coleta...');
  collectTrendsData();
  Logger.log('✅ Teste concluído! Verifique a planilha.');
}
```

### 1.3 Executar e Testar
1. Clique em "Executar" na função `testCollection`
2. Autorize as permissões solicitadas
3. Verifique se os dados aparecem na planilha

## 📊 **Passo 2: Configurar Google Sheets**

### 2.1 Criar Nova Planilha
- Vá para [sheets.google.com](https://sheets.google.com)
- Crie nova planilha: "ATMK - Google Trends Data"
- Conecte ao Apps Script: Extensions → Apps Script → Cole o código acima

### 2.2 Tornar Planilha Pública
**IMPORTANTE:** Para o Supabase acessar os dados:

1. Clique em "Compartilhar" (botão azul)
2. Em "Acesso geral" → "Qualquer pessoa com o link"
3. Permissão: "Visualizador" 
4. Copie o link da planilha

### 2.3 Executar Coleta
- No Apps Script, execute `collectTrendsData()`
- Configure trigger automático: execute `createAutomaticTrigger()`

## 🔄 **Passo 3: Conectar com Supabase**

### 3.1 No ATMK Platform
1. Vá para **Base de Conhecimento → Google Trends**
2. Cole a URL da planilha do Google Sheets
3. Clique em "Sincronizar Dados"

### 3.2 Verificar Dados no Supabase
- Os dados serão importados para a tabela `trends_data`
- Cada sincronização substitui os dados anteriores
- Histórico fica salvo com timestamp

## 📈 **Passo 4: Conectar Looker Studio**

### 4.1 Criar Conexão Supabase
1. Abra [Looker Studio](https://lookerstudio.google.com)
2. Criar novo relatório
3. Adicionar dados → Conectores → PostgreSQL
4. Configure conexão:
   - **Host:** `db.bztjknnilcmfaromieaj.supabase.co`
   - **Porta:** `5432`
   - **Database:** `postgres`
   - **Username:** `postgres`
   - **Senha:** [senha do seu projeto Supabase]

### 4.2 Criar Dashboards
Conecte às tabelas:
- `trends_data` - Dados do Google Trends
- `companies` - Informações das empresas
- `content_calendar` - Calendário de conteúdo

## 🔧 **Personalização Avançada**

### Para coletar dados reais do Google Trends:

```javascript
// Substitua a seção "DADOS DE EXEMPLO" por:

function getRealTrendsData() {
  // OPÇÃO 1: Usar biblioteca pytrends (requer Google Apps Script Libraries)
  // OPÇÃO 2: Usar SerpAPI (requer API key)
  // OPÇÃO 3: Web scraping básico (cuidado com rate limits)
  
  // Exemplo básico com UrlFetchApp:
  const keywords = ['marketing digital', 'seo', 'social media'];
  const trendsData = [];
  
  keywords.forEach(keyword => {
    // Sua lógica de coleta aqui
    const searchVolume = Math.floor(Math.random() * 100000) + 10000;
    const trendScore = Math.random() * 100;
    
    trendsData.push([
      keyword,
      searchVolume,
      trendScore,
      'BR',
      '7d',
      'palavra1;palavra2;palavra3',
      trendScore * 0.9
    ]);
  });
  
  return trendsData;
}
```

### Integração com APIs Externas:

```javascript
function collectFromSerpAPI() {
  const apiKey = 'sua_serp_api_key'; // Configure em Project Settings
  const url = `https://serpapi.com/search.json?engine=google_trends&q=marketing&api_key=${apiKey}`;
  
  try {
    const response = UrlFetchApp.fetch(url);
    const data = JSON.parse(response.getContentText());
    
    // Processe os dados da SerpAPI
    return processeSerpApiData(data);
  } catch (error) {
    Logger.log('Erro na SerpAPI:', error);
    return [];
  }
}
```

## ✅ **Checklist de Implementação**

- [ ] Google Apps Script criado e testado
- [ ] Google Sheets configurada e pública
- [ ] Dados sendo coletados automaticamente 
- [ ] Conexão Supabase funcionando
- [ ] Sincronização manual testada
- [ ] Looker Studio conectado
- [ ] Dashboard básico criado
- [ ] Trigger automático ativado

## 🆘 **Solução de Problemas**

### Erro: "Planilha não encontrada"
- Verifique se a URL está correta
- Confirme que a planilha está pública
- Teste a URL diretamente no navegador

### Erro: "Formato de dados inválido"
- Confira se os cabeçalhos estão corretos
- Verifique se não há linhas vazias
- Dados numéricos devem ser números, não texto

### Sincronização não funciona
- Verifique logs no Supabase Edge Functions
- Teste a Edge Function diretamente
- Confirme permissões do Google Sheets

## 🚀 **Próximos Passos**

1. **Automatizar mais dados:** Adicione coleta de dados de redes sociais
2. **Melhorar análise:** Integre com OpenAI para insights automáticos  
3. **Expandir fontes:** Conecte Apify para web scraping
4. **Dashboards avançados:** Crie KPIs e alertas no Looker Studio

---

**📞 Suporte:** Se precisar de ajuda, verifique os logs no Google Apps Script e no Supabase Edge Functions.