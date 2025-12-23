import { useSettings } from '@/contexts/SettingsContext';
import { Account } from '@/types';

export function usePlanDisplay() {
  const { getPlanById, getTierById } = useSettings();

  const getPlanName = (planId: string): string => {
    return getPlanById(planId)?.name || planId;
  };

  const getTierName = (tierId: string): string => {
    return getTierById(tierId)?.name || tierId;
  };

  const getAccountPlanDisplay = (account: Account): string => {
    const plan = getPlanById(account.planId);
    const tier = getTierById(account.tierId);
    if (plan && tier) {
      return `${plan.name} / ${tier.name}`;
    }
    return plan?.name || account.planId;
  };

  const isPremiumPlan = (planId: string): boolean => {
    const plan = getPlanById(planId);
    if (!plan) return false;
    // Consider premium if it's not the first plan by order
    return plan.order > 1;
  };

  return {
    getPlanName,
    getTierName,
    getAccountPlanDisplay,
    isPremiumPlan,
  };
}