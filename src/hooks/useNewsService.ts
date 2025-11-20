import { useApi } from "@/integrations/backend/api";


export type IngestNewsResponse = {
    processed: number;
    runs: unknown[];
}
export function useNewsService() {
    const api = useApi();

    return {
        ingestNews(clientId: string, days: number) {
            return api.post<IngestNewsResponse>("/ingest-news", { clientId, days });
        }
    };
}
