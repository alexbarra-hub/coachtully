import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

interface TrialExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TrialExpiredModal({ isOpen, onClose }: TrialExpiredModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-poppy-warm/10 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-poppy-warm" />
          </div>
          <DialogTitle className="text-2xl font-serif text-center">
            Your Trial Has Ended
          </DialogTitle>
          <DialogDescription className="text-center font-serif pt-2">
            Your 14-day free trial has expired. Upgrade now to continue building the skills that get you promoted!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="bg-muted/50 rounded-xl p-4 space-y-2">
            <p className="text-sm font-medium text-foreground">With a subscription, you get:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Unlimited AI coaching sessions</li>
              <li>• Personalized skill development plans</li>
              <li>• Progress tracking and analytics</li>
              <li>• Priority support</li>
            </ul>
          </div>
          
          <Button
            asChild
            className="w-full h-12 bg-poppy-warm-gradient hover:opacity-90 transition-opacity text-white font-semibold"
          >
            <Link to="/pricing">View Plans & Upgrade</Link>
          </Button>
          
          <button
            onClick={onClose}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
