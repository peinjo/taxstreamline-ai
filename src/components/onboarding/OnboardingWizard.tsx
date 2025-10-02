import React from "react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { OnboardingStep } from "./OnboardingStep";

const STEPS = [
  {
    title: "Welcome to Tax & Compliance Platform",
    description: "Let's get you started with a quick tour of the main features",
    content: "This platform helps you manage tax calculations, compliance tracking, transfer pricing, and audit reporting all in one place.",
  },
  {
    title: "Calculate Your Taxes",
    description: "Access powerful tax calculators for Nigerian tax types",
    content: "Navigate to the Tax Calculator section to compute income tax, VAT, withholding tax, and more. Save calculations and track your tax history.",
  },
  {
    title: "Stay Compliant",
    description: "Track deadlines and compliance requirements",
    content: "Use the Calendar and Compliance sections to manage important dates, set reminders, and ensure you never miss a filing deadline.",
  },
  {
    title: "You're All Set!",
    description: "Start exploring the platform",
    content: "You can access this tour anytime from the help menu. Ready to get started with your first tax calculation?",
  },
];

export const OnboardingWizard: React.FC = () => {
  const {
    isOnboarding,
    currentStep,
    nextStep,
    previousStep,
    skipOnboarding,
    completeOnboarding,
  } = useOnboarding();

  if (!isOnboarding) return null;

  const isLastStep = currentStep === STEPS.length - 1;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <Dialog open={isOnboarding} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[600px]"  onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{STEPS[currentStep].title}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={skipOnboarding}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>{STEPS[currentStep].description}</DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <Progress value={progress} className="mb-6" />
          <OnboardingStep
            step={currentStep}
            content={STEPS[currentStep].content}
          />
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={previousStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={skipOnboarding}>
              Skip Tour
            </Button>
            {isLastStep ? (
              <Button onClick={completeOnboarding}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Get Started
              </Button>
            ) : (
              <Button onClick={nextStep}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
