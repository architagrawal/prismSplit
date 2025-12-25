/**
 * PrismSplit Group Detail Screen
 * 
 * Standalone version with back button navigation and tab bar overlay.
 */

import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/ui';
import { GroupDetailContent } from '@/components/group/GroupDetailContent';
import { TabBarOverlay } from '@/components/navigation/TabBarOverlay';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={{ flex: 1 }}>
      <Screen padded={false}>
        <GroupDetailContent groupId={id || ''} showBackButton={true} />
      </Screen>
      <TabBarOverlay activeTab="groups" />
    </View>
  );
}
