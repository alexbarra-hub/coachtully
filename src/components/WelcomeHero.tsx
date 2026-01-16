import { Button } from "@/components/ui/button";
import { Target, Compass, TrendingUp } from "lucide-react";
import tullyLogo from "@/assets/tully-logo.png";

interface WelcomeHeroProps {
  onStart: () => void;
}

export function WelcomeHero({ onStart }: WelcomeHeroProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center animate-fade-in">
      <img src={tullyLogo} alt="Tully" className="w-48 h-48 object-cover scale-125 mb-8" />
      
      <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight font-serif">
        Level Up{" "}
        <span className="text-poppy-warm">Your Skills</span>
      </h1>
      
      <p className="text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed font-serif">
        Talk with Tully, your AI upskilling coach, to identify skill gaps, discover learning paths, and navigate your career transition.
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
          icon={<Compass className="w-6 h-6" />}
          title="Assess Your Skills"
          description="Identify your strengths and discover skill gaps to address"
        />
        <FeatureCard
          icon={<Target className="w-6 h-6" />}
          title="Find Learning Paths"
          description="Get personalized recommendations for courses and certifications"
        />
        <FeatureCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Make the Transition"
          description="Navigate career pivots with confidence and a clear plan"
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
