/**
 * PrismSplit Privacy Policy Screen
 */

import { Stack, Text, YStack, XStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { ArrowLeft, Shield, Eye, Database, Lock, Users, Bell } from 'lucide-react-native';

import { Screen, Card } from '@/components/ui';
import { colors } from '@/theme/tokens';

interface PolicySectionProps {
  icon: React.ReactNode;
  title: string;
  content: string;
}

function PolicySection({ icon, title, content }: PolicySectionProps) {
  return (
    <Card variant="surface" marginBottom="$4">
      <YStack gap="$2">
        <XStack alignItems="center" gap="$2">
          <Stack
            width={32}
            height={32}
            borderRadius={8}
            backgroundColor={colors.light.primaryLight}
            justifyContent="center"
            alignItems="center"
          >
            {icon}
          </Stack>
          <Text fontSize={16} fontWeight="600" color={colors.light.textPrimary}>
            {title}
          </Text>
        </XStack>
        <Text fontSize={14} color={colors.light.textSecondary} lineHeight={22}>
          {content}
        </Text>
      </YStack>
    </Card>
  );
}

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <Screen scroll>
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$6">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.light.textPrimary} />
        </Pressable>
        <Text fontSize={18} fontWeight="600" color={colors.light.textPrimary}>
          Privacy Policy
        </Text>
        <Stack width={24} />
      </XStack>

      {/* Intro */}
      <Card variant="elevated" marginBottom="$6">
        <YStack alignItems="center" gap="$2">
          <Stack
            width={56}
            height={56}
            borderRadius={28}
            backgroundColor={colors.light.successBg}
            justifyContent="center"
            alignItems="center"
          >
            <Shield size={28} color={colors.light.success} />
          </Stack>
          <Text fontSize={16} fontWeight="600" color={colors.light.textPrimary}>
            Your Privacy Matters
          </Text>
          <Text fontSize={14} color={colors.light.textSecondary} textAlign="center">
            We're committed to protecting your personal information and being transparent about how we use it.
          </Text>
          <Text fontSize={12} color={colors.light.textMuted} marginTop="$2">
            Last updated: December 2024
          </Text>
        </YStack>
      </Card>

      {/* Policy Sections */}
      <PolicySection
        icon={<Database size={16} color={colors.light.primary} />}
        title="Information We Collect"
        content="We collect information you provide directly, including your name, email address, and profile photo. We also collect expense data you enter, group membership information, and basic usage analytics to improve the app experience."
      />

      <PolicySection
        icon={<Eye size={16} color={colors.light.primary} />}
        title="How We Use Your Information"
        content="Your information is used to provide and improve PrismSplit services, including calculating balances, facilitating group expense tracking, sending notifications about your expenses, and providing customer support when needed."
      />

      <PolicySection
        icon={<Users size={16} color={colors.light.primary} />}
        title="Information Sharing"
        content="We share your name and profile information with other members of your groups so they can identify you in shared expenses. We never sell your personal data to third parties or use it for advertising purposes."
      />

      <PolicySection
        icon={<Lock size={16} color={colors.light.primary} />}
        title="Data Security"
        content="We use industry-standard encryption to protect your data both in transit and at rest. Your financial information is securely stored and we regularly audit our security practices to ensure your data remains safe."
      />

      <PolicySection
        icon={<Bell size={16} color={colors.light.primary} />}
        title="Your Choices"
        content="You can update or delete your account information at any time from the Profile settings. You control notification preferences and can opt out of non-essential communications. You may request a copy of your data or ask us to delete it."
      />

      {/* Contact */}
      <Card variant="surface" marginBottom="$4">
        <YStack gap="$2">
          <Text fontSize={14} fontWeight="500" color={colors.light.textPrimary}>
            Questions About Privacy?
          </Text>
          <Text fontSize={13} color={colors.light.textSecondary}>
            If you have any questions about this privacy policy or our data practices, please contact us at privacy@prismsplit.app
          </Text>
        </YStack>
      </Card>

      {/* Footer */}
      <Text 
        fontSize={12} 
        color={colors.light.textMuted} 
        textAlign="center"
        marginBottom="$4"
      >
        By using PrismSplit, you agree to this privacy policy.
      </Text>
    </Screen>
  );
}
