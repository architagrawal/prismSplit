/**
 * PrismSplit Settle Screen
 * 
 * Standalone version with back button navigation.
 */

import { useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/ui';
import { SettleContent } from '@/components/settle/SettleContent';

export default function SettleScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();

  return (
    <Screen>
      <SettleContent userId={userId || ''} showBackButton={true} />
    </Screen>
  );
}
