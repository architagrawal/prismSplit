/**
 * PrismSplit QR Scanner Screen
 * 
 * Camera-based QR code scanning for joining groups.
 */

import { useState, useEffect } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { Stack, Text, YStack, XStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { X, Flashlight, FlashlightOff, QrCode } from 'lucide-react-native';
import { Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { Screen, Button, Card } from '@/components/ui';
import { colors } from '@/theme/tokens';
import { useGroupsStore, useUIStore } from '@/lib/store';

export default function QRScannerScreen() {
  const router = useRouter();
  const { joinGroup, isLoading } = useGroupsStore();
  const { showToast } = useUIStore();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);

  const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (scanned) return;
    
    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Extract invite code from URL or use raw data as code
    let inviteCode = data;
    
    // Check if it's a PrismSplit URL
    if (data.includes('prismsplit.app/join/')) {
      const match = data.match(/join\/([A-Z0-9]+)/i);
      if (match) {
        inviteCode = match[1];
      }
    } else if (data.includes('prismsplit://')) {
      const match = data.match(/prismsplit:\/\/join\/([A-Z0-9]+)/i);
      if (match) {
        inviteCode = match[1];
      }
    }

    try {
      const group = await joinGroup(inviteCode.toUpperCase());
      showToast({ type: 'success', message: `Joined ${group.name}!` });
      router.replace(`/(tabs)/group/${group.id}` as any);
    } catch (error) {
      showToast({ type: 'error', message: 'Invalid QR code' });
      setScanned(false);
    }
  };

  const toggleTorch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTorch(!torch);
  };

  // Permission not determined yet
  if (!permission) {
    return (
      <Screen>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Text color={colors.light.textSecondary}>Requesting camera permission...</Text>
        </YStack>
      </Screen>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <Screen>
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$6">
          <Pressable onPress={() => router.back()}>
            <X size={24} color={colors.light.textPrimary} />
          </Pressable>
          <Text fontSize={18} fontWeight="600" color={colors.light.textPrimary}>
            Scan QR Code
          </Text>
          <Stack width={24} />
        </XStack>

        <YStack flex={1} justifyContent="center" alignItems="center" gap="$6" paddingHorizontal="$6">
          <Stack
            width={120}
            height={120}
            borderRadius={60}
            backgroundColor={colors.light.warningBg}
            justifyContent="center"
            alignItems="center"
          >
            <QrCode size={60} color={colors.light.warning} />
          </Stack>

          <YStack alignItems="center" gap="$2">
            <Text fontSize={20} fontWeight="600" color={colors.light.textPrimary} textAlign="center">
              Camera Permission Needed
            </Text>
            <Text fontSize={16} color={colors.light.textSecondary} textAlign="center">
              We need camera access to scan QR codes for joining groups.
            </Text>
          </YStack>

          <Button
            variant="primary"
            size="lg"
            onPress={requestPermission}
          >
            Grant Access
          </Button>

          <Pressable onPress={() => router.back()}>
            <Text fontSize={16} color={colors.light.textMuted}>
              Enter code manually instead
            </Text>
          </Pressable>
        </YStack>
      </Screen>
    );
  }

  // Camera view
  return (
    <Stack flex={1} backgroundColor="black">
      {/* Camera */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Overlay */}
      <Stack flex={1}>
        {/* Top bar - use safe area insets */}
        <XStack 
          justifyContent="space-between" 
          alignItems="center" 
          paddingTop={60}
          paddingHorizontal="$4"
        >
          <Pressable onPress={() => router.back()}>
            <Stack
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor="rgba(0,0,0,0.5)"
              justifyContent="center"
              alignItems="center"
            >
              <X size={24} color="white" />
            </Stack>
          </Pressable>
          
          <Text fontSize={18} fontWeight="600" color="white">
            Scan to Join
          </Text>

          <Pressable onPress={toggleTorch}>
            <Stack
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor={torch ? colors.light.primary : "rgba(0,0,0,0.5)"}
              justifyContent="center"
              alignItems="center"
            >
              {torch ? (
                <FlashlightOff size={20} color="white" />
              ) : (
                <Flashlight size={20} color="white" />
              )}
            </Stack>
          </Pressable>
        </XStack>

        {/* Scanner frame */}
        <Stack flex={1} justifyContent="center" alignItems="center">
          <Stack
            width={280}
            height={280}
            borderRadius={24}
            borderWidth={3}
            borderColor="rgba(255,255,255,0.8)"
            position="relative"
          >
            {/* Corner accents */}
            <Stack 
              position="absolute" 
              top={-2} 
              left={-2} 
              width={50} 
              height={50} 
              borderTopWidth={4}
              borderLeftWidth={4}
              borderColor={colors.light.primary}
              borderTopLeftRadius={24}
            />
            <Stack 
              position="absolute" 
              top={-2} 
              right={-2} 
              width={50} 
              height={50} 
              borderTopWidth={4}
              borderRightWidth={4}
              borderColor={colors.light.primary}
              borderTopRightRadius={24}
            />
            <Stack 
              position="absolute" 
              bottom={-2} 
              left={-2} 
              width={50} 
              height={50} 
              borderBottomWidth={4}
              borderLeftWidth={4}
              borderColor={colors.light.primary}
              borderBottomLeftRadius={24}
            />
            <Stack 
              position="absolute" 
              bottom={-2} 
              right={-2} 
              width={50} 
              height={50} 
              borderBottomWidth={4}
              borderRightWidth={4}
              borderColor={colors.light.primary}
              borderBottomRightRadius={24}
            />
          </Stack>

          <Text 
            fontSize={16} 
            color="white" 
            textAlign="center"
            marginTop="$4"
          >
            Point at a group QR code
          </Text>
        </Stack>

        {/* Bottom section */}
        <YStack paddingHorizontal="$4" paddingBottom="$8" gap="$3">
          {scanned && isLoading && (
            <Card variant="elevated">
              <XStack justifyContent="center" alignItems="center" gap="$2">
                <Text color={colors.light.textPrimary}>Joining group...</Text>
              </XStack>
            </Card>
          )}

          <Pressable onPress={() => router.push('/group/join' as any)}>
            <Text 
              fontSize={16} 
              color="white" 
              textAlign="center"
              textDecorationLine="underline"
            >
              Enter code manually
            </Text>
          </Pressable>
        </YStack>
      </Stack>
    </Stack>
  );
}
