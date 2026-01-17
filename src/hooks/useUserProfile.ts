import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserProfile {
  jobTitle: string | null;
  currentGoal: string | null;
  skillsAssessed: boolean;
  lastSessionSummary: string | null;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    jobTitle: null,
    currentGoal: null,
    skillsAssessed: false,
    lastSessionSummary: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("job_title, current_goal, skills_assessed, last_session_summary")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          setIsLoading(false);
          return;
        }

        if (data) {
          setProfile({
            jobTitle: data.job_title,
            currentGoal: data.current_goal,
            skillsAssessed: data.skills_assessed ?? false,
            lastSessionSummary: data.last_session_summary,
          });
        }
      } catch (err) {
        console.error("Error in fetchProfile:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) return false;

    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.jobTitle !== undefined) dbUpdates.job_title = updates.jobTitle;
      if (updates.currentGoal !== undefined) dbUpdates.current_goal = updates.currentGoal;
      if (updates.skillsAssessed !== undefined) dbUpdates.skills_assessed = updates.skillsAssessed;
      if (updates.lastSessionSummary !== undefined) dbUpdates.last_session_summary = updates.lastSessionSummary;

      const { error } = await supabase
        .from("profiles")
        .update(dbUpdates)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error updating profile:", error);
        return false;
      }

      setProfile(prev => ({ ...prev, ...updates }));
      return true;
    } catch (err) {
      console.error("Error in updateProfile:", err);
      return false;
    }
  }, [user]);

  return { profile, isLoading, updateProfile };
}
