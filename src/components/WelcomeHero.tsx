import { Button } from "@/components/ui/button";
import { Users, Briefcase, MessageCircle } from "lucide-react";
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
        Your AI coach for going from frontline to leadership. Start with a quick skills assessment, then get personalized training.
      </p>

      <Button
        onClick={onStart}
        size="lg"
        className="h-14 px-8 text-lg rounded-xl bg-poppy-warm-gradient hover:opacity-90 transition-opacity shadow-md font-serif"
      >
        Start Skills Assessment
      </Button>

      <p className="text-sm text-muted-foreground mt-4 mb-8 font-serif">We'll assess you in 3 key areas:</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        <SkillCard
          icon={<Users className="w-7 h-7" />}
          title="Leadership & People"
          skills={[
            "Team motivation & coaching",
            "Conflict resolution",
            "Hiring & onboarding",
            "Shift scheduling",
            "Emotional intelligence"
          ]}
          color="bg-blue-500"
        />
        <SkillCard
          icon={<Briefcase className="w-7 h-7" />}
          title="Operations & Business"
          skills={[
            "Time management",
            "Decision-making under pressure",
            "Sales & inventory tracking",
            "Payroll & budgets",
            "Compliance & reporting"
          ]}
          color="bg-emerald-500"
        />
        <SkillCard
          icon={<MessageCircle className="w-7 h-7" />}
          title="Customer & Communication"
          skills={[
            "Complaints handling",
            "Quality benchmarks",
            "Team communication",
            "Non-verbal cues",
            "Sales strategies"
          ]}
          color="bg-amber-500"
        />
      </div>
    </div>
  );
}

function SkillCard({ 
  icon, 
  title, 
  skills, 
  color 
}: { 
  icon: React.ReactNode; 
  title: string; 
  skills: string[];
  color: string;
}) {
  return (
    <div className="p-6 rounded-xl bg-card border border-border text-left hover:shadow-lg transition-shadow">
      <div className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center text-white mb-4`}>
        {icon}
      </div>
      <h3 className="font-semibold text-foreground mb-3 font-serif text-lg">{title}</h3>
      <ul className="space-y-2">
        {skills.map((skill, index) => (
          <li key={index} className="text-sm text-muted-foreground font-serif flex items-start gap-2">
            <span className="text-poppy-warm mt-1">•</span>
            {skill}
          </li>
        ))}
      </ul>
    </div>
  );
}
