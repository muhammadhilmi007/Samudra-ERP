/**
 * Push notification handling for Samudra Paket ERP Mobile
 * Manages notification registration, permissions, and handling
 */
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { NOTIFICATION_CHANNELS } from '../config/constants';
import errorHandler, { ErrorType } from './errorHandler';
import { secureStore } from './secureStorage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Define notification types
export enum NotificationType {
  PICKUP_ASSIGNMENT = 'pickup_assignment',
  PICKUP_UPDATE = 'pickup_update',
  DELIVERY_ASSIGNMENT = 'delivery_assignment',
  DELIVERY_UPDATE = 'delivery_update',
  SHIPMENT_UPDATE = 'shipment_update',
  SYSTEM_MESSAGE = 'system_message',
}

// Notification service class
class NotificationService {
  private pushToken: string | null = null;
  private isInitialized: boolean = false;

  /**
   * Initialize notification service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Create notification channels for Android
      if (Platform.OS === 'android') {
        await this.createNotificationChannels();
      }

      // Check for existing token
      const storedToken = await secureStore.get('push_token');
      if (storedToken) {
        this.pushToken = storedToken;
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
      errorHandler.logError({
        type: ErrorType.UNKNOWN,
        message: 'Failed to initialize notification service',
        originalError: error,
      });
    }
  }

  /**
   * Create notification channels for Android
   */
  private async createNotificationChannels(): Promise<void> {
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.ASSIGNMENTS, {
      name: 'Penugasan',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2563EB',
      sound: true,
    });

    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.PICKUPS, {
      name: 'Pickup',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10B981',
      sound: true,
    });

    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.DELIVERIES, {
      name: 'Pengiriman',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F59E0B',
      sound: true,
    });

    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.SYSTEM, {
      name: 'Sistem',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#64748B',
      sound: true,
    });
  }

  /**
   * Register for push notifications
   */
  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('Push notifications are not available on emulator');
      return null;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // If permission not granted, request it
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // If permission denied, return null
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token: permission not granted');
        return null;
      }

      // Get push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // Replace with your Expo project ID
      });

      this.pushToken = tokenData.data;
      
      // Store token securely
      await secureStore.save('push_token', this.pushToken);

      // Configure for Android
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2563EB',
        });
      }

      return this.pushToken;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      errorHandler.logError({
        type: ErrorType.UNKNOWN,
        message: 'Failed to register for push notifications',
        originalError: error,
      });
      return null;
    }
  }

  /**
   * Get push token
   */
  getPushToken(): string | null {
    return this.pushToken;
  }

  /**
   * Send push token to server
   */
  async sendPushTokenToServer(userId: string): Promise<boolean> {
    if (!this.pushToken) {
      await this.registerForPushNotifications();
      if (!this.pushToken) return false;
    }

    try {
      // Implementation to send token to server would go here
      // This is a placeholder for the actual API call
      console.log(`Sending push token to server for user ${userId}: ${this.pushToken}`);
      return true;
    } catch (error) {
      console.error('Error sending push token to server:', error);
      errorHandler.logError({
        type: ErrorType.API,
        message: 'Failed to send push token to server',
        originalError: error,
      });
      return false;
    }
  }

  /**
   * Schedule a local notification
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    data: any = {},
    channelId: string = 'default',
    seconds: number = 1
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          badge: 1,
          autoDismiss: true,
          ...(Platform.OS === 'android' && { channelId }),
        },
        trigger: { seconds },
      });
      return notificationId;
    } catch (error) {
      console.error('Error scheduling local notification:', error);
      errorHandler.logError({
        type: ErrorType.UNKNOWN,
        message: 'Failed to schedule local notification',
        originalError: error,
      });
      return '';
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  /**
   * Get notification badge count
   */
  async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }

  /**
   * Set notification badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }
}

export default new NotificationService();
