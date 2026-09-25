import { supabase } from '@/supabase';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function notifyGuardScanResult(result: 'granted' | 'denied') {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: result === 'granted' ? 'QR pass valid' : 'QR pass invalid',
      body: result === 'granted' ? 'The visitor pass was verified.' : 'The visitor pass was rejected.',
      sound: 'default',
      data: { type: 'guard_scan', result },
    },
    trigger: null,
  });
}

export type PushWebhookPayload = {
  type: 'INSERT' | 'UPDATE';
  table: 'visitor_requests';
  schema: 'public';
  record: Record<string, unknown>;
  old_record: Record<string, unknown> | null;
};

export async function emitPushNotification(payload: PushWebhookPayload) {
  const { error } = await supabase.functions.invoke('send-push-notification', { body: payload });
  if (error) throw error;
}

async function savePushToken(token: string) {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return;

  const { error } = await supabase.from('device_push_tokens').upsert({
    user_id: authData.user.id,
    expo_push_token: token,
    platform: Platform.OS,
    last_seen_at: new Date().toISOString(),
  }, { onConflict: 'user_id,expo_push_token' });
  if (error) throw error;
}

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'web') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'CampusGuard notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
    });
  }

  const permissions = await Notifications.getPermissionsAsync();
  let granted = permissions.granted || permissions.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  if (!granted) {
    const requested = await Notifications.requestPermissionsAsync();
    granted = requested.granted || requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  }
  if (!granted) return null;

  const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID
    ?? Constants.expoConfig?.extra?.eas?.projectId
    ?? Constants.easConfig?.projectId;
  if (!projectId) {
    throw new Error('Missing EAS project ID. Set EXPO_PUBLIC_EAS_PROJECT_ID in .env or link the Expo project with EAS.');
  }

  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  await savePushToken(token);
  return token;
}

export { savePushToken };
