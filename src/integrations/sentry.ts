import * as Sentry from "@sentry/react";

Sentry.init({
    dsn: "https://ccd0aa5ba37fabb9c7ed84ec1e221317@o4510472793817088.ingest.us.sentry.io/4510472795193344",
    sendDefaultPii: true,
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    integrations: [Sentry.browserTracingIntegration()],
    tracePropagationTargets: ["localhost", /^https:\/\/atmk-backend\.onrender\.com/],
    tracesSampleRate: 1.0,
});