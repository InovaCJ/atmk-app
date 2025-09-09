import { useMemo } from 'react';
import { useKnowledgeBase } from './useKnowledgeBase';
import type { OnboardingData } from '@/types/onboarding';

export const useKnowledgeValidation = (companyId?: string) => {
  const { getKnowledgeItemByType } = useKnowledgeBase(companyId);

  const knowledgeValidation = useMemo(() => {
    if (!companyId) {
      return {
        isValid: false,
        completionPercentage: 0,
        missingFields: [],
        canGenerateContent: false
      };
    }

    const knowledgeItem = getKnowledgeItemByType('onboarding_data');
    
    if (!knowledgeItem || !knowledgeItem.metadata) {
      return {
        isValid: false,
        completionPercentage: 0,
        missingFields: ['Dados do onboarding não encontrados'],
        canGenerateContent: false
      };
    }

    const data: OnboardingData = knowledgeItem.metadata;
    const missingFields: string[] = [];
    let filledFields = 0;
    const totalFields = 15; // Total de campos obrigatórios

    // Validar Brand Identity (5 campos obrigatórios)
    if (!data.brandIdentity?.mission?.trim()) {
      missingFields.push('Missão da empresa');
    } else filledFields++;

    if (!data.brandIdentity?.vision?.trim()) {
      missingFields.push('Visão da empresa');
    } else filledFields++;

    if (!data.brandIdentity?.valueProposition?.trim()) {
      missingFields.push('Proposta de valor');
    } else filledFields++;

    if (!data.brandIdentity?.values || data.brandIdentity.values.length === 0) {
      missingFields.push('Valores da empresa');
    } else filledFields++;

    if (!data.brandIdentity?.personalityScales) {
      missingFields.push('Personalidade da marca');
    } else filledFields++;

    // Validar Business (3 campos obrigatórios)  
    if (!data.business?.sector?.trim()) {
      missingFields.push('Setor/Mercado');
    } else filledFields++;

    if (!data.business?.market?.trim()) {
      missingFields.push('Mercado de atuação');
    } else filledFields++;

    if (!data.business?.products || data.business.products.length === 0) {
      missingFields.push('Produtos da empresa');
    } else filledFields++;

    // Validar Audience (4 campos obrigatórios)
    const hasB2CData = data.audience?.icp?.demographics?.ageRange?.trim() || 
                       data.audience?.icp?.demographics?.income?.trim();
    const hasB2BData = data.audience?.icp?.firmographics?.companySize?.trim() ||
                       (data.audience?.icp?.firmographics?.industry && data.audience.icp.firmographics.industry.length > 0);

    if (!hasB2CData && !hasB2BData) {
      missingFields.push('Perfil do público-alvo (B2C ou B2B)');
    } else filledFields++;

    if (!data.audience?.personas || data.audience.personas.length === 0) {
      missingFields.push('Personas definidas'); 
    } else filledFields++;

    if (!data.audience?.frequentQuestions || data.audience.frequentQuestions.length === 0) {
      missingFields.push('Perguntas frequentes');
    } else filledFields++;

    // Validar SEO (2 campos obrigatórios)
    if (!data.seo?.keywords || data.seo.keywords.length === 0) {
      missingFields.push('Palavras-chave');
    } else filledFields++;

    if (!data.seo?.searchIntents || data.seo.searchIntents.length === 0) {
      missingFields.push('Intenções de busca');
    } else filledFields++;

    // Validar Content Formats (1 campo obrigatório)
    if (!data.contentFormats?.preferredFormats || data.contentFormats.preferredFormats.length === 0) {
      missingFields.push('Formatos de conteúdo preferidos');
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
  }, [companyId, getKnowledgeItemByType]);

  return knowledgeValidation;
};