import { supabase } from '@/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type UserRole = 'student' | 'guard' | 'admin';

export default function LoginScreen() {
  const palette = {
    background: '#EFF3F6',
    text: '#1B2A4A',
    mutedText: '#475569',
    secondaryText: '#64748B',
    border: '#E2E8F0',
    inputBackground: '#F8FAFC',
    button: '#1E2B45',
    buttonText: '#FFFFFF',
  };

  // State for Email/Password Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const routeFromSession = async (session: { user: { id: string } }) => {
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
  };

  const handleEmailSignIn = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      Alert.alert('Missing fields', 'Please enter both your email and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: password,
      });

      if (signInError) {
        throw signInError;
      }

      const session = data?.session;
      if (!session) {
        throw new Error('Sign in succeeded but no session was returned.');
      }

      await routeFromSession(session);
    } catch (signInFailure) {
      const message =
        signInFailure && typeof signInFailure === 'object' && 'message' in signInFailure
          ? String((signInFailure as { message?: string }).message)
          : 'Invalid email or password.';

      setError(message);
      Alert.alert('Login failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topHeaderRow}>
        <TouchableOpacity
          onPress={() => router.replace('/welcome' as never)}
          style={styles.backButton}
          accessibilityLabel="Back to welcome screen"
        >
          <Ionicons name="arrow-back" size={22} color={palette.text} />
        </TouchableOpacity>

        <View style={styles.brandHeaderWrap}>
          <Image source={require('@/assets/images/slrc-logo.png')} style={styles.brandLogoHeader} contentFit="contain" />
          <Text style={[styles.brandTextHeader, { color: palette.text }]}>CampusGuard</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.keyboardContainer, { backgroundColor: palette.background }]}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, { color: palette.text }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: palette.mutedText }]}>Sign in to continue to your campus dashboard.</Text>

          {/* Email Input */}
          <Text style={[styles.label, { color: palette.mutedText }]}>Email</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: palette.inputBackground,
                borderColor: palette.border,
                color: palette.text,
              },
            ]}
            placeholder="Enter your email"
            placeholderTextColor={palette.secondaryText}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!loading}
          />

          {/* Password Input */}
          <Text style={[styles.label, { color: palette.mutedText }]}>Password</Text>
          <View
            style={[
              styles.passwordContainer,
              {
                backgroundColor: palette.inputBackground,
                borderColor: palette.border,
              },
            ]}
          >
            <TextInput
              style={[styles.passwordInput, { color: palette.text }]}
              placeholder="Enter your password"
              placeholderTextColor={palette.secondaryText}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIconContainer}
              accessibilityLabel={showPassword ? "Hide password" : "Show password"}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={22}
                color={palette.secondaryText}
              />
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Email/Password Sign In Button */}
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: palette.button }]}
            onPress={handleEmailSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={palette.buttonText} />
            ) : (
              <Text style={[styles.primaryButtonText, { color: palette.buttonText }]}>Login</Text>
            )}
          </TouchableOpacity>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  topHeaderRow: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandHeaderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    alignSelf: 'center',
  },
  brandLogoHeader: {
    width: 26,
    height: 26,
  },
  brandTextHeader: {
    fontSize: 22,
    fontWeight: '700',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  eyeIconContainer: {
    padding: 14,
  },
  primaryButton: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: '#F87171',
    fontSize: 14,
    marginBottom: 12,
  },
  forgotPasswordContainer: {
    alignSelf: 'center',
    marginTop: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  forgotPasswordText: {
    fontSize: 15,
    fontWeight: '600',
  },
});