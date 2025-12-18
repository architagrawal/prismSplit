import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';
import { demoBalances } from '@/lib/api/demo'; // Using demo data for logic simulation
import { useActivityStore } from '@/lib/store';

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

  // 1. Calculate Focus State
  const { focusState, netBalance, totalOwed, totalOwing } = useMemo(() => {
    const owed = demoBalances.filter(b => b.balance > 0).reduce((sum, b) => sum + b.balance, 0);
    const owing = demoBalances.filter(b => b.balance < 0).reduce((sum, b) => sum + Math.abs(b.balance), 0);
    
    let state: FocusState = 'zen';
    if (owing > owed * 1.1 && owing > 20) state = 'debt';
    else if (owed > owing * 1.1 && owed > 20) state = 'lender';

    return { 
      focusState: state, 
      netBalance: owed - owing,
      totalOwed: owed,
      totalOwing: owing 
    };
  }, []);

  // 2. Generate Smart Feed Items
  const feedItems = useMemo(() => {
    const items: SmartFeedItem[] = [];

    // Rule A: Urgent Debt (High Priority)
    const significantDebts = demoBalances.filter(b => b.balance < -10).sort((a, b) => a.balance - b.balance);
    if (significantDebts.length > 0) {
      const topDebt = significantDebts[0];
      items.push({
        id: `debt-${topDebt.user_id}`,
        type: 'urgent',
        title: `Settle up with ${topDebt.user.full_name}`,
        subtitle: `You owe $${Math.abs(topDebt.balance).toFixed(2)}. Clear this to get back to Zen.`,
        actionLabel: 'Pay Now',
        actionType: 'modal',
        actionPayload: topDebt.user_id,
        iconName: 'alert-circle',
        color: themeColors.error
      });
    }

    // Rule B: Pending Bill Review (Action)
    if (activities.length > 0) {
       // Find a bill creation activity if possible, otherwise mock one efficiently
       const billActivity = activities.find(a => a.type === 'bill_created');
       items.push({
         id: 'review-bill-mock',
         type: 'action',
         title: billActivity ? `Review "${billActivity.group.name}"` : 'Review "Sunday Brunch"',
         subtitle: billActivity ? `${billActivity.user.full_name} added a bill.` : 'Sarah added a new bill. Please confirm your share.',
         actionLabel: 'Review',
         actionType: 'navigate',
         actionPayload: '/bill/bill-1', // Linking to demo bill 1 for now
         iconName: 'check-circle',
         color: themeColors.primary
       });
    }

    // Rule C: Insights (Positive Reinforcement)
    if (focusState === 'lender') {
      items.push({
        id: 'insight-lender',
        type: 'insight',
        title: 'You are the Bank 🏦',
        subtitle: `You're carrying ${totalOwed > 0 ? ((totalOwed / (totalOwed + 10)) * 100).toFixed(0) : 0}% of the group interaction.`,
        actionLabel: 'Remind All',
        actionType: 'toast',
        actionPayload: 'Friendly reminders sent! 📨',
        iconName: 'zap',
        color: themeColors.secondary
      });
    } else if (focusState === 'zen') {
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
  }, [focusState, totalOwed, activities, themeColors]);

  return {
    focusState,
    netBalance,
    feedItems,
    totalOwed,
    totalOwing
  };
}
