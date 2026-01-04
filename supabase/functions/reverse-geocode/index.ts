import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lon } = await req.json();
    
    // Validate coordinates
    if (typeof lat !== 'number' || typeof lon !== 'number') {
      return new Response(
        JSON.stringify({ error: 'Coordinates must be numbers' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return new Response(
        JSON.stringify({ error: 'Invalid coordinate ranges' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Build URL safely
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('format', 'json');
    url.searchParams.set('lat', lat.toString());
    url.searchParams.set('lon', lon.toString());
    url.searchParams.set('accept-language', 'en');
    
    console.log('[reverse-geocode] Request:', { lat, lon });
    
    // Call Nominatim with proper User-Agent
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'TravliAQ/1.0 (contact@travliaq.com)'
      }
    });
    
    if (!response.ok) {
      console.error('[reverse-geocode] Nominatim API error:', response.status);
      return new Response(
        JSON.stringify({ error: 'Geocoding service unavailable' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const data = await response.json();
    
    // Validate response structure
    if (!data || !data.address) {
      console.error('[reverse-geocode] Invalid Nominatim response structure');
      return new Response(
        JSON.stringify({ error: 'Invalid geocoding response' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Extract city name from various possible fields
    const address = data.address;
    const city = address.city || address.town || address.village || address.municipality || address.county || null;
    const country = address.country || null;
    const countryCode = address.country_code?.toUpperCase() || null;
    
    console.log(`[reverse-geocode] Found: ${city}, ${country} (${countryCode})`);
    
    return new Response(
      JSON.stringify({
        city,
        country,
        countryCode,
        lat,
        lon,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('[reverse-geocode] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
