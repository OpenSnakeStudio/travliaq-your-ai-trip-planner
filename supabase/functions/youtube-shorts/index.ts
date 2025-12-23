import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  category: string;
}

interface YouTubeSearchResponse {
  items?: {
    id: { videoId: string };
    snippet: {
      title: string;
      description: string;
      channelTitle: string;
      publishedAt: string;
      thumbnails: {
        high?: { url: string };
        medium?: { url: string };
        default?: { url: string };
      };
    };
  }[];
}

// Categories with their search queries (in English for better results)
const CATEGORY_QUERIES: Record<string, string[]> = {
  monuments: [
    "famous landmarks",
    "must see monuments",
    "best attractions",
    "iconic places",
    "historical sites",
  ],
  activities: [
    "things to do",
    "best activities",
    "what to do",
    "top experiences",
    "adventure activities",
  ],
  city: [
    "travel guide",
    "city tour",
    "walking tour",
    "travel vlog",
    "hidden gems",
  ],
  food: [
    "best restaurants",
    "food tour",
    "where to eat",
    "street food",
    "local cuisine",
  ],
  hotel: [
    "best hotels",
    "where to stay",
    "luxury hotel tour",
  ],
};

// Balanced rotation: monuments, activities, city, food, hotel in a good mix
const CATEGORY_ROTATION = [
  "monuments",
  "activities",
  "city",
  "food",
  "monuments",
  "activities",
  "hotel",
  "city",
  "food",
  "monuments",
  "activities",
  "city",
];

// Simple filter to check if title/description mentions the city
function isRelevantToCity(video: YouTubeVideo, cityName: string): boolean {
  const cityLower = cityName.toLowerCase();
  const cityWords = cityLower.split(/[\s,]+/).filter(w => w.length > 2);
  
  const titleLower = video.title.toLowerCase();
  const descLower = video.description.toLowerCase();
  const combined = `${titleLower} ${descLower}`;
  
  // Check if the city name or significant words appear
  if (combined.includes(cityLower)) return true;
  
  // Check for individual significant city words (for multi-word cities)
  for (const word of cityWords) {
    if (combined.includes(word)) return true;
  }
  
  return false;
}

async function searchYouTube(
  apiKey: string, 
  city: string, 
  category: string, 
  query: string
): Promise<YouTubeVideo[]> {
  // Use quotes around city name for stricter matching
  const searchQuery = `"${city}" ${query} #shorts`;
  
  const searchParams = new URLSearchParams({
    part: "snippet",
    q: searchQuery,
    type: "video",
    videoDuration: "short",
    maxResults: "5", // Get more to filter out irrelevant ones
    order: "relevance",
    relevanceLanguage: "en",
    safeSearch: "moderate",
    key: apiKey,
  });

  const searchUrl = `https://www.googleapis.com/youtube/v3/search?${searchParams}`;

  try {
    const response = await fetch(searchUrl, {
      headers: {
        "Referer": "https://cinbnmlfpffmyjmkwbco.supabase.co",
      },
    });

    if (!response.ok) {
      console.error(`[youtube-shorts] API error for ${category}: ${response.status}`);
      return [];
    }

    const data: YouTubeSearchResponse = await response.json();

    const videos = (data.items || []).map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url ||
                 item.snippet.thumbnails.medium?.url ||
                 item.snippet.thumbnails.default?.url || "",
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      category,
    }));

    // Filter to keep only videos that seem relevant to the city
    const relevant = videos.filter(v => isRelevantToCity(v, city));
    
    console.log(`[youtube-shorts] ${category}: ${videos.length} found, ${relevant.length} relevant to "${city}"`);
    
    return relevant.length > 0 ? relevant : videos.slice(0, 2); // Fallback to top 2 if no match
  } catch (error) {
    console.error(`[youtube-shorts] Error searching ${category}:`, error);
    return [];
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { city } = await req.json();

    if (!city) {
      return new Response(
        JSON.stringify({ error: "City parameter is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("YOUTUBE_API_KEY");
    if (!apiKey) {
      console.error("[youtube-shorts] YOUTUBE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "YouTube API not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[youtube-shorts] Searching varied content for: ${city}`);

    // Fetch from multiple categories in parallel
    const categoryPromises = Object.entries(CATEGORY_QUERIES).map(
      async ([category, queries]) => {
        // Pick a random query from this category
        const randomQuery = queries[Math.floor(Math.random() * queries.length)];
        return searchYouTube(apiKey, city, category, randomQuery);
      }
    );

    const categoryResults = await Promise.all(categoryPromises);

    // Flatten all results
    const allVideos: YouTubeVideo[] = categoryResults.flat();

    // Group by category for rotation
    const videosByCategory: Record<string, YouTubeVideo[]> = {};
    for (const video of allVideos) {
      if (!videosByCategory[video.category]) {
        videosByCategory[video.category] = [];
      }
      videosByCategory[video.category].push(video);
    }

    // Build final list following rotation pattern
    const finalVideos: YouTubeVideo[] = [];
    const usedIds = new Set<string>();
    const categoryIndices: Record<string, number> = {};

    for (const category of CATEGORY_ROTATION) {
      const categoryVideos = videosByCategory[category] || [];
      const currentIndex = categoryIndices[category] || 0;

      // Find next unused video from this category
      for (let i = 0; i < categoryVideos.length; i++) {
        const video = categoryVideos[(currentIndex + i) % categoryVideos.length];
        if (!usedIds.has(video.id)) {
          finalVideos.push(video);
          usedIds.add(video.id);
          categoryIndices[category] = (currentIndex + i + 1) % categoryVideos.length;
          break;
        }
      }

      // Stop if we have enough videos
      if (finalVideos.length >= 12) break;
    }

    console.log(`[youtube-shorts] Returning ${finalVideos.length} varied videos`);
    console.log(`[youtube-shorts] Categories: ${finalVideos.map(v => v.category).join(', ')}`);

    return new Response(
      JSON.stringify({
        city,
        videos: finalVideos,
        count: finalVideos.length,
        categories: Object.keys(videosByCategory),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("[youtube-shorts] Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
