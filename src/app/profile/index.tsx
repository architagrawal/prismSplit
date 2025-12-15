/**
 * PrismSplit Profile Screen
 * 
 * Standalone version with back button navigation.
 */

import { Screen } from '@/components/ui';
import { ProfileContent } from '@/components/profile/ProfileContent';

export default function ProfileScreen() {
  return (
    <Screen scroll>
      <ProfileContent showBackButton={true} />
    </Screen>
  );
}
