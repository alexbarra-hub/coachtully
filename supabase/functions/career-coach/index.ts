import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";

// ============================================
// CORS CONFIGURATION
// Only allow requests from known origins
// ============================================
const ALLOWED_ORIGINS = [
  "https://coachtully.lovable.app",
  "https://id-preview--3a53c75f-053b-4810-bc87-cb1747fabeb1.lovable.app",
];

// Development origins (localhost) - pattern match for any port
const DEV_ORIGIN_PATTERN = /^https?:\/\/localhost(:\d+)?$/;

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && (
    ALLOWED_ORIGINS.includes(origin) || DEV_ORIGIN_PATTERN.test(origin)
  ) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

// ============================================
// RATE LIMITING
// IP-based and user-based rate limiting with graceful 429 responses
// Uses in-memory store (resets on function cold start)
// ============================================
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Rate limit stores - separate for IP and user
const ipRateLimits = new Map<string, RateLimitEntry>();
const userRateLimits = new Map<string, RateLimitEntry>();

// Rate limit configuration (OWASP recommended defaults)
const RATE_LIMIT_CONFIG = {
  // IP-based: 60 requests per minute (protects against anonymous abuse)
  ip: { maxRequests: 60, windowMs: 60 * 1000 },
  // User-based: 30 requests per minute (protects against authenticated abuse)
  user: { maxRequests: 30, windowMs: 60 * 1000 },
};

/**
 * Check and update rate limit for a given key
 * Returns true if request should be allowed, false if rate limited
 */
function checkRateLimit(
  store: Map<string, RateLimitEntry>,
  key: string,
  config: { maxRequests: number; windowMs: number }
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  // Clean up expired entries periodically (every ~100 requests)
  if (Math.random() < 0.01) {
    for (const [k, v] of store.entries()) {
      if (v.resetAt < now) store.delete(k);
    }
  }

  // No entry or expired - create new window
  if (!entry || entry.resetAt < now) {
    const newEntry = { count: 1, resetAt: now + config.windowMs };
    store.set(key, newEntry);
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: newEntry.resetAt };
  }

  // Within window - check limit
  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  // Increment counter
  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt };
}

/**
 * Get client IP from request headers (handles proxies)
 */
function getClientIp(req: Request): string {
  // Check standard proxy headers (in priority order)
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Take the first IP (original client)
    return forwardedFor.split(",")[0].trim();
  }
  
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  
  // Fallback - use a hash of other identifying info
  return "unknown";
}

/**
 * Create a 429 response with proper headers
 */
function createRateLimitResponse(
  corsHeaders: Record<string, string>,
  resetAt: number,
  type: "ip" | "user"
): Response {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
  const message = type === "ip"
    ? "Too many requests from this IP address. Please wait a moment before trying again."
    : "You're sending messages too quickly. Please slow down and try again shortly.";

  console.warn(`Rate limit exceeded (${type}), retry after ${retryAfter}s`);

  return new Response(
    JSON.stringify({ 
      error: message,
      retryAfter,
    }),
    { 
      status: 429, 
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
      } 
    }
  );
}

// ============================================
// INPUT VALIDATION SCHEMAS
// Strict validation with length limits, type checks, and unexpected field rejection
// Following OWASP best practices
// ============================================

// Allowed message roles (strict enum)
const ALLOWED_ROLES = ["user", "assistant"] as const;

// Maximum lengths for different content types
const MAX_LENGTHS = {
  messageContent: 10000,     // 10k chars per message
  messageArray: 100,         // Max 100 messages in history
  jobTitle: 100,             // Job titles
  currentGoal: 500,          // Goal description
  lastSessionSummary: 1000,  // Session summary
};

// Message schema with strict validation
const MessageSchema = z.object({
  role: z.enum(ALLOWED_ROLES),
  content: z
    .string()
    .min(1, "Message content cannot be empty")
    .max(MAX_LENGTHS.messageContent, `Message content exceeds ${MAX_LENGTHS.messageContent} characters`)
    .transform((val) => val.trim()) // Sanitize: trim whitespace
    .refine((val) => val.length > 0, "Message content cannot be only whitespace"),
}).strict(); // Reject unexpected fields

// User profile schema with strict validation
const UserProfileSchema = z.object({
  jobTitle: z
    .string()
    .max(MAX_LENGTHS.jobTitle, `Job title exceeds ${MAX_LENGTHS.jobTitle} characters`)
    .transform((val) => val?.trim() || null) // Sanitize
    .nullable()
    .optional(),
  currentGoal: z
    .string()
    .max(MAX_LENGTHS.currentGoal, `Goal exceeds ${MAX_LENGTHS.currentGoal} characters`)
    .transform((val) => val?.trim() || null) // Sanitize
    .nullable()
    .optional(),
  skillsAssessed: z
    .boolean()
    .nullable()
    .optional(),
  lastSessionSummary: z
    .string()
    .max(MAX_LENGTHS.lastSessionSummary, `Summary exceeds ${MAX_LENGTHS.lastSessionSummary} characters`)
    .transform((val) => val?.trim() || null) // Sanitize
    .nullable()
    .optional(),
}).strict().nullable().optional(); // Reject unexpected fields

