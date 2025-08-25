
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useNotifications() {
  const { toast } = useToast();

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const showNotification = (title: string, options?: NotificationOptions) => {
    // Show toast notification
    toast({
      title,
      description: options?.body,
    });

    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        ...options,
      });
    }
  };

  const scheduleReminder = (title: string, message: string, delay: number) => {
    setTimeout(() => {
      showNotification(title, { body: message });
    }, delay);
  };

  return {
    showNotification,
    scheduleReminder,
  };
}
