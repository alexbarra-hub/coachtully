import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TrialStatus {
  isTrialing: boolean;
  isExpired: boolean;
  isActive: boolean;
  daysRemaining: number;
  trialEndDate: Date | null;
  subscriptionStatus: string | null;
}

export function useTrialStatus() {
  const { user } = useAuth();
  const [trialStatus, setTrialStatus] = useState<TrialStatus>({
    isTrialing: false,
    isExpired: false,
    isActive: false,
    daysRemaining: 0,
    trialEndDate: null,
    subscriptionStatus: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTrialStatus() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("trial_end_date, subscription_status")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching trial status:", error);
          setIsLoading(false);
          return;
        }

        if (data) {
          const trialEndDate = new Date(data.trial_end_date);
          const now = new Date();
          const daysRemaining = Math.max(
            0,
            Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          );
          
          const isExpired = data.subscription_status === 'trialing' && daysRemaining <= 0;
          
          setTrialStatus({
            isTrialing: data.subscription_status === 'trialing' && daysRemaining > 0,
            isExpired,
            isActive: data.subscription_status === 'active',
            daysRemaining,
            trialEndDate,
            subscriptionStatus: data.subscription_status,
          });
        }
      } catch (err) {
        console.error("Error in fetchTrialStatus:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTrialStatus();
  }, [user]);

  return { trialStatus, isLoading };
}
