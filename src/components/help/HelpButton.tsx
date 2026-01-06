import React from 'react';
import { HelpCircle, BookOpen, PlayCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useHelp } from '@/contexts/HelpContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { getToursForPage } from '@/lib/help/tours';
import { trackHelpAction } from '@/lib/analytics/events';

export const HelpButton: React.FC = () => {
  const { openHelp, startTour } = useHelp();
  const location = useLocation();
  const navigate = useNavigate();
  
  const pageTours = getToursForPage(location.pathname);
  
  const handleOpenHelp = () => {
    trackHelpAction('open');
    openHelp();
  };

  const handleStartTour = (tourId: string) => {
    startTour(tourId);
  };

  const handleGoToHelpSettings = () => {
    navigate('/settings?tab=help');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-shadow bg-primary text-primary-foreground hover:bg-primary/90"
          data-tour="help-button"
        >
          <HelpCircle className="h-6 w-6" />
          <span className="sr-only">Help</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Need Help?</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleOpenHelp}>
          <BookOpen className="mr-2 h-4 w-4" />
          <span>Help Center</span>
        </DropdownMenuItem>
        
        {pageTours.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Page Tours
            </DropdownMenuLabel>
            {pageTours.map((tour) => (
              <DropdownMenuItem
                key={tour.id}
                onClick={() => handleStartTour(tour.id)}
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                <span>{tour.title}</span>
              </DropdownMenuItem>
            ))}
          </>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleGoToHelpSettings}>
          <MessageCircle className="mr-2 h-4 w-4" />
          <span>All Tours & Settings</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
