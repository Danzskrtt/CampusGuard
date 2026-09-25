import { GUARD_COPY, GUARD_THEME } from '@/constants/guard';
import { useCameraPermissions } from 'expo-camera';
import { useEffect, useState } from 'react';
import { AppState, Linking } from 'react-native';

export function useCameraGate() {
  const [permission, requestPermission] = useCameraPermissions();
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', setAppState);
    return () => subscription.remove();
  }, []);

  const refresh = async () => {
    if (appState === 'active') await requestPermission();
  };

  const openSettings = () => void Linking.openSettings();
  const status = !permission ? 'loading' : permission.granted ? 'granted' : permission.canAskAgain ? 'undetermined' : 'denied';

  return {
    permission,
    status,
    requestPermission,
    refresh,
    openSettings,
    copy: GUARD_COPY,
    theme: GUARD_THEME,
  } as const;
}
