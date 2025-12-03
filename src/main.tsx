import "./integrations/sentry.ts";
import { createRoot } from "react-dom/client";
import { PostHogProvider } from 'posthog-js/react';
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <PostHogProvider
    apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
    options={{
      api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
      defaults: '2025-05-24',
      capture_exceptions: true, // This enables capturing exceptions using Error Tracking
      debug: import.meta.env.MODE === "development",
    }}
  >
    <App />
  </PostHogProvider>
);