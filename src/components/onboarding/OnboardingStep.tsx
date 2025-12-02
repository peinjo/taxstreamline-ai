import React from "react";
import { Calculator, Calendar, FileText, Sparkles, Building2 } from "lucide-react";

interface OnboardingStepProps {
  step: number;
  content: string;
}

const stepIcons = [Sparkles, Building2, Calculator, Calendar, FileText];

export const OnboardingStep: React.FC<OnboardingStepProps> = ({ step, content }) => {
  const Icon = stepIcons[step] || Sparkles;

  return (
    <div className="flex flex-col items-center space-y-4 text-center">
      <div className="rounded-full bg-primary/10 p-6">
        <Icon className="h-12 w-12 text-primary" />
      </div>
      <p className="text-muted-foreground max-w-md">{content}</p>
    </div>
  );
};
