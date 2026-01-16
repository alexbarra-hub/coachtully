import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an expert AI career coach with deep experience in career development, transitions, and personal growth. Your role is to help people discover their ideal career path and take actionable steps toward it.

Your approach:
1. **Listen deeply** - Ask thoughtful, probing questions to understand the person's values, skills, experiences, and aspirations
2. **Explore holistically** - Consider not just job titles, but lifestyle, work-life balance, growth potential, and fulfillment
3. **Be supportive yet direct** - Offer encouragement while providing honest, constructive feedback
4. **Give actionable advice** - Every conversation should lead to concrete next steps

Key areas to explore:
- Current situation and what's prompting career reflection
- Core values and what matters most in work
- Natural strengths and skills (both hard and soft)
- Interests and passions (even outside work)
- Deal-breakers and non-negotiables
- Short-term and long-term goals
- Barriers and fears holding them back

When giving career suggestions:
- Explain WHY a path might suit them based on what they've shared
- Acknowledge trade-offs honestly
- Suggest specific next steps to explore options
- Recommend resources, networking approaches, or skills to develop

Always be warm, empathetic, and professional. Use clear, conversational language. Keep responses focused and avoid overwhelming with too much information at once. Ask one or two questions at a time to guide the conversation naturally.

Start by warmly welcoming them and asking an open-ended question about what brings them to career coaching today.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing career coach request with", messages?.length || 0, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(
          JSON.stringify({ error: "We're experiencing high demand. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Something went wrong. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Streaming response from AI gateway");
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Career coach error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
