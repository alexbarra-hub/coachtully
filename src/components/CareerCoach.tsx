import { useEffect, useRef, useState } from "react";
import { useCareerCoach } from "@/hooks/useCareerCoach";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { WelcomeHero } from "@/components/WelcomeHero";
import { Button } from "@/components/ui/button";
import { RotateCcw, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function CareerCoach() {
  const { messages, isLoading, isStreaming, sendMessage, startConversation, resetChat } = useCareerCoach();
  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleStart = async () => {
    setHasStarted(true);
    await startConversation();
  };

  const handleReset = () => {
    resetChat();
    setHasStarted(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-coach-warm-gradient flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Career Coach</span>
          </div>
        </header>
        <WelcomeHero onStart={handleStart} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-coach-warm-gradient flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Career Coach</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <ScrollArea className="flex-1 px-6">
          <div className="py-6 space-y-6">
            {messages.map((msg, idx) => (
              <ChatMessage
                key={idx}
                role={msg.role}
                content={msg.content}
                isStreaming={isStreaming && idx === messages.length - 1 && msg.role === "assistant"}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t border-border bg-card/50 backdrop-blur-sm p-6">
          <ChatInput
            onSend={sendMessage}
            isLoading={isLoading}
            placeholder="Share your thoughts about your career..."
          />
          <p className="text-xs text-muted-foreground text-center mt-3">
            Your conversation is private and not stored.
          </p>
        </div>
      </div>
    </div>
  );
}
