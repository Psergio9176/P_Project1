import { pushService, PushSubscriptionData } from './api';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

export const NotificationService = {
  async isSupported(): Promise<boolean> {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  },

  async getPermissionStatus(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  },

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.requestPermission();
  },

  async subscribe(): Promise<PushSubscriptionData | null> {
    try {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.log('Permission for notifications denied');
        return null;
      }

      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as unknown as BufferSource,
      });

      const pushData: PushSubscriptionData = subscription.toJSON() as PushSubscriptionData;
      
      await pushService.subscribe(pushData);
      
      return pushData;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  },

  async unsubscribe(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        await pushService.unsubscribe(subscription.endpoint);
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
    }
  },

  async isSubscribed(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      return !!subscription;
    } catch {
      return false;
    }
  },

  urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  },
};
