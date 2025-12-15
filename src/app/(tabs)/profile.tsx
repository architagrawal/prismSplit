/**
 * PrismSplit Profile Tab
 * 
 * Tab version without back button navigation.
 */

import { Screen } from '@/components/ui';
import { ProfileContent } from '@/components/profile/ProfileContent';

export default function ProfileScreen() {
  return (
    <Screen scroll safeBottom={false}>
      <ProfileContent showBackButton={false} />
    </Screen>
  );
}
