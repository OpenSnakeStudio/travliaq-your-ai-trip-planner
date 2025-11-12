import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Simple Sentry tunnel to bypass ad-blockers / CORS
// Forwards envelopes to Sentry ingest API
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Your Sentry DSN (public) as defined in the frontend
// We only need the org host + project id to build the ingest URL
// DSN from src/main.tsx
const SENTRY_DSN = "https://1b9edfe2871f3976f2bb29233636e5c4@o4510257788616704.ingest.de.sentry.io/4510262563045456";

function buildIngestUrl(dsn: string) {
  try {
    const u = new URL(dsn);
    // Pathname contains `/PROJECT_ID`
    const projectId = u.pathname.replace("/", "");
    const host = u.host; // e.g. oXXXX.ingest.de.sentry.io
    return `https://${host}/api/${projectId}/envelope/`;
  } catch {
    // Fallback: default EU ingest host if parsing fails
    return "https://ingest.de.sentry.io/api/0/envelope/";
  }
}

const INGEST_URL = buildIngestUrl(SENTRY_DSN);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const res = await fetch(INGEST_URL, {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/x-sentry-envelope",
      },
    });

    // Mirror status but always allow CORS
    return new Response(await res.text(), {
      status: res.status,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("Sentry tunnel error:", error);
    return new Response("Tunnel error", { status: 500, headers: corsHeaders });
  }
});
