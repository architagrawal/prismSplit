/**
 * PrismSplit Notification Service
 * 
 * Handles push notification setup, permissions, and local notifications.
 */

import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Notification types based on PRD
export type NotificationType =
  | 'bill_shared'
  | 'item_selected'
  | 'bill_finalized'
  | 'settlement_complete'
  | 'added_to_group'
  | 'reminder';

interface NotificationData {
  type: NotificationType;
  groupId?: string;
  billId?: string;
  userId?: string;
  [key: string]: unknown;
}

/**
 * Register for push notifications and get the Expo push token.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Permission not granted for push notifications');
    return null;
  }

  // Get Expo push token
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    console.log('Push token:', token.data);
    return token.data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

/**
 * Schedule a local notification.
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: NotificationData,
  trigger?: Notifications.NotificationTriggerInput
): Promise<string> {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data as unknown as Record<string, unknown>,
      sound: 'default',
    },
    trigger: trigger || null, // null = immediate
  });
}

/**
 * Cancel a scheduled notification.
 */
export async function cancelNotification(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
}

/**
 * Cancel all notifications.
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Set the badge count.
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Notification templates for common events.
 */
export const notificationTemplates = {
  billShared: (billTitle: string, groupName: string) => ({
    title: 'New Bill Shared',
    body: `${billTitle} was shared in ${groupName}. Tap to select your items!`,
  }),

  itemsSelected: (userName: string, billTitle: string) => ({
    title: 'Items Selected',
    body: `${userName} selected their items on ${billTitle}`,
  }),

  allSelectionsComplete: (billTitle: string) => ({
    title: 'All Items Claimed!',
    body: `Everyone has selected their items on ${billTitle}. Ready to finalize.`,
  }),

  billFinalized: (billTitle: string, yourShare: number) => ({
    title: 'Bill Finalized',
    body: `${billTitle} is finalized. Your share: $${yourShare.toFixed(2)}`,
  }),

  settlementComplete: (userName: string, amount: number) => ({
    title: 'Payment Received',
    body: `${userName} paid you $${amount.toFixed(2)}!`,
  }),

  addedToGroup: (groupName: string, inviterName: string) => ({
    title: 'Welcome!',
    body: `${inviterName} added you to ${groupName}`,
  }),

  reminder: (userName: string, amount: number) => ({
    title: 'Payment Reminder',
    body: `${userName} is waiting for $${amount.toFixed(2)}`,
  }),

  unclaimedItems: (billTitle: string, itemCount: number) => ({
    title: 'Unclaimed Items',
    body: `${itemCount} items on ${billTitle} haven't been claimed yet`,
  }),
};

/**
 * Hook to manage notifications in a component.
 */
export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
    });

    // Listen for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Listen for notification responses (tap on notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as NotificationData;
      handleNotificationResponse(data);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return {
    expoPushToken,
    notification,
  };
}

/**
 * Handle notification tap - navigate to relevant screen.
 */
function handleNotificationResponse(data: NotificationData) {
  // This would typically use the router to navigate
  // For now, we log the action
  console.log('Notification tapped:', data);

  switch (data.type) {
    case 'bill_shared':
    case 'item_selected':
    case 'bill_finalized':
      // Navigate to bill detail
      if (data.billId) {
        console.log('Navigate to bill:', data.billId);
      }
      break;
    case 'added_to_group':
      // Navigate to group
      if (data.groupId) {
        console.log('Navigate to group:', data.groupId);
      }
      break;
    case 'settlement_complete':
    case 'reminder':
      // Navigate to settle screen
      if (data.userId) {
        console.log('Navigate to settle:', data.userId);
      }
      break;
    default:
      // Navigate to activity
      console.log('Navigate to activity');
  }
}

/**
 * Send a test notification (for development).
 */
export async function sendTestNotification(): Promise<void> {
  await scheduleLocalNotification(
    'Test Notification',
    'This is a test notification from PrismSplit!',
    { type: 'bill_shared' }
  );
}

export default {
  registerForPushNotificationsAsync,
  scheduleLocalNotification,
  cancelNotification,
  cancelAllNotifications,
  setBadgeCount,
  notificationTemplates,
  useNotifications,
  sendTestNotification,
};
