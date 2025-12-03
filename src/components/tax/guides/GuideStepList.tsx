import { Check, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import type { GuideStep } from "./utils/parseGuideSteps";

interface GuideStepListProps {
  steps: GuideStep[];
  completedSteps: Set<string>;
  onStepToggle: (stepId: string) => void;
}

export function GuideStepList({ steps, completedSteps, onStepToggle }: GuideStepListProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const toggleExpanded = (stepId: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  if (steps.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No steps found in this guide.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {steps.map((step) => {
        const isCompleted = completedSteps.has(step.id);
        const isExpanded = expandedSteps.has(step.id);

        return (
          <div
            key={step.id}
            className={cn(
              "border rounded-lg transition-all duration-200",
              isCompleted
                ? "border-primary/30 bg-primary/5"
                : "border-border bg-card"
            )}
          >
            <div className="flex items-center gap-3 p-4">
              <Checkbox
                id={step.id}
                checked={isCompleted}
                onCheckedChange={() => onStepToggle(step.id)}
                aria-label={`Mark step ${step.number} as ${isCompleted ? "incomplete" : "complete"}`}
              />
              
              <Collapsible
                open={isExpanded}
                onOpenChange={() => toggleExpanded(step.id)}
                className="flex-1"
              >
                <CollapsibleTrigger className="flex items-center gap-2 w-full text-left hover:text-primary transition-colors">
                  <span
                    className={cn(
                      "flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium",
                      isCompleted
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? <Check className="h-3 w-3" /> : step.number}
                  </span>
                  
                  <span
                    className={cn(
                      "flex-1 font-medium",
                      isCompleted && "line-through text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </span>
                  
                  {step.content && (
                    isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )
                  )}
                </CollapsibleTrigger>

                {step.content && (
                  <CollapsibleContent className="mt-3 pl-8">
                    <div className={cn(
                      "prose prose-sm dark:prose-invert max-w-none",
                      isCompleted && "opacity-60"
                    )}>
                      <ReactMarkdown>{step.content}</ReactMarkdown>
                    </div>
                    
                    {step.subSteps.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {step.subSteps.map((subStep, idx) => (
                          <li
                            key={idx}
                            className={cn(
                              "flex items-start gap-2 text-sm",
                              isCompleted && "text-muted-foreground"
                            )}
                          >
                            <span className="text-muted-foreground">{idx + 1}.</span>
                            <span>{subStep}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CollapsibleContent>
                )}
              </Collapsible>
            </div>
          </div>
        );
      })}
    </div>
  );
}
