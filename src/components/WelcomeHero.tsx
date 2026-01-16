import { Button } from "@/components/ui/button";
import { Gamepad2, Award, TrendingUp } from "lucide-react";
import tullyLogo from "@/assets/tully-logo.png";

interface WelcomeHeroProps {
  onStart: () => void;
}

export function WelcomeHero({ onStart }: WelcomeHeroProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center animate-fade-in">
      <img src={tullyLogo} alt="Tully" className="w-48 h-48 object-cover scale-125 mb-8" />
      
      <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight font-serif">
        Grow Your{" "}
        <span className="text-poppy-warm">Career</span>
      </h1>
      
      <p className="text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed font-serif">
        Your AI coach for going from frontline to leadership. Personalized learning, real scenarios, and a clear path to your next promotion.
      </p>

      <Button
        onClick={onStart}
        size="lg"
        className="h-14 px-8 text-lg rounded-xl bg-poppy-warm-gradient hover:opacity-90 transition-opacity shadow-md font-serif"
      >
        Start Your Journey
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-3xl w-full">
        <FeatureCard
          icon={<Award className="w-6 h-6" />}
          title="Skills Assessment"
          description="Discover your strengths and get a personalized growth plan"
        />
        <FeatureCard
          icon={<Gamepad2 className="w-6 h-6" />}
          title="Learn by Doing"
          description="Gamified scenarios and role-plays that build real skills"
        />
        <FeatureCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Track to Promotion"
          description="See your progress toward supervisor and leadership roles"
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl bg-card border border-border text-left">
      <div className="w-12 h-12 rounded-lg bg-poppy-warm-light flex items-center justify-center text-poppy-warm mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-foreground mb-2 font-serif">{title}</h3>
      <p className="text-sm text-muted-foreground font-serif">{description}</p>
    </div>
  );
}
