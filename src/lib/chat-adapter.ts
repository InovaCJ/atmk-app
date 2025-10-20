export type StreamChunk = { type: "text"; content: string } | { type: "html"; content: string };

export interface ChatAdapter {
  streamEdit: (input: { html: string; prompt: string }, onChunk: (c: StreamChunk) => void) => Promise<void>;
}

// Adapter fake local, para demonstrar o fluxo de streaming
export const localDemoAdapter: ChatAdapter = {
  async streamEdit({ html, prompt }, onChunk) {
    // Simula latência
    await new Promise((r) => setTimeout(r, 200));
    // "Edição": exemplo simples que adiciona um parágrafo final com o prompt
    const appended = html + `<p>${prompt}</p>`;
    // Emite em partes para acionar o efeito no editor
    const tokens = appended.split("");
    let acc = "";
    for (const t of tokens) {
      acc += t;
      if (acc.length % 12 === 0) {
        onChunk({ type: "html", content: acc });
        await new Promise((r) => setTimeout(r, 16));
      }
    }
    onChunk({ type: "html", content: acc });
  },
};


