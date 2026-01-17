import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

// Input validation constants (OWASP best practices)
const MAX_MESSAGE_LENGTH = 10000;
const MIN_MESSAGE_LENGTH = 1;

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

/**
 * Sanitize user input to prevent injection attacks
 * Removes control characters and normalizes whitespace
 */
function sanitizeInput(input: string): string {
  return input
    .trim()
    // Remove null bytes and other control characters (except newlines/tabs)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // Normalize multiple spaces to single space
    .replace(/  +/g, " ");
}

/**
 * Validate message content
 * Returns error message if invalid, null if valid
 */
function validateMessage(message: string): string | null {
  if (message.length < MIN_MESSAGE_LENGTH) {
    return "Message cannot be empty";
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return `Message is too long (max ${MAX_MESSAGE_LENGTH} characters)`;
  }
  return null;
}

export function ChatInput({ onSend, isLoading, placeholder = "Type your message..." }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    
    // Clear error when user starts typing again
    if (error) setError(null);
    
    // Show warning if approaching limit
    if (value.length > MAX_MESSAGE_LENGTH * 0.9) {
      setError(`${value.length}/${MAX_MESSAGE_LENGTH} characters`);
    }
  };

  const handleSubmit = () => {
    const sanitized = sanitizeInput(input);
    const validationError = validateMessage(sanitized);
    
    if (validationError) {
      setError(validationError);
      return;
    }
    
    if (!isLoading) {
      onSend(sanitized);
      setInput("");
      setError(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  return (
    <div className="space-y-1">
      <div className="flex gap-3 items-end">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            maxLength={MAX_MESSAGE_LENGTH}
            className="min-h-[52px] max-h-[120px] resize-none pr-4 py-3.5 text-base rounded-xl border-border bg-card focus-visible:ring-accent font-serif"
            rows={1}
            aria-invalid={!!error && !error.includes("characters")}
            aria-describedby={error ? "input-error" : undefined}
          />
        </div>
        <Button
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading || (!!error && !error.includes("characters"))}
          size="lg"
          className="h-[52px] w-[52px] rounded-xl bg-poppy-warm-gradient hover:opacity-90 transition-opacity"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
      {/* Error/character count display */}
      {error && (
        <p 
          id="input-error" 
          className={`text-xs px-1 ${error.includes("characters") ? "text-muted-foreground" : "text-destructive"}`}
          role={error.includes("characters") ? "status" : "alert"}
        >
          {error}
        </p>
      )}
    </div>
  );
}
