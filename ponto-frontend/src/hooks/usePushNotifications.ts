import { useState, useEffect, useCallback } from 'react';
import { NotificationService } from '../services/notificationService';

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  const checkStatus = useCallback(async () => {
    const supported = await NotificationService.isSupported();
    setIsSupported(supported);
    
    if (supported) {
      const perm = await NotificationService.getPermissionStatus();
      setPermission(perm);
      
      const subscribed = await NotificationService.isSubscribed();
      setIsSubscribed(subscribed);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const subscribe = useCallback(async () => {
    const subscription = await NotificationService.subscribe();
    setIsSubscribed(!!subscription);
    setPermission(Notification.permission);
    return !!subscription;
  }, []);

  const unsubscribe = useCallback(async () => {
    await NotificationService.unsubscribe();
    setIsSubscribed(false);
  }, []);

  return {
    permission,
    isSubscribed,
    isSupported,
    subscribe,
    unsubscribe,
    refresh: checkStatus,
  };
};
