import React from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App.tsx";
import "./index.css";
import "./i18n/config";

Sentry.init({
  dsn: "https://1b9edfe2871f3976f2bb29233636e5c4@o4510257788616704.ingest.de.sentry.io/4510262563045456",
  integrations: [
    Sentry.browserTracingIntegration({
      enableInp: false,
    }),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  // Performance Monitoring - désactivé comme demandé
  tracesSampleRate: 0,
  // Session Replay - désactivé comme demandé  
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  // Setting this option to true will send default PII data to Sentry.
  sendDefaultPii: true,
  environment: import.meta.env.MODE,
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<div className="flex min-h-screen items-center justify-center"><p>Une erreur est survenue. Veuillez rafraîchir la page.</p></div>}>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
