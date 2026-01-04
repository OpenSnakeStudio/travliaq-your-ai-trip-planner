import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_URL = 'https://travliaq-api-production.up.railway.app/map-prices';

interface MapPricesRequest {
  origin: string;
  destinations: string[];
  adults?: number;
  currency?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: MapPricesRequest = await req.json();
    
    console.log('[map-prices] Request:', {
      origin: body.origin,
      destinationsCount: body.destinations?.length,
      adults: body.adults,
      currency: body.currency
    });

    // Validate required fields
    if (!body.origin || !body.destinations || body.destinations.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'origin and destinations are required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Limit destinations to 50
    const destinations = body.destinations.slice(0, 50);

    // Call the external API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        origin: body.origin,
        destinations,
        adults: body.adults || 1,
        currency: body.currency || 'EUR'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[map-prices] API error:', response.status, errorText);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `API error: ${response.status}` 
        }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    
    console.log('[map-prices] Response:', {
      success: data.success,
      pricesCount: data.prices ? Object.keys(data.prices).length : 0,
      cached: data.cached_destinations,
      fetched: data.fetched_destinations
    });

    return new Response(
      JSON.stringify(data),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[map-prices] Error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
