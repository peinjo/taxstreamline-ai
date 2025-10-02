import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OnboardingContextType {
  isOnboarding: boolean;
  currentStep: number;
  isCompleted: boolean;
  isSkipped: boolean;
  startOnboarding: () => void;
  nextStep: () => void;
  previousStep: () => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
  goToStep: (step: number) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const TOTAL_STEPS = 4;

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadOnboardingStatus();
  }, []);

  const loadOnboardingStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_profiles")
        .select("onboarding_completed, onboarding_step, onboarding_skipped")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setIsCompleted(data.onboarding_completed || false);
        setIsSkipped(data.onboarding_skipped || false);
        setCurrentStep(data.onboarding_step || 0);
        
        // Auto-start onboarding if not completed and not skipped
        if (!data.onboarding_completed && !data.onboarding_skipped) {
          setIsOnboarding(true);
        }
      }
    } catch (error) {
      console.error("Error loading onboarding status:", error);
    }
  };

  const updateOnboardingStatus = async (updates: {
    onboarding_completed?: boolean;
    onboarding_step?: number;
    onboarding_skipped?: boolean;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("user_profiles")
        .update(updates)
        .eq("user_id", user.id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating onboarding status:", error);
      toast({
        title: "Error",
        description: "Failed to save onboarding progress",
        variant: "destructive",
      });
    }
  };

  const startOnboarding = () => {
    setIsOnboarding(true);
    setCurrentStep(0);
    updateOnboardingStatus({ onboarding_step: 0, onboarding_skipped: false });
  };

  const nextStep = () => {
    const newStep = Math.min(currentStep + 1, TOTAL_STEPS - 1);
    setCurrentStep(newStep);
    updateOnboardingStatus({ onboarding_step: newStep });
  };

  const previousStep = () => {
    const newStep = Math.max(currentStep - 1, 0);
    setCurrentStep(newStep);
    updateOnboardingStatus({ onboarding_step: newStep });
  };

  const goToStep = (step: number) => {
    const validStep = Math.max(0, Math.min(step, TOTAL_STEPS - 1));
    setCurrentStep(validStep);
    updateOnboardingStatus({ onboarding_step: validStep });
  };

  const skipOnboarding = () => {
    setIsOnboarding(false);
    setIsSkipped(true);
    updateOnboardingStatus({ onboarding_skipped: true });
    toast({
      title: "Onboarding skipped",
      description: "You can restart the tour anytime from settings",
    });
  };

  const completeOnboarding = () => {
    setIsOnboarding(false);
    setIsCompleted(true);
    updateOnboardingStatus({ onboarding_completed: true });
    toast({
      title: "Welcome aboard! 🎉",
      description: "You're all set to start managing your tax and compliance needs",
    });
  };

  return (
    <OnboardingContext.Provider
      value={{
        isOnboarding,
        currentStep,
        isCompleted,
        isSkipped,
        startOnboarding,
        nextStep,
        previousStep,
        skipOnboarding,
        completeOnboarding,
        goToStep,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
};