// Main request schema with strict validation
const RequestSchema = z.object({
  messages: z
    .array(MessageSchema)
    .max(MAX_LENGTHS.messageArray, `Too many messages (max ${MAX_LENGTHS.messageArray})`),
  userProfile: UserProfileSchema,
}).strict(); // Reject any unexpected fields at root level

// ============================================
// SYSTEM PROMPT
// AI persona and instructions
// ============================================
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

/**
 * Build system prompt with optional user profile context
 * Sanitizes profile data before including in prompt
 */
function buildSystemPrompt(userProfile?: { 
  jobTitle?: string | null; 
  currentGoal?: string | null; 
  skillsAssessed?: boolean | null; 
  lastSessionSummary?: string | null 
} | null): string {
  let prompt = SYSTEM_PROMPT;
  
  if (userProfile && (userProfile.jobTitle || userProfile.currentGoal || userProfile.skillsAssessed)) {
    prompt += `\n\nUSER PROFILE CONTEXT:`;
    
    // Safely include sanitized profile data
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

// ============================================
// MAIN REQUEST HANDLER
// ============================================
serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // ----------------------------------------
    // STEP 1: IP-based rate limiting (pre-auth)
    // Protects against DDoS and anonymous abuse
    // ----------------------------------------
    const clientIp = getClientIp(req);
    const ipRateCheck = checkRateLimit(ipRateLimits, clientIp, RATE_LIMIT_CONFIG.ip);
    
    if (!ipRateCheck.allowed) {
      return createRateLimitResponse(corsHeaders, ipRateCheck.resetAt, "ip");
    }

    // ----------------------------------------
    // STEP 2: Validate JWT authentication
    // ----------------------------------------
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("Missing or invalid Authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized - authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate token length before processing (basic sanity check)
    const token = authHeader.replace("Bearer ", "");
    if (token.length < 10 || token.length > 5000) {
      console.error("Invalid token format");
      return new Response(
        JSON.stringify({ error: "Unauthorized - invalid token format" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error("JWT validation failed:", claimsError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized - invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    if (!userId || typeof userId !== "string") {
      console.error("Invalid user ID in token claims");
      return new Response(
        JSON.stringify({ error: "Unauthorized - invalid user identity" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ----------------------------------------
    // STEP 3: User-based rate limiting (post-auth)
    // Protects against authenticated user abuse
    // ----------------------------------------
    const userRateCheck = checkRateLimit(userRateLimits, userId, RATE_LIMIT_CONFIG.user);
    
    if (!userRateCheck.allowed) {
      return createRateLimitResponse(corsHeaders, userRateCheck.resetAt, "user");
    }

    console.log("Authenticated user:", userId);

    // ----------------------------------------
    // STEP 4: Parse and validate request body
    // Strict schema validation with sanitization
    // ----------------------------------------
    let rawBody: unknown;
    try {
      const bodyText = await req.text();
      
      // Basic size check before parsing (1MB limit)
      if (bodyText.length > 1024 * 1024) {
        console.error("Request body too large:", bodyText.length);
        return new Response(
          JSON.stringify({ error: "Request body too large (max 1MB)" }),
          { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      rawBody = JSON.parse(bodyText);
    } catch {
      console.error("Invalid JSON body");
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate against strict schema (rejects unexpected fields)
    const validationResult = RequestSchema.safeParse(rawBody);
    if (!validationResult.success) {
      const errorDetails = validationResult.error.errors
        .map(e => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
      console.error("Validation error:", errorDetails);
      
      // Return generic error to client (don't expose schema details)
      return new Response(
        JSON.stringify({ error: "Invalid request format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Data is now validated and sanitized
    const { messages, userProfile } = validationResult.data;

    // ----------------------------------------
    // STEP 5: Call AI Gateway
    // Uses server-side environment variable for API key
    // ----------------------------------------
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Service configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Minimal logging - avoid exposing sensitive data in logs
    console.log(`Processing request: user=${userId.substring(0, 8)}... msgs=${messages?.length || 0}`);

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

    // ----------------------------------------
    // STEP 6: Handle AI Gateway response
    // ----------------------------------------
    if (!response.ok) {
      if (response.status === 429) {
        console.error("AI Gateway rate limit exceeded");
        return new Response(
          JSON.stringify({ error: "We're experiencing high demand. Please try again in a moment." }),
          { 
            status: 429, 
            headers: { 
              ...corsHeaders, 
              "Content-Type": "application/json",
              "Retry-After": "30",
            } 
          }
        );
      }
      if (response.status === 402) {
        console.error("AI Gateway payment required");
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Something went wrong. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Stream response with rate limit headers
    console.log("Streaming response from AI gateway");
    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "text/event-stream",
        "X-RateLimit-Remaining": String(userRateCheck.remaining),
        "X-RateLimit-Reset": String(Math.ceil(userRateCheck.resetAt / 1000)),
      },
    });
    
  } catch (e) {
    console.error("Career coach error:", e);
    
    // Don't expose internal error details to client
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
