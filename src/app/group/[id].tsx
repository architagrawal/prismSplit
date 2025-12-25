/**
 * PrismSplit Group Detail Screen
 * 
 * Standalone version with back button navigation and tab bar overlay.
 */

import React from 'react';
import { View as RNView, ViewProps } from 'react-native';

// Fix for React 19 / RN 0.81 type mismatch where View is seen as missing 'props'
const View = RNView as unknown as React.ComponentType<ViewProps>;
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
