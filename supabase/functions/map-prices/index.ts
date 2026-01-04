import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_URL = 'https://travliaq-api-production.up.railway.app/map-prices';

interface MapPricesRequest {
  origins: string[];  // Multiple origin airports (e.g., ["CDG", "ORY"] for Paris)
  destinations: string[];
  adults?: number;
  currency?: string;
}

interface PriceData {
  price: number;
  date: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: MapPricesRequest = await req.json();
    
    console.log('[map-prices] Request:', {
      origins: body.origins,
      destinationsCount: body.destinations?.length,
      adults: body.adults,
      currency: body.currency
    });

    // Validate required fields
    if (!body.origins || body.origins.length === 0 || !body.destinations || body.destinations.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'origins and destinations are required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Limit destinations to 50
    const destinations = body.destinations.slice(0, 50);
    const origins = body.origins.slice(0, 5); // Max 5 origin airports

    // Fetch prices from all origin airports in parallel
    const allResponses = await Promise.all(
      origins.map(async (origin) => {
        try {
          const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              origin,
              destinations,
              adults: body.adults || 1,
              currency: body.currency || 'EUR'
            })
          });

          if (!response.ok) {
            console.error(`[map-prices] API error for origin ${origin}:`, response.status);
            return { origin, success: false, prices: {} };
          }

          const data = await response.json();
          return { origin, success: data.success, prices: data.prices || {} };
        } catch (err) {
          console.error(`[map-prices] Error for origin ${origin}:`, err);
          return { origin, success: false, prices: {} };
        }
      })
    );

    // Merge prices: keep the cheapest price for each destination
    const mergedPrices: Record<string, PriceData | null> = {};
    
    for (const dest of destinations) {
      let cheapestPrice: PriceData | null = null;
      
      for (const response of allResponses) {
        const priceData = response.prices[dest];
        if (priceData && priceData.price !== null && priceData.price !== undefined) {
          if (cheapestPrice === null || priceData.price < cheapestPrice.price) {
            cheapestPrice = priceData;
          }
        }
      }
      
      mergedPrices[dest] = cheapestPrice;
    }

    console.log('[map-prices] Merged response:', {
      originsQueried: origins.length,
      pricesWithValue: Object.values(mergedPrices).filter(p => p !== null).length,
      pricesNull: Object.values(mergedPrices).filter(p => p === null).length
    });

    return new Response(
      JSON.stringify({
        success: true,
        prices: mergedPrices,
        currency: body.currency || 'EUR',
        origins
      }),
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
