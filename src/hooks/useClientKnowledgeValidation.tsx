import { useMemo } from 'react';
import { useClientSettings } from './useClientSettings';
import type { KnowledgeBaseData } from './useClientSettings';

export const useClientKnowledgeValidation = (clientId?: string) => {
  const { knowledgeData, loading } = useClientSettings(clientId || '');

  const validation = useMemo(() => {
    if (!clientId || loading || !knowledgeData) {
      return {
        isValid: false,
        completionPercentage: 0,
        missingFields: [],
        canGenerateContent: false,
        filledFields: 0,
        totalFields: 0
      };
    }

    const missingFields: string[] = [];
    let filledFields = 0;
    const totalFields = 15; // Total de campos obrigatórios

    // 1. Posicionamento e Personalidade (5 campos)
    if (!knowledgeData.positioning?.valueProposition?.trim()) {
      missingFields.push('Proposta de valor');
    } else filledFields++;

    if (!knowledgeData.positioning?.differentiators || 
        knowledgeData.positioning.differentiators.length === 0 || 
        knowledgeData.positioning.differentiators.every(d => !d.trim())) {
      missingFields.push('Diferenciais da empresa');
    } else filledFields++;

    if (!knowledgeData.positioning?.wordsWeUse || 
        knowledgeData.positioning.wordsWeUse.length === 0 || 
        knowledgeData.positioning.wordsWeUse.every(w => !w.trim())) {
      missingFields.push('Palavras que usamos');
    } else filledFields++;

    if (!knowledgeData.positioning?.bannedWords || 
        knowledgeData.positioning.bannedWords.length === 0 || 
        knowledgeData.positioning.bannedWords.every(w => !w.trim())) {
      missingFields.push('Palavras proibidas');
    } else filledFields++;

    // Verificar se pelo menos uma escala de personalidade foi ajustada (não é 50)
    const personality = knowledgeData.positioning?.personality;
    if (!personality || 
        (personality.formalVsInformal === 50 && 
         personality.technicalVsAccessible === 50 && 
         personality.seriousVsHumorous === 50)) {
      missingFields.push('Personalidade da marca');
    } else filledFields++;

    // 2. Negócio e Oferta (5 campos)
    if (!knowledgeData.business?.sector?.trim()) {
      missingFields.push('Setor/Mercado');
    } else filledFields++;

    if (!knowledgeData.business?.market?.trim()) {
      missingFields.push('Mercado de atuação');
    } else filledFields++;

    if (!knowledgeData.business?.categoryMaturity?.trim()) {
      missingFields.push('Maturidade da categoria');
    } else filledFields++;

    if (!knowledgeData.business?.products || 
        knowledgeData.business.products.length === 0 || 
        knowledgeData.business.products.every(p => !p.name?.trim())) {
      missingFields.push('Produtos da empresa');
    } else filledFields++;

    if (!knowledgeData.business?.services || 
        knowledgeData.business.services.length === 0 || 
        knowledgeData.business.services.every(s => !s.name?.trim())) {
      missingFields.push('Serviços da empresa');
    } else filledFields++;

    // 3. Público-Alvo (3 campos)
    const demographicProfile = knowledgeData.audience?.demographicProfile;
    if (!demographicProfile || 
        (!demographicProfile.ageRange?.trim() && 
         !demographicProfile.gender?.trim() && 
         !demographicProfile.income?.trim() && 
         !demographicProfile.education?.trim() && 
         !demographicProfile.location?.trim())) {
      missingFields.push('Perfil demográfico');
    } else filledFields++;

    if (!knowledgeData.audience?.personas || 
        knowledgeData.audience.personas.length === 0 || 
        knowledgeData.audience.personas.every(p => !p.name?.trim())) {
      missingFields.push('Personas definidas');
    } else filledFields++;

    if (!knowledgeData.audience?.faqs || 
        knowledgeData.audience.faqs.length === 0 || 
        knowledgeData.audience.faqs.every(f => !f.question?.trim())) {
      missingFields.push('Perguntas frequentes');
    } else filledFields++;

    // 4. SEO (2 campos)
    if (!knowledgeData.seo?.mainKeywords || 
        knowledgeData.seo.mainKeywords.length === 0 || 
        knowledgeData.seo.mainKeywords.every(k => !k.trim())) {
      missingFields.push('Palavras-chave principais');
    } else filledFields++;

    if (!knowledgeData.seo?.searchIntents || 
        knowledgeData.seo.searchIntents.length === 0 || 
        knowledgeData.seo.searchIntents.every(s => !s.trim())) {
      missingFields.push('Intenções de busca');
    } else filledFields++;

    const completionPercentage = Math.round((filledFields / totalFields) * 100);
    const canGenerateContent = completionPercentage >= 50;

    return {
      isValid: canGenerateContent,
      completionPercentage,
      missingFields,
      canGenerateContent,
      filledFields,
      totalFields
    };
  }, [clientId, knowledgeData, loading]);

  return validation;
};
