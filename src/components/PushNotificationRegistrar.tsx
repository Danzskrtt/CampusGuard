import { registerForPushNotificationsAsync, savePushToken } from '@/lib/pushNotifications';
import { supabase } from '@/supabase';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';

export default function PushNotificationRegistrar() {
  useEffect(() => {
    const register = () => {
      void registerForPushNotificationsAsync().catch((error: unknown) => {
        console.warn('[Push notifications] Registration failed:', error instanceof Error ? error.message : error);
      });
    };
    register();

    const authSubscription = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setTimeout(register, 0);
      }
      if (event === 'SIGNED_OUT' && session === null) return;
    });
    const tokenSubscription = Notifications.addPushTokenListener((token) => {
      void savePushToken(token.data as string).catch(() => undefined);
    });
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const url = response.notification.request.content.data?.url;
      if (typeof url === 'string') router.push(url as never);
    });

    return () => {
      authSubscription.data.subscription.unsubscribe();
      tokenSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return null;
}
