import React from 'react';
import { PlayCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TourConfig } from '@/lib/help/tours';
import { useHelp } from '@/contexts/HelpContext';
import { useNavigate } from 'react-router-dom';

interface TourCardProps {
  tour: TourConfig;
}

export const TourCard: React.FC<TourCardProps> = ({ tour }) => {
  const { startTour, isTourCompleted } = useHelp();
  const navigate = useNavigate();
  const isCompleted = isTourCompleted(tour.id);

  // Dynamically get the icon component
  const IconComponent = (LucideIcons as any)[tour.icon] || LucideIcons.HelpCircle;

  const handleStartTour = () => {
    // Navigate to the tour's page first if needed
    if (tour.path && window.location.pathname !== tour.path) {
      navigate(tour.path);
      // Wait for navigation then start tour
      setTimeout(() => startTour(tour.id), 500);
    } else {
      startTour(tour.id);
    }
  };

  return (
    <Card className={`relative transition-all ${isCompleted ? 'bg-muted/50' : 'hover:shadow-md'}`}>
      {isCompleted && (
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isCompleted ? 'bg-muted' : 'bg-primary/10'}`}>
            <IconComponent className={`h-5 w-5 ${isCompleted ? 'text-muted-foreground' : 'text-primary'}`} />
          </div>
          <div>
            <CardTitle className="text-base">{tour.title}</CardTitle>
            <CardDescription className="text-sm">
              {tour.steps.length} steps
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4">
          {tour.description}
        </p>
        
        <Button
          onClick={handleStartTour}
          variant={isCompleted ? 'outline' : 'default'}
          size="sm"
          className="w-full gap-2"
        >
          {isCompleted ? (
            <>
              <RotateCcw className="h-4 w-4" />
              Retake Tour
            </>
          ) : (
            <>
              <PlayCircle className="h-4 w-4" />
              Start Tour
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
