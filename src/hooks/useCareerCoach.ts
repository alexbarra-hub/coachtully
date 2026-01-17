import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useUserProfile, UserProfile } from "./useUserProfile";
import { supabase } from "@/integrations/supabase/client";

type Message = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/career-coach`;

export function useCareerCoach() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { profile, updateProfile } = useUserProfile();
  const [isStreaming, setIsStreaming] = useState(false);

  // Extract job title from user message (simple pattern matching)
  const extractJobTitle = (message: string): string | null => {
    const patterns = [
      /i(?:'m| am) (?:a |an |the )?(.+?)(?:\.|,|$| at | in | for | and )/i,
      /(?:work as|working as) (?:a |an |the )?(.+?)(?:\.|,|$| at | in )/i,
      /(?:my (?:job|role|position|title) is) (?:a |an |the )?(.+?)(?:\.|,|$)/i,
      /(?:currently|right now) (?:a |an |the )?(.+?)(?:\.|,|$| at | in )/i,
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        const title = match[1].trim();
        // Filter out non-job responses
        if (title.length > 2 && title.length < 50 && !title.includes("looking") && !title.includes("want")) {
          return title;
        }
      }
    }
    return null;
  };

  const sendMessage = useCallback(async (input: string) => {
    const userMsg: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setIsStreaming(true);

    // Try to extract and save job title if not already set
    if (!profile.jobTitle) {
      const detectedTitle = extractJobTitle(input);
      if (detectedTitle) {
        updateProfile({ jobTitle: detectedTitle });
      }
    }

    let assistantContent = "";

    try {
      // Get the user's session token for authenticated requests
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Please sign in to continue");
        setIsLoading(false);
        setIsStreaming(false);
        return;
      }

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ 
          messages: [...messages, userMsg],
          userProfile: profile,
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        const errorMessage = errorData.error || "Something went wrong. Please try again.";
        
        if (resp.status === 429) {
          toast.error("High demand - please wait a moment and try again");
        } else if (resp.status === 402) {
          toast.error("Service temporarily unavailable");
        } else {
          toast.error(errorMessage);
        }
        
        setMessages(prev => prev.filter(m => m !== userMsg));
        setIsLoading(false);
        setIsStreaming(false);
        return;
      }

      if (!resp.body) {
        throw new Error("No response body");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            /* ignore */
          }
        }
      }
    } catch (e) {
      console.error("Chat error:", e);
      toast.error("Failed to connect. Please try again.");
      setMessages(prev => prev.filter(m => m !== userMsg));
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [messages, profile, updateProfile]);

  const startConversation = useCallback(async () => {
    setIsLoading(true);
    setIsStreaming(true);

    let assistantContent = "";

    try {
      // Get the user's session token for authenticated requests
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Please sign in to continue");
        setIsLoading(false);
        setIsStreaming(false);
        return;
      }

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ 
          messages: [],
          userProfile: profile,
        }),
      });

      if (!resp.ok || !resp.body) {
        throw new Error("Failed to start conversation");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages([{ role: "assistant", content: assistantContent }]);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error("Start conversation error:", e);
      toast.error("Failed to start conversation. Please try again.");
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [profile]);

  const resetChat = useCallback(() => {
    setMessages([]);
  }, []);

  // Save profile details extracted from conversation
  const saveProfileDetails = useCallback(async (details: Partial<UserProfile>) => {
    await updateProfile(details);
  }, [updateProfile]);

  return {
    messages,
    isLoading,
    isStreaming,
    sendMessage,
    startConversation,
    resetChat,
    saveProfileDetails,
    profile,
  };
}
