/**
 * PrismSplit Settle Screen (with Tab Bar)
 * 
 * Tab version without back button navigation.
 */

import { useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/ui';
import { SettleContent } from '@/components/settle/SettleContent';

export default function SettleScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();

  return (
    <Screen safeBottom={false} scroll keyboardAvoiding>
      <SettleContent userId={userId || ''} showBackButton={false} />
    </Screen>
  );
}
