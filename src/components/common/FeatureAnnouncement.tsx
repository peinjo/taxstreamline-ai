import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FEATURE_CONFIGS, type FeatureKey } from '@/hooks/useFeatureUnlock';

interface FeatureAnnouncementProps {
  featureKey: FeatureKey;
  onDismiss: () => void;
}

export const FeatureAnnouncement: React.FC<FeatureAnnouncementProps> = ({
  featureKey,
  onDismiss,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const config = FEATURE_CONFIGS[featureKey];

  useEffect(() => {
    setIsOpen(true);
  }, [featureKey]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onDismiss, 300);
  };

  if (!config) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="rounded-full bg-primary/10 p-3 mb-2"
            >
              <Sparkles className="h-8 w-8 text-primary" />
            </motion.div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogTitle className="text-2xl">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              🎉 Feature Unlocked!
            </motion.span>
          </DialogTitle>
          <DialogDescription>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-base"
            >
              You've unlocked <strong>{config.name}</strong>
            </motion.span>
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4 py-4"
        >
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground mb-3">
              {config.description}
            </p>
            
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                What you can now do:
              </p>
              <ul className="space-y-2">
                {config.benefits.map((benefit, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    className="flex items-start gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="rounded-lg bg-primary/5 border border-primary/20 p-3"
          >
            <p className="text-xs text-muted-foreground">
              💡 <strong>Tip:</strong> Continue using the platform to unlock even more powerful features!
            </p>
          </motion.div>
        </motion.div>

        <DialogFooter>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex gap-2 w-full sm:w-auto"
          >
            <Button variant="outline" onClick={handleClose} className="flex-1 sm:flex-none">
              I'll Try Later
            </Button>
            <Button onClick={handleClose} className="flex-1 sm:flex-none">
              <Sparkles className="mr-2 h-4 w-4" />
              Explore Now
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Hook to manage feature announcements
export const useFeatureAnnouncement = () => {
  const [queuedFeatures, setQueuedFeatures] = useState<FeatureKey[]>([]);
  const [currentFeature, setCurrentFeature] = useState<FeatureKey | null>(null);

  useEffect(() => {
    const dismissedKey = 'feature-announcements-dismissed';
    const dismissed = JSON.parse(localStorage.getItem(dismissedKey) || '[]');
    
    const pendingFeatures = queuedFeatures.filter(
      feature => !dismissed.includes(feature)
    );

    if (pendingFeatures.length > 0 && !currentFeature) {
      setCurrentFeature(pendingFeatures[0]);
    }
  }, [queuedFeatures, currentFeature]);

  const announceFeature = (featureKey: FeatureKey) => {
    setQueuedFeatures(prev => [...prev, featureKey]);
  };

  const dismissAnnouncement = () => {
    if (currentFeature) {
      const dismissedKey = 'feature-announcements-dismissed';
      const dismissed = JSON.parse(localStorage.getItem(dismissedKey) || '[]');
      dismissed.push(currentFeature);
      localStorage.setItem(dismissedKey, JSON.stringify(dismissed));

      setQueuedFeatures(prev => prev.filter(f => f !== currentFeature));
      setCurrentFeature(null);
    }
  };

  return {
    currentFeature,
    announceFeature,
    dismissAnnouncement,
  };
};
