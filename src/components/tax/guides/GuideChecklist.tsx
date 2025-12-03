import { useState, useEffect, useMemo, useCallback } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, RotateCcw, ClipboardList } from "lucide-react";
import { secureStorage } from "@/lib/security/secureStorage";
import { GuideStepList } from "./GuideStepList";
import { parseGuideSteps, calculateProgress } from "./utils/parseGuideSteps";
import { useToast } from "@/components/ui/use-toast";

interface TaxGuide {
  id: number;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

interface GuideChecklistProps {
  guide: TaxGuide;
  onComplete?: () => void;
}

interface SavedProgress {
  completedSteps: string[];
  lastUpdated: string;
}

export function GuideChecklist({ guide, onComplete }: GuideChecklistProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const steps = useMemo(() => parseGuideSteps(guide.content), [guide.content]);
  const progress = useMemo(
    () => calculateProgress(completedSteps, steps.length),
    [completedSteps, steps.length]
  );

  const storageKey = `guide_progress_${guide.id}`;

  // Load saved progress on mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const saved = await secureStorage.getItem<SavedProgress>(storageKey, {
          completedSteps: [],
          lastUpdated: "",
        });
        if (saved.completedSteps.length > 0) {
          setCompletedSteps(new Set(saved.completedSteps));
        }
      } catch (error) {
        // Fallback to empty progress
      } finally {
        setIsLoading(false);
      }
    };
    loadProgress();
  }, [storageKey]);

  // Save progress when it changes
  const saveProgress = useCallback(
    async (steps: Set<string>) => {
      try {
        await secureStorage.setItem(storageKey, {
          completedSteps: Array.from(steps),
          lastUpdated: new Date().toISOString(),
        });
      } catch (error) {
        // Silent fail for storage
      }
    },
    [storageKey]
  );

  const handleStepToggle = useCallback(
    (stepId: string) => {
      setCompletedSteps((prev) => {
        const next = new Set(prev);
        if (next.has(stepId)) {
          next.delete(stepId);
        } else {
          next.add(stepId);
        }
        saveProgress(next);

        // Check if all steps completed
        if (next.size === steps.length && onComplete) {
          setTimeout(onComplete, 300);
        }

        return next;
      });
    },
    [saveProgress, steps.length, onComplete]
  );

  const handleReset = async () => {
    setCompletedSteps(new Set());
    await secureStorage.removeItem(storageKey);
    toast({
      title: "Progress Reset",
      description: "Your checklist progress has been cleared.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading progress...</div>
      </div>
    );
  }

  const isComplete = progress === 100;

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <Card className={isComplete ? "border-primary bg-primary/5" : ""}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-4 w-4" />
              {guide.title}
            </CardTitle>
            {completedSteps.size > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-muted-foreground hover:text-destructive"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {completedSteps.size} of {steps.length} steps completed
              </span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {isComplete && (
            <div className="mt-4 flex items-center gap-2 text-primary">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">
                All steps completed! You're ready to file.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step List */}
      <GuideStepList
        steps={steps}
        completedSteps={completedSteps}
        onStepToggle={handleStepToggle}
      />
    </div>
  );
}
