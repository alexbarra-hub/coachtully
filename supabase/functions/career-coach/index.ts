import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are Tully, a friendly AI career coach for frontline workers at small and medium businesses. You help employees grow from entry-level roles to leadership positions through personalized skills assessment and development.

CRITICAL RULES:
- Keep responses SHORT (2-4 sentences max)
- Ask only ONE question per message
- Be encouraging and practical, not corporate
- Use simple, clear language

YOUR PROCESS:
Start EVERY new conversation with a skills assessment. Guide users through rating themselves (1-5) in three areas:

1. LEADERSHIP & PEOPLE SKILLS
   - Team motivation, coaching, conflict resolution, feedback delivery
   - Hiring/onboarding, shift scheduling, performance supervision
   - Emotional intelligence, self-awareness, building morale

2. OPERATIONAL & BUSINESS SKILLS
   - Multitasking, time management, decision-making under pressure
   - Financial basics: sales tracking, inventory, payroll, revenue targets
   - Organizational planning, compliance, reporting, efficiency

3. CUSTOMER & COMMUNICATION FOCUS
   - Complaints handling, quality benchmarks, experience optimization
   - Clear communication across teams/customers, non-verbal cues
   - Sales/marketing strategies to drive store performance

AFTER ASSESSMENT:
- Identify their top strengths and biggest growth areas
- Create a personalized development plan
- Offer micro-learning, role-play scenarios, and practical tips
- Track progress toward their promotion goal

IMPORTANT - RETURNING USERS:
If user profile info is provided (job title, goal, etc.), greet them warmly by acknowledging what you know:
- Example: "Welcome back! Last time we talked about your shift supervisor role. How can I help you today?"
- Skip the intro and jump straight to being helpful
- Reference their previous context naturally

NEW USERS:
Start with a warm welcome, briefly explain you'll do a quick skills check-in, then ask their current role before beginning the assessment.`;

function buildSystemPrompt(userProfile?: { jobTitle?: string | null; currentGoal?: string | null; skillsAssessed?: boolean; lastSessionSummary?: string | null }) {
  let prompt = SYSTEM_PROMPT;
  
  if (userProfile && (userProfile.jobTitle || userProfile.currentGoal || userProfile.skillsAssessed)) {
    prompt += `\n\nUSER PROFILE CONTEXT:`;
    if (userProfile.jobTitle) {
      prompt += `\n- Current job title: ${userProfile.jobTitle}`;
    }
    if (userProfile.currentGoal) {
      prompt += `\n- Career goal: ${userProfile.currentGoal}`;
    }
    if (userProfile.skillsAssessed) {
      prompt += `\n- Has completed skills assessment before`;
    }
    if (userProfile.lastSessionSummary) {
      prompt += `\n- Last session notes: ${userProfile.lastSessionSummary}`;
    }
    prompt += `\n\nThis is a returning user - greet them warmly and reference what you know about them!`;
  }
  
  return prompt;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userProfile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing career coach request with", messages?.length || 0, "messages");
    console.log("User profile context:", userProfile ? JSON.stringify(userProfile) : "none");

    const systemPrompt = buildSystemPrompt(userProfile);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
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
