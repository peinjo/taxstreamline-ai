import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type FeatureKey = 
  | 'basic'
  | 'transfer_pricing'
  | 'advanced_analytics'
  | 'bulk_operations'
  | 'ai_assistant_premium'
  | 'custom_reports'
  | 'integrations';

export interface FeatureConfig {
  key: FeatureKey;
  name: string;
  description: string;
  unlockCriteria: {
    type: 'count' | 'days' | 'combined';
    metrics: {
      tax_reports?: number;
      documents?: number;
      transactions?: number;
      days_active?: number;
      onboarding_completed?: boolean;
    };
  };
  benefits: string[];
}

export const FEATURE_CONFIGS: Record<FeatureKey, FeatureConfig> = {
  basic: {
    key: 'basic',
    name: 'Basic Features',
    description: 'Core tax and compliance tools',
    unlockCriteria: { type: 'count', metrics: {} },
    benefits: ['Tax calculators', 'Document storage', 'Calendar'],
  },
  transfer_pricing: {
    key: 'transfer_pricing',
    name: 'Transfer Pricing',
    description: 'Advanced transfer pricing documentation and analysis',
    unlockCriteria: { 
      type: 'count', 
      metrics: { tax_reports: 5 } 
    },
    benefits: ['TP Documentation', 'Benchmarking', 'Risk Assessment'],
  },
  advanced_analytics: {
    key: 'advanced_analytics',
    name: 'Advanced Analytics',
    description: 'Deep insights and custom reporting',
    unlockCriteria: { 
      type: 'count', 
      metrics: { transactions: 10 } 
    },
    benefits: ['Custom dashboards', 'Trend analysis', 'Forecasting'],
  },
  bulk_operations: {
    key: 'bulk_operations',
    name: 'Bulk Operations',
    description: 'Import/export large datasets',
    unlockCriteria: { 
      type: 'count', 
      metrics: { documents: 20 } 
    },
    benefits: ['CSV Import', 'Excel Export', 'Batch Processing'],
  },
  ai_assistant_premium: {
    key: 'ai_assistant_premium',
    name: 'AI Assistant Premium',
    description: 'Advanced AI-powered features',
    unlockCriteria: { 
      type: 'combined', 
      metrics: { onboarding_completed: true, days_active: 30 } 
    },
    benefits: ['Smart insights', 'Document generation', 'Predictive analytics'],
  },
  custom_reports: {
    key: 'custom_reports',
    name: 'Custom Reports',
    description: 'Build and schedule custom reports',
    unlockCriteria: { 
      type: 'count', 
      metrics: { tax_reports: 15 } 
    },
    benefits: ['Report builder', 'Scheduled delivery', 'Custom templates'],
  },
  integrations: {
    key: 'integrations',
    name: 'Integrations',
    description: 'Connect with external accounting systems',
    unlockCriteria: { 
      type: 'count', 
      metrics: { tax_reports: 25, documents: 50 } 
    },
    benefits: ['QuickBooks sync', 'Xero integration', 'API access'],
  },
};

interface FeatureUnlockState {
  unlockedFeatures: Partial<Record<FeatureKey, boolean>>;
  usageStats: Record<string, number>;
  loading: boolean;
}

