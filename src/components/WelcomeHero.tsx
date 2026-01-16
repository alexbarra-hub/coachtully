import { Button } from "@/components/ui/button";
import { Target, Compass, TrendingUp } from "lucide-react";
import poppyLogo from "@/assets/poppy-logo.png";

interface WelcomeHeroProps {
  onStart: () => void;
}

export function WelcomeHero({ onStart }: WelcomeHeroProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center animate-fade-in">
      <img src={poppyLogo} alt="Poppy" className="w-48 h-48 object-cover scale-125 mb-8" />
      
      <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight font-serif">
        Your Career,{" "}
        <span className="text-poppy-warm">Reimagined</span>
      </h1>
      
      <p className="text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed font-serif">
        Talk with Poppy, your AI career coach, to discover what truly fulfills you and create a clear path forward.
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
          title="Explore Your Values"
          description="Discover what truly matters to you in work and life"
        />
        <FeatureCard
          icon={<Target className="w-6 h-6" />}
          title="Find Your Path"
          description="Identify careers that align with your unique strengths"
        />
        <FeatureCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Take Action"
          description="Get concrete steps to move toward your goals"
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
