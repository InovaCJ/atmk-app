import { useAuth } from "@/contexts/AuthContext";

export function useApi() {
    const { session } = useAuth();
    const token = session?.access_token;

    // @todo: create a constants file and validate envs with zod
    const baseURL = import.meta.env.VITE_API_BASE_URL;

    async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
        const response = await fetch(`${baseURL}${path}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                Authorization: token ? `Bearer ${token}` : "",
                ...(options.headers || {}),
            },
        });

        const body = await response.json();

        if (!response.ok) {
            throw new Error(body.error || body.message || "API error");
        }

        return body as T;
    }

    return {
        get: <T>(path: string) => request<T>(path),
        post: <T>(path: string, body?: any) =>
            request<T>(path, { method: "POST", body: JSON.stringify(body) }),
        put: <T>(path: string, body?: any) =>
            request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
        del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
    };
}
