import { supabase } from '@/supabase';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

type UserRole = 'student' | 'guard' | 'admin';

export default function AuthCallback() {
  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: sessionData, error } = await supabase.auth.getSession();

        if (error || !sessionData?.session?.user) {
          router.replace('/login' as never);
          return;
        }

        const session = sessionData.session;
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        const role = data?.role as UserRole | undefined;

        if (role === 'guard') {
          router.replace('/(guard)' as never);
          return;
        }

        if (role === 'admin') {
          router.replace('/(admin)' as never);
          return;
        }

        router.replace('/(student)' as never);
      } catch {
        router.replace('/login' as never);
      }
    };

    handleCallback();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FFFFFF" />
      <Text style={styles.text}>Completing sign in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E2B45',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  text: {
    marginTop: 16,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
