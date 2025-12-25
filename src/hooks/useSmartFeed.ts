import { useMemo, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useActivityStore, useBalancesStore } from '@/lib/store';

export type FocusState = 'debt' | 'lender' | 'zen';

export interface SmartFeedItem {
  id: string;
  type: 'urgent' | 'action' | 'insight';
  title: string;
  subtitle: string;
  actionLabel?: string;
  actionType?: 'navigate' | 'modal' | 'toast';
  actionPayload?: string; // URL for navigate, userId for modal, message for toast
  iconName: 'alert-circle' | 'check-circle' | 'zap' | 'trending-up';
  color: string;
}

export function useSmartFeed() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const { activities } = useActivityStore();
  const { friendBalances, netBalance: storeNetBalance, fetchAllBalances, isLoading } = useBalancesStore();

  // Fetch balances on mount
  useEffect(() => {
    fetchAllBalances();
  }, []);

  // Convert friendBalances to array for calculations
  const balancesArray = useMemo(() => {
    return Object.values(friendBalances);
  }, [friendBalances]);

  // 1. Calculate Focus State
  const { focusState, netBalance, totalOwed, totalOwing } = useMemo(() => {
    // Positive balance = they owe you (you're owed)
    // Negative balance = you owe them (you're owing)
    const owed = balancesArray.filter(b => b.balance > 0).reduce((sum, b) => sum + b.balance, 0);
    const owing = balancesArray.filter(b => b.balance < 0).reduce((sum, b) => sum + Math.abs(b.balance), 0);
    
    let state: FocusState = 'zen';
    if (owing > owed * 1.1 && owing > 20) state = 'debt';
    else if (owed > owing * 1.1 && owed > 20) state = 'lender';

    return { 
      focusState: state, 
      netBalance: owed - owing,
      totalOwed: owed,
      totalOwing: owing 
    };
  }, [balancesArray]);

  // 2. Generate Smart Feed Items
  const feedItems = useMemo(() => {
    const items: SmartFeedItem[] = [];

    // Rule A: Urgent Debt (High Priority)
    const significantDebts = balancesArray.filter(b => b.balance < -10).sort((a, b) => a.balance - b.balance);
    if (significantDebts.length > 0) {
      const topDebt = significantDebts[0];
      items.push({
        id: `debt-${topDebt.userId}`,
        type: 'urgent',
        title: `Settle up with ${topDebt.name}`,
        subtitle: `You owe $${Math.abs(topDebt.balance).toFixed(2)}. Clear this to get back to Zen.`,
        actionLabel: 'Pay Now',
        actionType: 'modal',
        actionPayload: topDebt.userId,
        iconName: 'alert-circle',
        color: themeColors.error
      });
    }

    // Rule B: Pending Bill Review (Action)
    if (activities.length > 0) {
       // Find a bill creation activity if possible
       const billActivity = activities.find(a => a.type === 'bill_created');
       if (billActivity) {
         items.push({
           id: `review-bill-${billActivity.entity_id}`,
           type: 'action',
           title: `Review "${billActivity.group.name}"`,
           subtitle: `${billActivity.user.full_name} added a bill.`,
           actionLabel: 'Review',
           actionType: 'navigate',
           actionPayload: `/bill/${billActivity.entity_id}`,
           iconName: 'check-circle',
           color: themeColors.primary
         });
       }
    }

    // Rule C: Insights (Positive Reinforcement)
    if (focusState === 'lender') {
      items.push({
        id: 'insight-lender',
        type: 'insight',
        title: 'You are the Bank 🏦',
        subtitle: `You're owed $${totalOwed.toFixed(2)} across all groups.`,
        actionLabel: 'Remind All',
        actionType: 'toast',
        actionPayload: 'Friendly reminders sent! 📨',
        iconName: 'zap',
        color: themeColors.secondary
      });
    } else if (focusState === 'zen' && balancesArray.length === 0) {
      items.push({
        id: 'insight-zen',
        type: 'insight',
        title: 'Total Harmony',
        subtitle: 'All bills are settled. Perfect time to plan the next adventure.',
        iconName: 'trending-up',
        color: themeColors.success
      });
    }

    return items;
  }, [focusState, totalOwed, activities, themeColors, balancesArray]);

  return {
    focusState,
    netBalance,
    feedItems,
    totalOwed,
    totalOwing,
    isLoading
  };
}
