import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  AppSettings, 
  Currency, 
  AVAILABLE_CURRENCIES, 
  PricingPlan, 
  PricingTier, 
  PricingMatrix,
  DEFAULT_PLANS,
  DEFAULT_TIERS,
  DEFAULT_PRICING_MATRIX
} from '@/types';

interface SettingsContextType {
  settings: AppSettings;
  setCurrency: (currency: Currency) => void;
  formatCurrency: (cents: number) => string;
  completeOnboarding: () => void;
  
  // Plans
  plans: PricingPlan[];
  addPlan: (plan: Omit<PricingPlan, 'id' | 'order'>) => PricingPlan;
  updatePlan: (id: string, updates: Partial<Omit<PricingPlan, 'id'>>) => void;
  deletePlan: (id: string) => void;
  
  // Tiers
  tiers: PricingTier[];
  addTier: (tier: Omit<PricingTier, 'id' | 'order'>) => PricingTier;
  updateTier: (id: string, updates: Partial<Omit<PricingTier, 'id'>>) => void;
  deleteTier: (id: string) => void;
  
  // Pricing Matrix
  pricingMatrix: PricingMatrix[];
  setPrice: (planId: string, tierId: string, mrrCents: number) => void;
  getPrice: (planId: string, tierId: string) => number;
  
  // Helpers
  getPlanById: (id: string) => PricingPlan | undefined;
  getTierById: (id: string) => PricingTier | undefined;
  calculateMrr: (planId: string, tierId: string) => number;
}

const defaultSettings: AppSettings = {
  currency: AVAILABLE_CURRENCIES[0], // EUR as default
  onboardingCompleted: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const stored = localStorage.getItem('app-settings');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  const [plans, setPlans] = useState<PricingPlan[]>(() => {
    const stored = localStorage.getItem('pricing-plans');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEFAULT_PLANS;
      }
    }
    return DEFAULT_PLANS;
  });

  const [tiers, setTiers] = useState<PricingTier[]>(() => {
    const stored = localStorage.getItem('pricing-tiers');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEFAULT_TIERS;
      }
    }
    return DEFAULT_TIERS;
  });

  const [pricingMatrix, setPricingMatrix] = useState<PricingMatrix[]>(() => {
    const stored = localStorage.getItem('pricing-matrix');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEFAULT_PRICING_MATRIX;
      }
    }
    return DEFAULT_PRICING_MATRIX;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('app-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('pricing-plans', JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem('pricing-tiers', JSON.stringify(tiers));
  }, [tiers]);

  useEffect(() => {
    localStorage.setItem('pricing-matrix', JSON.stringify(pricingMatrix));
  }, [pricingMatrix]);

  const setCurrency = (currency: Currency) => {
    setSettings(prev => ({ ...prev, currency }));
  };

  const formatCurrency = (cents: number): string => {
    const amount = cents / 100;
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: settings.currency.code,
    }).format(amount);
  };

  const completeOnboarding = () => {
    setSettings(prev => ({ ...prev, onboardingCompleted: true }));
  };

  // Plan functions
  const addPlan = (plan: Omit<PricingPlan, 'id' | 'order'>): PricingPlan => {
    const newPlan: PricingPlan = {
      ...plan,
      id: crypto.randomUUID(),
      order: plans.length + 1,
    };
    setPlans(prev => [...prev, newPlan]);
    
    // Add default prices for all tiers
    tiers.forEach(tier => {
      setPricingMatrix(prev => [...prev, { planId: newPlan.id, tierId: tier.id, mrrCents: 0 }]);
    });
    
    return newPlan;
  };

  const updatePlan = (id: string, updates: Partial<Omit<PricingPlan, 'id'>>) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deletePlan = (id: string) => {
    setPlans(prev => prev.filter(p => p.id !== id));
    setPricingMatrix(prev => prev.filter(pm => pm.planId !== id));
  };

  // Tier functions
  const addTier = (tier: Omit<PricingTier, 'id' | 'order'>): PricingTier => {
    const newTier: PricingTier = {
      ...tier,
      id: crypto.randomUUID(),
      order: tiers.length + 1,
    };
    setTiers(prev => [...prev, newTier]);
    
    // Add default prices for all plans
    plans.forEach(plan => {
      setPricingMatrix(prev => [...prev, { planId: plan.id, tierId: newTier.id, mrrCents: 0 }]);
    });
    
    return newTier;
  };

  const updateTier = (id: string, updates: Partial<Omit<PricingTier, 'id'>>) => {
    setTiers(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTier = (id: string) => {
    setTiers(prev => prev.filter(t => t.id !== id));
    setPricingMatrix(prev => prev.filter(pm => pm.tierId !== id));
  };

  // Pricing Matrix functions
  const setPrice = (planId: string, tierId: string, mrrCents: number) => {
    setPricingMatrix(prev => {
      const existing = prev.find(pm => pm.planId === planId && pm.tierId === tierId);
      if (existing) {
        return prev.map(pm => 
          pm.planId === planId && pm.tierId === tierId 
            ? { ...pm, mrrCents } 
            : pm
        );
      }
      return [...prev, { planId, tierId, mrrCents }];
    });
  };

  const getPrice = (planId: string, tierId: string): number => {
    const entry = pricingMatrix.find(pm => pm.planId === planId && pm.tierId === tierId);
    return entry?.mrrCents ?? 0;
  };

  // Helper functions
  const getPlanById = (id: string) => plans.find(p => p.id === id);
  const getTierById = (id: string) => tiers.find(t => t.id === id);
  
  const calculateMrr = (planId: string, tierId: string): number => {
    return getPrice(planId, tierId);
  };

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      setCurrency, 
      formatCurrency, 
      completeOnboarding,
      plans,
      addPlan,
      updatePlan,
      deletePlan,
      tiers,
      addTier,
      updateTier,
      deleteTier,
      pricingMatrix,
      setPrice,
      getPrice,
      getPlanById,
      getTierById,
      calculateMrr,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}