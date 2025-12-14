/**
 * PrismSplit Help & FAQ Screen
 */

import { useState } from 'react';
import { Stack, Text, YStack, XStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { Pressable, Linking } from 'react-native';
import { 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp,
  HelpCircle,
  Users,
  CreditCard,
  Receipt,
  Settings,
  Mail
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Screen, Card, Button } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  const themeColors = useThemeColors();
  
  return (
    <Pressable onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onToggle();
    }}>
      <YStack paddingVertical="$3">
        <XStack justifyContent="space-between" alignItems="center">
          <Text 
            flex={1} 
            fontSize={15} 
            fontWeight="500" 
            color={themeColors.textPrimary}
            marginRight="$2"
          >
            {question}
          </Text>
          {isOpen ? (
            <ChevronUp size={20} color={themeColors.textMuted} />
          ) : (
            <ChevronDown size={20} color={themeColors.textMuted} />
          )}
        </XStack>
        {isOpen && (
          <Text 
            fontSize={14} 
            color={themeColors.textSecondary} 
            marginTop="$2"
            lineHeight={22}
          >
            {answer}
          </Text>
        )}
      </YStack>
    </Pressable>
  );
}

interface FAQSectionProps {
  icon: React.ReactNode;
  title: string;
  faqs: { question: string; answer: string }[];
  openIndex: number | null;
  onToggle: (index: number) => void;
}

function FAQSection({ icon, title, faqs, openIndex, onToggle }: FAQSectionProps) {
  const themeColors = useThemeColors();
  
  return (
    <YStack marginBottom="$6">
      <XStack alignItems="center" gap="$2" marginBottom="$2">
        {icon}
        <Text fontSize={14} fontWeight="600" color={themeColors.textMuted}>
          {title}
        </Text>
      </XStack>
      <Card variant="surface">
        {faqs.map((faq, index) => (
          <YStack key={index}>
            {index > 0 && <Stack height={1} backgroundColor={themeColors.border} />}
            <FAQItem
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => onToggle(index)}
            />
          </YStack>
        ))}
      </Card>
    </YStack>
  );
}

const FAQ_DATA = {
  general: [
    {
      question: "What is PrismSplit?",
      answer: "PrismSplit is an app for splitting bills and expenses with friends, roommates, or travel companions. It helps you track who owes what and makes settling up easy."
    },
    {
      question: "Is PrismSplit free to use?",
      answer: "Yes! PrismSplit is completely free to use. All core features including bill splitting, group management, and expense tracking are available at no cost."
    },
    {
      question: "How do I get started?",
      answer: "Simply create an account, then either create a new group or join an existing one using an invite code. Once in a group, you can start adding expenses!"
    }
  ],
  groups: [
    {
      question: "How do I create a group?",
      answer: "Tap the '+' button on the Groups tab, select 'Create Group', give it a name, choose an emoji, and set the currency. You can then invite friends using the invite code or QR code."
    },
    {
      question: "How do I join a group?",
      answer: "You can join a group by entering the 6-character invite code, scanning a QR code, or tapping an invite link shared by a group member."
    },
    {
      question: "Can I be in multiple groups?",
      answer: "Yes! You can be a member of unlimited groups. Each group has its own expenses and balances that are tracked separately."
    },
    {
      question: "How do I leave a group?",
      answer: "Go to the group settings (gear icon) and scroll to 'Danger Zone'. Tap 'Leave Group' to exit. Note: You should settle any outstanding balances before leaving."
    }
  ],
  expenses: [
    {
      question: "How do I add an expense?",
      answer: "Tap the '+' button in the center of the tab bar. Choose 'Quick Bill' for simple expenses or 'Detailed Bill' for itemized expenses with the Speed Parser feature."
    },
    {
      question: "What is the Speed Parser?",
      answer: "Speed Parser lets you quickly add multiple items by typing them in a special format: 'Item Name $Price'. For example: 'Pizza $15' or 'Drinks $12.50'."
    },
    {
      question: "How do I split an expense?",
      answer: "After adding items to a bill, each member can tap on the items they consumed. The cost is automatically split among those who selected each item."
    },
    {
      question: "Can I edit or delete an expense?",
      answer: "Yes! Tap on any expense to view its details. If you're the creator, you can edit the items or delete the entire expense."
    }
  ],
  settling: [
    {
      question: "How do I settle up with someone?",
      answer: "Go to the Friends tab and tap on the person you want to settle with. You'll see the total balance and can record a payment by tapping 'Pay' or 'Request'."
    },
    {
      question: "Does PrismSplit handle actual payments?",
      answer: "PrismSplit tracks who owes what but doesn't process actual payments. You can settle using Venmo, PayPal, cash, or any method you prefer, then record it in the app."
    },
    {
      question: "What does 'You owe' vs 'You're owed' mean?",
      answer: "'You owe' means you need to pay that person. 'You're owed' means they owe you money. The balance shows the net amount after all expenses are calculated."
    }
  ]
};

export default function HelpScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const [openSections, setOpenSections] = useState<{[key: string]: number | null}>({
    general: null,
    groups: null,
    expenses: null,
    settling: null
  });

  const handleToggle = (section: string, index: number) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: prev[section] === index ? null : index
    }));
  };

  const handleContactSupport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL('mailto:support@prismsplit.app?subject=Help%20Request');
  };

  return (
    <Screen scroll>
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$6">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color={themeColors.textPrimary} />
        </Pressable>
        <Text fontSize={18} fontWeight="600" color={themeColors.textPrimary}>
          Help & FAQ
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
            backgroundColor={themeColors.primaryLight}
            justifyContent="center"
            alignItems="center"
          >
            <HelpCircle size={28} color={themeColors.primary} />
          </Stack>
          <Text fontSize={16} fontWeight="600" color={themeColors.textPrimary}>
            How can we help?
          </Text>
          <Text fontSize={14} color={themeColors.textSecondary} textAlign="center">
            Find answers to common questions below, or contact our support team.
          </Text>
        </YStack>
      </Card>

      {/* FAQ Sections */}
      <FAQSection
        icon={<HelpCircle size={16} color={themeColors.textMuted} />}
        title="GENERAL"
        faqs={FAQ_DATA.general}
        openIndex={openSections.general}
        onToggle={(index) => handleToggle('general', index)}
      />

      <FAQSection
        icon={<Users size={16} color={themeColors.textMuted} />}
        title="GROUPS"
        faqs={FAQ_DATA.groups}
        openIndex={openSections.groups}
        onToggle={(index) => handleToggle('groups', index)}
      />

      <FAQSection
        icon={<Receipt size={16} color={themeColors.textMuted} />}
        title="EXPENSES & BILLS"
        faqs={FAQ_DATA.expenses}
        openIndex={openSections.expenses}
        onToggle={(index) => handleToggle('expenses', index)}
      />

      <FAQSection
        icon={<CreditCard size={16} color={themeColors.textMuted} />}
        title="SETTLING UP"
        faqs={FAQ_DATA.settling}
        openIndex={openSections.settling}
        onToggle={(index) => handleToggle('settling', index)}
      />

      {/* Contact Support */}
      <Card variant="surface" marginBottom="$4">
        <YStack alignItems="center" gap="$3">
          <Text fontSize={14} color={themeColors.textSecondary} textAlign="center">
            Still need help? Our support team is here for you.
          </Text>
          <Button
            variant="outlined"
            size="md"
            icon={<Mail size={18} color={themeColors.primary} />}
            onPress={handleContactSupport}
          >
            Contact Support
          </Button>
        </YStack>
      </Card>
    </Screen>
  );
}
