import type { ChatKitOptions } from "@openai/chatkit";

export const chatKitOptions: ChatKitOptions = {
  api: {
    // Preencha com seu endpoint/proxy seguro
    // url: "/api/chatkit",
    // auth: async () => ({ Authorization: `Bearer ${token}` })
  } as any,
  theme: {
    colorScheme: "light",
    radius: "round",
    density: "normal",
    typography: {
      baseSize: 16,
      fontFamily: "Inter, sans-serif",
      fontSources: [
        {
          family: "Inter",
          src: "https://rsms.me/inter/font-files/Inter-Regular.woff2",
          weight: 400,
          style: "normal",
        },
      ],
    },
  },
  composer: {
    placeholder: "Peça para nossa IA...",
    attachments: { enabled: true, maxCount: 5, maxSize: 10485760 },
    tools: [
      { id: "search_docs", label: "Search docs", shortLabel: "Docs", placeholderOverride: "Search documentation", icon: "book-open", pinned: false },
    ],
    models: [
      { id: "crisp", label: "Crisp", description: "Concise and factual" },
    ],
  },
  startScreen: { greeting: "Algum ajuste no conteúdo?", prompts: [] },
};


