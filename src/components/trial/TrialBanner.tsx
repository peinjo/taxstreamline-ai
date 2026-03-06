import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { differenceInDays } from "date-fns";

export const TrialBanner: React.FC = () => {
  const { user } = useAuth();

  const { data: trialInfo } = useQuery({
    queryKey: ["trial-info", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error) return null;
      // Cast since columns were just added via migration
      return data as any;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  if (!trialInfo || trialInfo.subscription_status !== "trial") return null;

  const trialEnd = trialInfo.trial_ends_at ? new Date(trialInfo.trial_ends_at) : null;
  if (!trialEnd) return null;

  const daysLeft = differenceInDays(trialEnd, new Date());
  const isExpired = daysLeft < 0;
  const isUrgent = daysLeft <= 3;

  if (isExpired) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-2.5 flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="font-medium">Your free trial has expired.</span>
          <span className="hidden sm:inline">Upgrade now to continue using TaxEase.</span>
        </div>
        <Link to="/pricing">
          <Button size="sm" variant="destructive" className="gap-1 h-7">
            <Zap className="h-3 w-3" /> Upgrade
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={`${isUrgent ? "bg-destructive/10 border-destructive/20 text-destructive" : "bg-primary/5 border-primary/10 text-primary"} border px-4 py-2 flex items-center justify-between gap-3 text-sm`}>
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 shrink-0" />
        <span>
          <span className="font-medium">{daysLeft} day{daysLeft !== 1 ? "s" : ""}</span> left in your free trial.
        </span>
      </div>
      <Link to="/pricing">
        <Button size="sm" variant="outline" className="gap-1 h-7">
          <Zap className="h-3 w-3" /> Upgrade
        </Button>
      </Link>
    </div>
  );
};
