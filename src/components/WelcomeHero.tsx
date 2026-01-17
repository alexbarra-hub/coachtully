import { Button } from "@/components/ui/button";
import { Users, Briefcase, MessageCircle, Sparkles } from "lucide-react";
import tullyLogo from "@/assets/tully-logo.png";
import tullyLogoOpen from "@/assets/tully-logo-open.png";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";

interface WelcomeHeroProps {
  onStart: () => void;
}

export function WelcomeHero({ onStart }: WelcomeHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const [isIntroHovered, setIsIntroHovered] = useState(false);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const logoScale = useTransform(scrollYProgress, [0, 0.3], [1.25, 1]);
  const logoY = useTransform(scrollYProgress, [0, 0.3], [0, -20]);
  const introOpacity = useTransform(scrollYProgress, [0.1, 0.25], [0, 1]);
  const introY = useTransform(scrollYProgress, [0.1, 0.25], [30, 0]);

  return (
    <div ref={containerRef} className="flex-1 flex flex-col items-center px-6 py-12 text-center">
      {/* Hero Section */}
      <motion.div 
        className="flex flex-col items-center justify-center min-h-[60vh]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.img 
          src={isHeroHovered ? tullyLogoOpen : tullyLogo} 
          alt="Tully" 
          className="w-48 h-48 object-cover mb-8 cursor-pointer transition-transform hover:scale-105"
          style={{ scale: logoScale, y: logoY }}
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
        />
        
        <div className="flex items-center gap-3 mb-4">
          <img src={tullyLogo} alt="Tully" className="w-12 h-12 object-cover" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight font-serif">
            Grow your career with <span className="text-poppy-warm">Tully</span>
          </h1>
        </div>
        
        <p className="text-lg text-muted-foreground max-w-xl mb-6 leading-relaxed font-serif">
          Your AI coach for building the skills that get you promoted.
        </p>

        <motion.div
          className="flex items-center gap-2 text-muted-foreground mb-8"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className="text-sm font-serif">Scroll to meet Tully</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Tully Introduction Section */}
      <motion.div 
        id="tully-intro"
        className="max-w-2xl mx-auto py-16"
        style={{ opacity: introOpacity, y: introY }}
      >
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg relative">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2">
            <div className="w-12 h-12 rounded-full bg-poppy-warm flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div className="flex items-start gap-4 mt-4">
            <img 
              src={isIntroHovered ? tullyLogoOpen : tullyLogo} 
              alt="Tully" 
              className="w-16 h-16 object-cover rounded-full border-2 border-poppy-warm cursor-pointer transition-transform hover:scale-110"
              onMouseEnter={() => setIsIntroHovered(true)}
              onMouseLeave={() => setIsIntroHovered(false)}
            />
            <div className="text-left">
              <h2 className="font-semibold text-foreground font-serif text-xl mb-2">
                Hi, I'm Tully! 👋
              </h2>
              <p className="text-muted-foreground font-serif leading-relaxed">
                I'm your personal career coach, and I'm here to help you grow from where you are now to where you want to be. Whether you're a cashier dreaming of becoming a supervisor, or a team lead ready for management — I've got your back!
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-muted/50 rounded-xl">
            <p className="text-sm text-muted-foreground font-serif italic">
              "Let's start with a quick skills check-in so I can create your personalized growth plan. It only takes a few minutes!"
            </p>
          </div>
        </div>
      </motion.div>

      {/* Skills Assessment Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl"
      >
        <p className="text-sm text-muted-foreground mb-6 font-serif">We'll assess you in 3 key areas:</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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
            delay={0}
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
            delay={0.1}
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
            delay={0.2}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            onClick={onStart}
            size="lg"
            className="h-14 px-8 text-lg rounded-xl bg-poppy-warm-gradient hover:opacity-90 transition-opacity shadow-md font-serif"
          >
            Start Skills Assessment
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-14 px-8 text-lg rounded-xl font-serif"
          >
            <Link to="/pricing">View Pricing</Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

function SkillCard({ 
  icon, 
  title, 
  skills, 
  color,
  delay = 0
}: { 
  icon: React.ReactNode; 
  title: string; 
  skills: string[];
  color: string;
  delay?: number;
}) {
  return (
    <motion.div 
      className="p-6 rounded-xl bg-card border border-border text-left hover:shadow-lg transition-shadow"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
    >
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
    </motion.div>
  );
}