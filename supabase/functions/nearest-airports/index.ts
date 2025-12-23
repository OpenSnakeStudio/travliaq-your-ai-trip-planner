import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Prefer env var so we can switch upstream without redeploying code
const RAILWAY_API_URL = Deno.env.get("TRAVLIAQ_API_URL") ?? "https://travliaq-api-production.up.railway.app";

// Map of French city names to English/international names for better API matching
const cityNameMappings: Record<string, string> = {
  // Asian cities
  "pékin": "Beijing",
  "pekin": "Beijing",
  "tokyo": "Tokyo",
  "séoul": "Seoul",
  "seoul": "Seoul",
  "hong kong": "Hong Kong",
  "singapour": "Singapore",
  "bangkok": "Bangkok",
  "hanoï": "Hanoi",
  "hanoi": "Hanoi",
  "ho chi minh ville": "Ho Chi Minh City",
  "saigon": "Ho Chi Minh City",
  "bombay": "Mumbai",
  "calcutta": "Kolkata",
  "new delhi": "New Delhi",
  "delhi": "Delhi",
  "taipei": "Taipei",
  "shanghai": "Shanghai",
  "manille": "Manila",
  "djakarta": "Jakarta",
  "jakarta": "Jakarta",
  "kuala lumpur": "Kuala Lumpur",
  
  // European cities
  "londres": "London",
  "édimbourg": "Edinburgh",
  "edimbourg": "Edinburgh",
  "munich": "Munich",
  "vienne": "Vienna",
  "rome": "Rome",
  "venise": "Venice",
  "milan": "Milan",
  "naples": "Naples",
  "florence": "Florence",
  "athènes": "Athens",
  "athenes": "Athens",
  "lisbonne": "Lisbon",
  "barcelone": "Barcelona",
  "séville": "Seville",
  "seville": "Seville",
  "copenhague": "Copenhagen",
  "stockholm": "Stockholm",
  "oslo": "Oslo",
  "helsinki": "Helsinki",
  "varsovie": "Warsaw",
  "prague": "Prague",
  "budapest": "Budapest",
  "bucarest": "Bucharest",
  "moscou": "Moscow",
  "saint-pétersbourg": "Saint Petersburg",
  "saint petersbourg": "Saint Petersburg",
  "kiev": "Kyiv",
  "istanbul": "Istanbul",
  "anvers": "Antwerp",
  "bruges": "Bruges",
  "gand": "Ghent",
  "la haye": "The Hague",
  "genève": "Geneva",
  "geneve": "Geneva",
  "zurich": "Zurich",
  "bâle": "Basel",
  "bale": "Basel",
  "cologne": "Cologne",
  "francfort": "Frankfurt",
  "hambourg": "Hamburg",
  "nuremberg": "Nuremberg",
  "cracovie": "Krakow",
  
  // Middle East & Africa
  "le caire": "Cairo",
  "jérusalem": "Jerusalem",
  "jerusalem": "Jerusalem",
  "téhéran": "Tehran",
  "teheran": "Tehran",
  "bagdad": "Baghdad",
  "beyrouth": "Beirut",
  "damas": "Damascus",
  "alger": "Algiers",
  "tunis": "Tunis",
  "casablanca": "Casablanca",
  "marrakech": "Marrakech",
  "johannesburg": "Johannesburg",
  "le cap": "Cape Town",
  "nairobi": "Nairobi",
  "addis-abeba": "Addis Ababa",
  "kinshasa": "Kinshasa",
  "lagos": "Lagos",
  "dakar": "Dakar",
  "abidjan": "Abidjan",
  "doubaï": "Dubai",
  "dubai": "Dubai",
  "doha": "Doha",
  "riyad": "Riyadh",
  "abou dabi": "Abu Dhabi",
  "abu dhabi": "Abu Dhabi",
  
  // Americas
  "new york": "New York",
  "los angeles": "Los Angeles",
  "san francisco": "San Francisco",
  "la nouvelle-orléans": "New Orleans",
  "nouvelle orléans": "New Orleans",
  "new orleans": "New Orleans",
  "philadelphie": "Philadelphia",
  "montréal": "Montreal",
  "montreal": "Montreal",
  "québec": "Quebec City",
  "quebec": "Quebec City",
  "mexico": "Mexico City",
  "la havane": "Havana",
  "rio de janeiro": "Rio de Janeiro",
  "são paulo": "Sao Paulo",
  "sao paulo": "Sao Paulo",
  "buenos aires": "Buenos Aires",
  "santiago": "Santiago",
  "bogota": "Bogota",
  "lima": "Lima",
  "caracas": "Caracas",
  
  // Oceania
  "sydney": "Sydney",
  "melbourne": "Melbourne",
  "auckland": "Auckland",
};

// Normalize and lookup city name
function normalizeCityName(city: string): string {
  const normalized = city.toLowerCase().trim();
  return cityNameMappings[normalized] || city;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { city, country_code, limit = 3 } = await req.json();

    if (!city || typeof city !== "string" || city.length < 2) {
      return new Response(
        JSON.stringify({ error: "City name required (min 2 chars)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize city name (convert French names to English/international)
    const normalizedCity = normalizeCityName(city);
    const wasNormalized = normalizedCity !== city;

    // Build request body with optional country_code
    const requestBody: { city: string; limit: number; country_code?: string } = {
      city: normalizedCity,
      limit: Math.min(limit, 10),
    };
    
    if (country_code && typeof country_code === "string" && country_code.length === 2) {
      requestBody.country_code = country_code.toUpperCase();
    }

    console.log(`[nearest-airports] Searching airports near: "${city}"${wasNormalized ? ` (normalized to "${normalizedCity}")` : ""}${country_code ? ` (${country_code})` : ""}, limit: ${limit}`);

    const response = await fetch(`${RAILWAY_API_URL}/nearest-airports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const status = response.status;
      const errorText = await response.text();
      console.error(`[nearest-airports] Upstream error: ${status} - ${errorText}`);

      if (status === 404) {
        return new Response(
          JSON.stringify({ error: "City not found", detail: errorText }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Upstream API error", status }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log(`[nearest-airports] Found ${data.airports?.length || 0} airports for "${city}"`);

    // Return the data as-is from the API
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[nearest-airports] Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
