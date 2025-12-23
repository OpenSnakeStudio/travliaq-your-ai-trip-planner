import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const API_BASE_URL = "https://travliaq-api-production.up.railway.app";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let q = "";
    let limit = "10";
    let types: string | string[] = "city,airport,country";

    if (req.method === "POST") {
      const body = (await req.json().catch(() => ({}))) as {
        q?: string;
        limit?: number | string;
        types?: string[] | string;
      };
      q = body.q ?? "";
      limit = String(body.limit ?? "10");
      types = body.types ?? "city,airport,country";
    } else {
      const url = new URL(req.url);
      q = url.searchParams.get("q") || "";
      limit = url.searchParams.get("limit") || "10";
      types = url.searchParams.get("types") || "city,airport,country";
    }

    const typesParam = Array.isArray(types) ? types.join(",") : types;

    if (!q || q.length < 3) {
      return new Response(JSON.stringify([]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiUrl = `${API_BASE_URL}/autocomplete?q=${encodeURIComponent(q)}&limit=${encodeURIComponent(limit)}&types=${encodeURIComponent(typesParam)}`;

    // Small retry (upstream can be flaky)
    const fetchOnce = async () => {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 8000);
      try {
        return await fetch(apiUrl, {
          headers: {
            accept: "application/json",
            "user-agent": "travliaq-edge-proxy/1.0",
          },
          signal: controller.signal,
        });
      } finally {
        clearTimeout(t);
      }
    };

    let response = await fetchOnce();
    if (!response.ok) {
      // retry once
      response = await fetchOnce();
    }

    if (!response.ok) {
      console.error("Autocomplete upstream error", {
        status: response.status,
        q,
      });
      // Dont crash UI on upstream errors
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Autocomplete error:", error);
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
