import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { tours, getTourById, createTourDriver, TourConfig } from '@/lib/help/tours';
import { trackTourAction } from '@/lib/analytics/events';
import { toast } from 'sonner';

interface TourProgress {
  tourId: string;
  completedAt: string;
}

interface HelpContextType {
  // Tour state
  activeTourId: string | null;
  completedTours: string[];
  
  // Tour actions
  startTour: (tourId: string) => void;
  skipTour: () => void;
  completeTour: () => void;
  isTourCompleted: (tourId: string) => boolean;
  resetTourProgress: () => Promise<void>;
  
  // Help center state
  isHelpOpen: boolean;
  openHelp: () => void;
  closeHelp: () => void;
  
  // All available tours
  availableTours: TourConfig[];
}

const HelpContext = createContext<HelpContextType | undefined>(undefined);

export const useHelp = () => {
  const context = useContext(HelpContext);
  if (!context) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
};

interface HelpProviderProps {
  children: React.ReactNode;
}

export const HelpProvider: React.FC<HelpProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  const [completedTours, setCompletedTours] = useState<string[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [currentDriver, setCurrentDriver] = useState<ReturnType<typeof createTourDriver> | null>(null);

  // Load completed tours from database
  useEffect(() => {
    if (user) {
      loadTourProgress();
    } else {
      setCompletedTours([]);
    }
  }, [user]);

  const loadTourProgress = async () => {
    if (!user) return;

    try {
      // Use local storage as fallback since we may not have the table yet
      const stored = localStorage.getItem(`tour_progress_${user.id}`);
      if (stored) {
        const progress: TourProgress[] = JSON.parse(stored);
        setCompletedTours(progress.map(p => p.tourId));
      }
    } catch (error) {
      console.error('Failed to load tour progress:', error);
    }
  };

  const saveTourProgress = async (tourId: string) => {
    if (!user) return;

    try {
      // Save to local storage
      const stored = localStorage.getItem(`tour_progress_${user.id}`);
      const progress: TourProgress[] = stored ? JSON.parse(stored) : [];
      
      if (!progress.some(p => p.tourId === tourId)) {
        progress.push({
          tourId,
          completedAt: new Date().toISOString(),
        });
        localStorage.setItem(`tour_progress_${user.id}`, JSON.stringify(progress));
      }
    } catch (error) {
      console.error('Failed to save tour progress:', error);
    }
  };

  const startTour = useCallback((tourId: string) => {
    const tourConfig = getTourById(tourId);
    if (!tourConfig) {
      console.error(`Tour not found: ${tourId}`);
      return;
    }

    // Clean up any existing tour
    if (currentDriver) {
      currentDriver.destroy();
    }

    setActiveTourId(tourId);
    trackTourAction('start', tourId);

    const driver = createTourDriver(
      tourConfig,
      () => {
        // On complete
        setActiveTourId(null);
        setCompletedTours(prev => [...prev, tourId]);
        saveTourProgress(tourId);
        trackTourAction('complete', tourId);
        toast.success('Tour completed!', {
          description: `You've finished the ${tourConfig.title} tour.`,
        });
      },
      () => {
        // On skip
        setActiveTourId(null);
        trackTourAction('skip', tourId);
      }
    );

    setCurrentDriver(driver);
    
    // Start the tour after a brief delay to ensure elements are rendered
    setTimeout(() => {
      driver.drive();
    }, 300);
  }, [currentDriver]);

  const skipTour = useCallback(() => {
    if (currentDriver) {
      currentDriver.destroy();
    }
    if (activeTourId) {
      trackTourAction('skip', activeTourId);
    }
    setActiveTourId(null);
    setCurrentDriver(null);
  }, [currentDriver, activeTourId]);

  const completeTour = useCallback(() => {
    if (currentDriver) {
      currentDriver.destroy();
    }
    if (activeTourId) {
      setCompletedTours(prev => [...prev, activeTourId]);
      saveTourProgress(activeTourId);
      trackTourAction('complete', activeTourId);
    }
    setActiveTourId(null);
    setCurrentDriver(null);
  }, [currentDriver, activeTourId]);

  const isTourCompleted = useCallback((tourId: string) => {
    return completedTours.includes(tourId);
  }, [completedTours]);

  const resetTourProgress = useCallback(async () => {
    if (!user) return;

    try {
      localStorage.removeItem(`tour_progress_${user.id}`);
      setCompletedTours([]);
      toast.success('Tour progress reset', {
        description: 'You can now retake all tours.',
      });
    } catch (error) {
      console.error('Failed to reset tour progress:', error);
      toast.error('Failed to reset tour progress');
    }
  }, [user]);

  const openHelp = useCallback(() => {
    setIsHelpOpen(true);
  }, []);

  const closeHelp = useCallback(() => {
    setIsHelpOpen(false);
  }, []);

  const value: HelpContextType = {
    activeTourId,
    completedTours,
    startTour,
    skipTour,
    completeTour,
    isTourCompleted,
    resetTourProgress,
    isHelpOpen,
    openHelp,
    closeHelp,
    availableTours: tours,
  };

  return (
    <HelpContext.Provider value={value}>
      {children}
    </HelpContext.Provider>
  );
};
