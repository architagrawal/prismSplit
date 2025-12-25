/**
 * PrismSplit Home Dashboard (Smart Feed - Functional)
 * 
 * Focuses on delivering value: Context, Actions, and Insights.
 * Uses standard UI components for stability.
 */

import { useEffect, useState } from 'react';
import { Stack, Text, YStack, XStack, ScrollView, Sheet } from 'tamagui';
import { useRouter } from 'expo-router';
import { RefreshControl, Pressable, Modal, type RefreshControlProps, type ModalProps } from 'react-native';
import { 
  AlertCircle,
  CheckCircle,
  Zap,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Wallet,
  Plus,
  X
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { 
  Screen, 
  Card,
  Avatar, 
  Button,
  GroupImage
} from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuthStore, useGroupsStore, useActivityStore, useUIStore } from '@/lib/store';
import { useSmartFeed, SmartFeedItem } from '@/hooks/useSmartFeed';
import { SettleContent } from '@/components/settle/SettleContent';

// Fix for React 19 JSX element class type mismatch
const PlatformRefreshControl = RefreshControl as unknown as React.FC<RefreshControlProps>;
const PlatformModal = Modal as unknown as React.FC<ModalProps>;

export default function HomeScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const { user } = useAuthStore();
  const { groups, isLoading: groupsLoading, fetchGroups } = useGroupsStore();
  const { activities, isLoading: activitiesLoading, fetchActivities } = useActivityStore();
  const { showToast } = useUIStore();
  
  // Consuming the Smart Logic
  const { focusState, netBalance, feedItems, totalOwed, totalOwing } = useSmartFeed();

  // Interaction State
  const [settleModalVisible, setSettleModalVisible] = useState(false);
  const [selectedSettleUserId, setSelectedSettleUserId] = useState<string>('');

  useEffect(() => {
    fetchGroups();
    fetchActivities();
  }, []);

  const onRefresh = () => {
    fetchGroups();
    fetchActivities();
  };

  const handleAction = (item: SmartFeedItem) => {
     Haptics.selectionAsync();
     
     if (item.actionType === 'modal' && item.actionPayload) {
        setSelectedSettleUserId(item.actionPayload);
        setSettleModalVisible(true);
     } else if (item.actionType === 'navigate' && item.actionPayload) {
        router.push(item.actionPayload as any);
     } else if (item.actionType === 'toast' && item.actionPayload) {
        showToast({ type: 'success', message: item.actionPayload });
     }
  };

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  // --- UI COMPONENTS ---

  const FocusHeader = () => {
    let greeting = "Welcome back,";
    let statusColor = themeColors.textPrimary;
    
    if (focusState === 'debt') {
      greeting = "Attention needed,";
      statusColor = themeColors.error;
    } else if (focusState === 'lender') {
      greeting = "Doing great,";
      statusColor = themeColors.success;
    } else {
      greeting = "All settled,";
    }

    return (
      <Stack paddingHorizontal="$4" paddingTop="$2" paddingBottom="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <YStack>
            <Text fontSize={14} color={themeColors.textSecondary} fontWeight="500">
              {greeting}
            </Text>
            <Text fontSize={32} fontWeight="700" color={statusColor} letterSpacing={-0.5}>
              {firstName}
            </Text>
          </YStack>
          <Pressable onPress={() => router.push('/profile' as any)}>
            <Avatar 
              name={user?.full_name || 'User'}
              colorIndex={user?.color_index || 0}
              size="lg"
            />
          </Pressable>
        </XStack>
      </Stack>
    );
  };

  const FocusPrismCard = () => (
    <Card 
       padding="$4" 
       backgroundColor={themeColors.surface} 
       borderWidth={1} 
       borderColor={focusState === 'debt' ? themeColors.errorBg : themeColors.border}
       shadowColor={focusState === 'debt' ? themeColors.error : themeColors.primary}
       shadowOpacity={0.05}
    >
      <YStack alignItems="center" gap="$2">
        <Text fontSize={12} color={themeColors.textSecondary} textTransform="uppercase" letterSpacing={1}>
           {focusState === 'debt' ? 'TOTAL OUTSTANDING' : focusState === 'lender' ? 'TOTAL OWED TO YOU' : 'CURRENT BALANCE'}
        </Text>
        <Text 
           fontSize={42} 
           fontWeight="800" 
           color={focusState === 'debt' ? themeColors.error : focusState === 'lender' ? themeColors.success : themeColors.textPrimary}
        >
           ${Math.abs(netBalance).toFixed(2)}
        </Text>
        
        {netBalance !== 0 && (
           <Text fontSize={14} color={themeColors.textMuted}>
              {focusState === 'debt' ? `You owe across ${groups.length} groups` : `Pending from friends`}
           </Text>
        )}

        {/* Primary Action Button based on context */}
        <Stack marginTop="$3" width="100%">
           {focusState === 'debt' ? (
              <Button 
                variant="primary" 
                size="md" 
                fullWidth 
                icon={<Wallet size={16} color="white"/>}
                onPress={() => {
                   // Find the user we owe the most to for the main button
                   const topDebt = feedItems.find(i => i.type === 'urgent');
                   if (topDebt) handleAction(topDebt);
                }}
              >
                 Pay All Debt
              </Button>
           ) : focusState === 'lender' ? (
              <Button 
                variant="outlined" 
                size="md" 
                fullWidth
                onPress={() => showToast({ type: 'success', message: 'Reminders sent! 📨'})}
              >
                 Send Reminders
              </Button>
           ) : (
              <Button variant="secondary" size="md" fullWidth icon={<Sparkles size={16} color={themeColors.textPrimary}/>}>
                 Plan Activity
              </Button>
           )}
        </Stack>
      </YStack>
    </Card>
  );

  const TopCircle = () => (
    <YStack gap="$3" marginTop="$2">
       <Text fontSize={18} fontWeight="600" color={themeColors.textPrimary} paddingHorizontal="$4">
          Top Circle
       </Text>
       <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}>
          {/* Add New */}
          <Pressable onPress={() => router.push('/group/create' as any)}>
             <YStack alignItems="center" gap="$2" width={60}>
                <Stack width={56} height={56} borderRadius={28} backgroundColor={themeColors.surfaceElevated} justifyContent="center" alignItems="center" borderWidth={1} borderColor={themeColors.border} style={{borderStyle: 'dashed'}}>
                   <Plus size={24} color={themeColors.textMuted} />
                </Stack>
                <Text fontSize={12} color={themeColors.textSecondary} numberOfLines={1}>New</Text>
             </YStack>
          </Pressable>

          {/* Top Groups */}
          {groups.slice(0, 5).map(g => (
             <Pressable key={g.id} onPress={() => router.push(`/group/${g.id}` as any)}>
                <YStack alignItems="center" gap="$2" width={70}>
                   <Stack width={56} height={56} borderRadius={28} overflow="hidden" borderWidth={2} borderColor={themeColors.border}>
                      <GroupImage groupId={g.id} size="lg" />
                   </Stack>
                   <Text fontSize={12} fontWeight="600" color={themeColors.textPrimary} numberOfLines={1} textAlign="center">
                      {g.name}
                   </Text>
                </YStack>
             </Pressable>
          ))}
       </ScrollView>
    </YStack>
  );

  const SmartFeedCard = ({ item }: { item: SmartFeedItem }) => {
     const Icon = item.iconName === 'alert-circle' ? AlertCircle : item.iconName === 'check-circle' ? CheckCircle : item.iconName === 'zap' ? Zap : TrendingUp;
     
     return (
        <Card padding="$3" borderWidth={0} backgroundColor={themeColors.surface}>
           <XStack gap="$3" alignItems="center">
              <Stack 
                 width={40} height={40} borderRadius={12} 
                 backgroundColor={item.type === 'urgent' ? themeColors.errorBg : themeColors.surfaceElevated} 
                 justifyContent="center" alignItems="center"
              >
                 <Icon size={20} color={item.color} />
              </Stack>
              
              <YStack flex={1} gap="$1">
                 <Text fontSize={15} fontWeight="600" color={themeColors.textPrimary}>{item.title}</Text>
                 <Text fontSize={13} color={themeColors.textSecondary} numberOfLines={2}>{item.subtitle}</Text>
              </YStack>

              {item.actionLabel && (
                 <Button 
                    size="sm" 
                    variant={item.type === 'urgent' ? 'primary' : 'outlined'} 
                    onPress={() => handleAction(item)}
                 >
                    {item.actionLabel}
                 </Button>
              )}
           </XStack>
        </Card>
     );
  };

  return (
    <Screen scroll padded={false}>
      <ScrollView
        refreshControl={<PlatformRefreshControl refreshing={groupsLoading || activitiesLoading} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <FocusHeader />
        
        <Stack paddingHorizontal="$4" marginBottom="$6">
           <FocusPrismCard />
        </Stack>

        <TopCircle />

        <Stack paddingHorizontal="$4" marginTop="$6" marginBottom="$4">
           <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
              <Text fontSize={18} fontWeight="600" color={themeColors.textPrimary}>
                 Smart Updates
              </Text>
              {feedItems.some(i => i.type === 'urgent') && (
                 <Stack backgroundColor={themeColors.error} paddingHorizontal="$2" paddingVertical="$1" borderRadius={8}>
                    <Text fontSize={10} color="white" fontWeight="700">ACTION NEEDED</Text>
                 </Stack>
              )}
           </XStack>

           <YStack gap="$3">
              {feedItems.map(item => (
                 <SmartFeedCard key={item.id} item={item} />
              ))}
              {feedItems.length === 0 && (
                 <Text color={themeColors.textMuted} textAlign="center">You're all caught up!</Text>
              )}
           </YStack>
        </Stack>
      </ScrollView>

      {/* Settle Modal */}
      <PlatformModal
        visible={settleModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSettleModalVisible(false)}
      >
        <Stack flex={1} backgroundColor={themeColors.background} paddingTop="$4">
           <XStack justifyContent="flex-end" paddingHorizontal="$4" marginBottom="$2">
              <Pressable onPress={() => setSettleModalVisible(false)}>
                 <Stack backgroundColor={themeColors.surfaceElevated} padding="$2" borderRadius={20}>
                    <X size={24} color={themeColors.textPrimary} />
                 </Stack>
              </Pressable>
           </XStack>
           <SettleContent userId={selectedSettleUserId} showBackButton={false} />
        </Stack>
      </PlatformModal>
    </Screen>
  );
}
