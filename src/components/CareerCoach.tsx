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
import { RotateCcw, LogOut, Menu, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";
import tullyLogo from "@/assets/tully-logo.png";

export function CareerCoach() {
  const { messages, isLoading, isStreaming, sendMessage, startConversation, resetChat } = useCareerCoach();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { trialStatus, isLoading: trialLoading } = useTrialStatus();
  const [hasStarted, setHasStarted] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <img src={tullyLogo} alt="Tully" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
              <span className="font-semibold text-foreground font-serif text-base sm:text-lg">Tully</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden sm:flex items-center gap-6">
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="sm:hidden border-t border-border bg-card/95 backdrop-blur-sm">
              <nav className="flex flex-col px-4 py-3 gap-3">
                <button 
                  onClick={() => {
                    scrollToIntro();
                    setMobileMenuOpen(false);
                  }}
                  className="text-muted-foreground hover:text-foreground font-serif text-sm transition-colors text-left py-2"
                >
                  About
                </button>
                <Link 
                  to="/pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-muted-foreground hover:text-foreground font-serif text-sm transition-colors py-2"
                >
                  Pricing
                </Link>
                {user ? (
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="text-muted-foreground hover:text-foreground font-serif text-sm transition-colors flex items-center gap-1 py-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                ) : (
                  <Button 
                    asChild
                    className="bg-poppy-warm-gradient hover:opacity-90 transition-opacity text-white font-serif text-sm font-medium w-full"
                  >
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      Start Your Trial Now!
                    </Link>
                  </Button>
                )}
              </nav>
            </div>
          )}
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <img src={tullyLogo} alt="Tully" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
            <span className="font-semibold text-foreground font-serif text-base sm:text-lg">Tully</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-muted-foreground hover:text-foreground font-serif text-xs sm:text-sm"
          >
            <RotateCcw className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">New Chat</span>
            <span className="xs:hidden">Reset</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <ScrollArea className="flex-1 px-4 sm:px-6">
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

        <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4 sm:p-6">
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