export const useFeatureUnlock = () => {
  const { user } = useAuth();
  const [state, setState] = useState<FeatureUnlockState>({
    unlockedFeatures: { basic: true },
    usageStats: {},
    loading: true,
  });

  // Fetch current unlock status
  useEffect(() => {
    if (!user) return;

    const fetchUnlockStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('unlocked_features, feature_usage_stats')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        setState({
          unlockedFeatures: (data?.unlocked_features as Partial<Record<FeatureKey, boolean>>) || { basic: true },
          usageStats: (data?.feature_usage_stats as Record<string, number>) || {},
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching feature unlock status:', error);
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    fetchUnlockStatus();
  }, [user]);

  // Check if a feature is unlocked
  const isFeatureUnlocked = (featureKey: FeatureKey): boolean => {
    return state.unlockedFeatures[featureKey] || false;
  };

  // Get progress towards unlocking a feature
  const getUnlockProgress = (featureKey: FeatureKey): number => {
    const config = FEATURE_CONFIGS[featureKey];
    if (!config) return 0;

    const { metrics } = config.unlockCriteria;
    const stats = state.usageStats;

    if (config.unlockCriteria.type === 'count') {
      const metricKey = Object.keys(metrics)[0] as keyof typeof metrics;
      if (!metricKey) return 100;
      
      const required = metrics[metricKey] as number;
      const current = stats[metricKey] || 0;
      return Math.min(100, Math.round((current / required) * 100));
    }

    if (config.unlockCriteria.type === 'combined') {
      let totalProgress = 0;
      let metricsCount = 0;

      Object.entries(metrics).forEach(([key, value]) => {
        metricsCount++;
        if (key === 'onboarding_completed') {
          totalProgress += stats[key] ? 100 : 0;
        } else if (key === 'days_active') {
          const current = stats[key] || 0;
          totalProgress += Math.min(100, (current / (value as number)) * 100);
        }
      });

      return metricsCount > 0 ? Math.round(totalProgress / metricsCount) : 0;
    }

    return 0;
  };

  // Increment usage counter
  const incrementUsage = async (metric: string) => {
    if (!user) return;

    const newStats = {
      ...state.usageStats,
      [metric]: (state.usageStats[metric] || 0) + 1,
    };

    setState(prev => ({ ...prev, usageStats: newStats }));

    try {
      await supabase
        .from('user_profiles')
        .update({ feature_usage_stats: newStats })
        .eq('user_id', user.id);

      // Check if any features should be unlocked
      await checkAndUnlockFeatures(newStats);
    } catch (error) {
      console.error('Error incrementing usage:', error);
    }
  };

  // Check and unlock features based on current stats
  const checkAndUnlockFeatures = async (stats: Record<string, number | boolean>) => {
    if (!user) return;

    const newlyUnlocked: FeatureKey[] = [];

    Object.entries(FEATURE_CONFIGS).forEach(([key, config]) => {
      const featureKey = key as FeatureKey;
      if (state.unlockedFeatures[featureKey]) return;

      const shouldUnlock = checkUnlockCriteria(config, stats);
      if (shouldUnlock) {
        newlyUnlocked.push(featureKey);
      }
    });

    if (newlyUnlocked.length > 0) {
      const updatedUnlocked = { ...state.unlockedFeatures };
      newlyUnlocked.forEach(key => {
        updatedUnlocked[key] = true;
      });

      setState(prev => ({ ...prev, unlockedFeatures: updatedUnlocked }));

      await supabase
        .from('user_profiles')
        .update({ unlocked_features: updatedUnlocked })
        .eq('user_id', user.id);

      // Notify about unlocked features
      newlyUnlocked.forEach(key => {
        const config = FEATURE_CONFIGS[key];
        toast.success(`🎉 New Feature Unlocked: ${config.name}!`, {
          description: config.description,
        });
      });

      return newlyUnlocked;
    }

    return [];
  };

  // Check if criteria are met for unlocking
  const checkUnlockCriteria = (
    config: FeatureConfig,
    stats: Record<string, number | boolean>
  ): boolean => {
    const { type, metrics } = config.unlockCriteria;

    if (type === 'count') {
      return Object.entries(metrics).every(([key, required]) => {
        return (stats[key] as number || 0) >= (required as number);
      });
    }

    if (type === 'combined') {
      return Object.entries(metrics).every(([key, required]) => {
        if (key === 'onboarding_completed') {
          return Boolean(stats[key]);
        }
        return (stats[key] as number || 0) >= (required as number);
      });
    }

    return false;
  };

  return {
    isFeatureUnlocked,
    getUnlockProgress,
    incrementUsage,
    unlockedFeatures: state.unlockedFeatures,
    usageStats: state.usageStats,
    loading: state.loading,
  };
};
