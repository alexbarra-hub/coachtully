import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, isLoading, placeholder = "Type your message..." }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (trimmed && !isLoading) {
      onSend(trimmed);
      setInput("");
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
    <div className="flex gap-3 items-end">
      <div className="flex-1 relative">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className="min-h-[52px] max-h-[120px] resize-none pr-4 py-3.5 text-base rounded-xl border-border bg-card focus-visible:ring-accent"
          rows={1}
        />
      </div>
      <Button
        onClick={handleSubmit}
        disabled={!input.trim() || isLoading}
        size="lg"
        className="h-[52px] w-[52px] rounded-xl bg-coach-warm-gradient hover:opacity-90 transition-opacity"
      >
        <Send className="w-5 h-5" />
      </Button>
    </div>
  );
}
