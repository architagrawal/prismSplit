import { useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/ui';
import { GroupDetailContent } from '@/components/group/GroupDetailContent';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen padded={false}>
      <GroupDetailContent groupId={id || ''} showBackButton={true} />
    </Screen>
  );
}
