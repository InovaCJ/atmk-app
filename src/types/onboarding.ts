export interface BasicInfoData {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  companyName: string;
}

export interface BrandIdentityData {
  valueProposition: string;
  differentials: string[];
  personalityScales: {
    formalInformal: number; // 1-5 scale
    technicalAccessible: number;
    seriousFun: number;
  };
  wordsToUse: string[];
  wordsToBan: string[];
}

export interface BusinessData {
  sector: string;
  market: string;
  maturity: 'emerging' | 'growing' | 'mature' | 'declining';
  regulatoryStatus: string;
  products: Array<{
    name: string;
    features: string[];
    priceRange: string;
  }>;
  services: Array<{
    name: string;
    description: string;
    priceRange: string;
  }>;
  roadmap: string[];
}

export interface AudienceData {
  icp: {
    demographics: {
      ageRange: string;
      gender: string;
      income: string;
      education: string;
      location: string[];
    };
    firmographics: {
      companySize: string;
      industry: string[];
      jobTitles: string[];
      regions: string[];
      languages: string[];
    };
  };
  personas: Array<{
    name: string;
    demographics: object;
    painPoints: string[];
    objections: string[];
    buyingTriggers: string[];
  }>;
  frequentQuestions: string[];
}

export interface SEOData {
  keywords: Array<{
    keyword: string;
    searchVolume: number;
    difficulty: number;
    intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  }>;
  searchIntents: string[];
}

export interface ContentFormatsData {
  preferredFormats: Array<{
    type: 'email' | 'blog' | 'social' | 'video' | 'podcast' | 'webinar';
    priority: number;
    frequency: string;
    platforms?: string[];
  }>;
}

export interface CompanyDescriptionData {
  description: string;
}

export interface OnboardingData {
  basicInfo?: BasicInfoData;
  companyDescription?: CompanyDescriptionData;
  brandIdentity?: BrandIdentityData;
  business?: BusinessData;
  audience?: AudienceData;
  seo?: SEOData;
  contentFormats?: ContentFormatsData;
  completedSteps: number[];
  completedAt?: Date;
}