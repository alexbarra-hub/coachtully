import { Link } from "react-router-dom";
import { Clock } from "lucide-react";

interface TrialBannerProps {
  daysRemaining: number;
}

export function TrialBanner({ daysRemaining }: TrialBannerProps) {
  if (daysRemaining > 7) return null;

  const isUrgent = daysRemaining <= 3;

  return (
    <div
      className={`w-full py-2 px-4 text-center text-sm font-medium ${
        isUrgent
          ? "bg-poppy-warm text-white"
          : "bg-poppy-warm/10 text-poppy-warm"
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        <Clock className="w-4 h-4" />
        <span>
          {daysRemaining === 0
            ? "Your trial ends today!"
            : daysRemaining === 1
            ? "Your trial ends tomorrow!"
            : `${daysRemaining} days left in your trial`}
        </span>
        <Link
          to="/pricing"
          className={`underline ml-2 ${
            isUrgent ? "text-white" : "text-poppy-warm"
          }`}
        >
          Upgrade now
        </Link>
      </div>
    </div>
  );
}
