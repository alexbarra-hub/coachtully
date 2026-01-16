import { cn } from "@/lib/utils";
import { User, Flower2 } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-4 animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-poppy-warm-gradient text-accent-foreground"
        )}
      >
        {isUser ? (
          <User className="w-5 h-5" />
        ) : (
          <Flower2 className="w-5 h-5" />
        )}
      </div>
      <div
        className={cn(
          "flex-1 px-5 py-4 rounded-2xl max-w-[80%]",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-md"
            : "bg-card text-card-foreground shadow-sm border border-border rounded-tl-md"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap font-serif">
          {content}
          {isStreaming && (
            <span className="inline-flex ml-1">
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-typing" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-typing ml-1" style={{ animationDelay: "200ms" }} />
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-typing ml-1" style={{ animationDelay: "400ms" }} />
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
