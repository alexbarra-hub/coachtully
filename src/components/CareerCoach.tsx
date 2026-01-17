import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCareerCoach } from "@/hooks/useCareerCoach";
import { useAuth } from "@/contexts/AuthContext";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { WelcomeHero } from "@/components/WelcomeHero";
import { TrialExpiredModal } from "@/components/TrialExpiredModal";
import { TrialBanner } from "@/components/TrialBanner";
import { Button } from "@/components/ui/button";
import { RotateCcw, LogOut } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";
import tullyLogo from "@/assets/tully-logo.png";

export function CareerCoach() {
  const { messages, isLoading, isStreaming, sendMessage, startConversation, resetChat } = useCareerCoach();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { trialStatus, isLoading: trialLoading } = useTrialStatus();
  const [hasStarted, setHasStarted] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleStart = async () => {
    // Require authentication to start the assessment
    if (!user) {
      navigate("/auth");
      return;
    }
    
    // Check if trial has expired
    if (trialStatus.isExpired) {
      setShowExpiredModal(true);
      return;
    }
    
    setHasStarted(true);
    await startConversation();
  };

  const handleReset = () => {
    resetChat();
    setHasStarted(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setHasStarted(false);
    resetChat();
  };

  const scrollToIntro = () => {
    const introSection = document.getElementById('tully-intro');
    if (introSection) {
      introSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {user && trialStatus.isTrialing && (
          <TrialBanner daysRemaining={trialStatus.daysRemaining} />
        )}
        <TrialExpiredModal 
          isOpen={showExpiredModal} 
          onClose={() => setShowExpiredModal(false)} 
        />
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={tullyLogo} alt="Tully" className="w-10 h-10 object-contain" />
              <span className="font-semibold text-foreground font-serif text-lg">Tully</span>
            </div>
            <nav className="flex items-center gap-6">
              <button 
                onClick={scrollToIntro}
                className="text-muted-foreground hover:text-foreground font-serif text-sm transition-colors"
              >
                About
              </button>
              <Link 
                to="/pricing"
                className="text-muted-foreground hover:text-foreground font-serif text-sm transition-colors"
              >
                Pricing
              </Link>
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground font-serif text-sm transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              ) : (
                <Button 
                  asChild
                  className="bg-poppy-warm-gradient hover:opacity-90 transition-opacity text-white font-serif text-sm font-medium"
                >
                  <Link to="/auth">
                    Start Your Trial Now!
                  </Link>
                </Button>
              )}
            </nav>
          </div>
        </header>
        <WelcomeHero onStart={handleStart} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {trialStatus.isTrialing && (
        <TrialBanner daysRemaining={trialStatus.daysRemaining} />
      )}
      <TrialExpiredModal 
        isOpen={showExpiredModal} 
        onClose={() => setShowExpiredModal(false)} 
      />
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={tullyLogo} alt="Tully" className="w-10 h-10 object-contain" />
            <span className="font-semibold text-foreground font-serif text-lg">Tully</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-muted-foreground hover:text-foreground font-serif"
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
            placeholder="Tell me about your current role and goals..."
          />
          <p className="text-xs text-muted-foreground text-center mt-3 font-serif">
            Your conversation is private and not stored.
          </p>
        </div>
      </div>
    </div>
  );
}
