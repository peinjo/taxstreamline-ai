import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { tours, getTourById, createTourDriver, TourConfig } from '@/lib/help/tours';
import { trackTourAction } from '@/lib/analytics/events';
import { toast } from 'sonner';
import { logger } from '@/lib/logging/logger';

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
      const { data, error } = await supabase
        .from('user_help_progress')
        .select('tour_id')
        .eq('user_id', user.id);

      if (error) throw error;
      
      if (data) {
        setCompletedTours(data.map(p => p.tour_id));
      }
    } catch (error) {
      logger.error('Failed to load tour progress', error as Error);
    }
  };

  const saveTourProgress = async (tourId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_help_progress')
        .upsert({
          user_id: user.id,
          tour_id: tourId,
          completed_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,tour_id'
        });

      if (error) throw error;
    } catch (error) {
      logger.error('Failed to save tour progress', error as Error);
    }
  };

  const startTour = useCallback((tourId: string) => {
    const tourConfig = getTourById(tourId);
    if (!tourConfig) {
      logger.warn(`Tour not found: ${tourId}`);
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
      const { error } = await supabase
        .from('user_help_progress')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      
      setCompletedTours([]);
      toast.success('Tour progress reset', {
        description: 'You can now retake all tours.',
      });
    } catch (error) {
      logger.error('Failed to reset tour progress', error as Error);
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
