import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Tool definition for extracting flight intent from user message
const flightExtractionTool = {
  type: "function",
  function: {
    name: "update_flight_widget",
    description: "Extract and update flight search parameters when user mentions travel plans with departure, destination, or dates. Call this when user expresses intent to search for flights.",
    parameters: {
      type: "object",
      properties: {
        from: {
          type: "string",
          description: "Departure city or airport (e.g., 'Paris', 'Brussels, Belgium', 'CDG')"
        },
        to: {
          type: "string", 
          description: "Destination city or airport (e.g., 'Barcelona', 'New York', 'Tokyo')"
        },
        departureDate: {
          type: "string",
          description: "Departure date in ISO format YYYY-MM-DD if mentioned (e.g., '2025-01-15')"
        },
        returnDate: {
          type: "string",
          description: "Return date in ISO format YYYY-MM-DD if mentioned for round trips"
        },
        passengers: {
          type: "number",
          description: "Number of passengers if mentioned"
        },
        tripType: {
          type: "string",
          enum: ["roundtrip", "oneway", "multi"],
          description: "Type of trip based on context (default roundtrip if both dates, oneway if only departure)"
        }
      },
      required: []
    }
  }
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    const AZURE_OPENAI_API_KEY = Deno.env.get("AZURE_OPENAI_API_KEY");
    const AZURE_OPENAI_ENDPOINT = Deno.env.get("AZURE_OPENAI_ENDPOINT");
    const AZURE_OPENAI_API_VERSION = Deno.env.get("AZURE_OPENAI_API_VERSION");
    const AZURE_OPENAI_DEPLOYMENT = Deno.env.get("AZURE_OPENAI_DEPLOYMENT");

    if (!AZURE_OPENAI_API_KEY || !AZURE_OPENAI_ENDPOINT || !AZURE_OPENAI_DEPLOYMENT) {
      console.error("Missing Azure OpenAI configuration");
      throw new Error("Azure OpenAI configuration is incomplete");
    }

    const apiVersion = AZURE_OPENAI_API_VERSION || "2025-01-01-preview";
    const url = `${AZURE_OPENAI_ENDPOINT}openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${apiVersion}`;

    console.log("Calling Azure OpenAI:", url);

    const systemPrompt = `Tu es un assistant de voyage intelligent et amical pour Travliaq. Tu aides les utilisateurs à planifier leurs voyages.

Tu peux:
- Suggérer des destinations en fonction des préférences
- Donner des informations sur les vols, activités et hébergements
- Répondre aux questions sur les budgets, la météo, les meilleures périodes pour voyager
- Aider à construire un itinéraire

IMPORTANT: Quand l'utilisateur mentionne un voyage avec des informations de vol (ville de départ, destination, dates), utilise TOUJOURS l'outil update_flight_widget pour pré-remplir le formulaire de recherche de vols. 

Exemples de phrases qui doivent déclencher l'outil:
- "Je veux aller à Barcelone depuis Paris le 15 janvier"
- "Vol pour Tokyo"
- "Je pars de Bruxelles vers Rome du 20 au 27 mars"
- "Billet d'avion New York"

Réponds toujours en français de manière concise et utile.

Quand tu mentionnes une destination, ajoute à la fin de ta réponse un JSON entre balises <action> pour contrôler la carte:
- Pour zoomer sur une ville: <action>{"type":"zoom","city":"nom_de_la_ville"}</action>
- Pour ouvrir un onglet: <action>{"type":"tab","tab":"flights|activities|stays|preferences"}</action>
- Pour les deux: <action>{"type":"tabAndZoom","tab":"flights","city":"Paris"}</action>

N'ajoute l'action que si c'est pertinent pour la conversation.`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "api-key": AZURE_OPENAI_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 800,
        tools: [flightExtractionTool],
        tool_choice: "auto",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Azure OpenAI error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erreur API Azure OpenAI", details: errorText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    console.log("Azure OpenAI response received");

    const choice = data.choices?.[0];
    let content = choice?.message?.content || "";
    let flightData = null;

    // Check if the model called the flight extraction tool
    if (choice?.message?.tool_calls) {
      for (const toolCall of choice.message.tool_calls) {
        if (toolCall.function?.name === "update_flight_widget") {
          try {
            flightData = JSON.parse(toolCall.function.arguments);
            console.log("Flight data extracted:", flightData);
          } catch (e) {
            console.error("Failed to parse flight data:", e);
          }
        }
      }
    }

    // If we got a tool call but no content, we need a follow-up call
    if (!content && flightData) {
      // Make a second call to get the conversational response
      const followUpResponse = await fetch(url, {
        method: "POST",
        headers: {
          "api-key": AZURE_OPENAI_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
            choice.message,
            {
              role: "tool",
              tool_call_id: choice.message.tool_calls[0].id,
              content: JSON.stringify({ success: true, message: "Flight widget updated" })
            }
          ],
          temperature: 0.7,
          max_tokens: 400,
        }),
      });

      if (followUpResponse.ok) {
        const followUpData = await followUpResponse.json();
        content = followUpData.choices?.[0]?.message?.content || "J'ai mis à jour la recherche de vol pour vous.";
      } else {
        content = "J'ai mis à jour la recherche de vol pour vous.";
      }
    }

    if (!content) {
      content = "Désolé, je n'ai pas pu générer de réponse.";
    }

    return new Response(JSON.stringify({ content, flightData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("planner-chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
