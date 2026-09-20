import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const backgroundColor = '#1E2B45';
  const textColor = '#F8FAFC';
  const buttonColor = '#FFFFFF';
  const buttonTextColor = '#1E2B45';

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor,
          paddingBottom: 40,
        },
      ]}
    >
      <StatusBar barStyle="light-content" />

      <View style={styles.content}>
        <Image
          source={require('@/assets/images/slrc-logo.png')}
          style={styles.logo}
          contentFit="contain"
        />

        <Text style={[styles.title, { color: textColor }]}>CampusGuard</Text>
      </View>

      <View style={styles.spacer} />

      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: buttonColor,
            marginBottom: 32,
          },
        ]}
        onPress={() => router.replace('/login')}
      >
        <Text style={[styles.buttonText, { color: buttonTextColor }]}>Continue with CampusGuard</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  content: {
    alignItems: 'center',
    paddingTop: 72,
    paddingHorizontal: 8,
  },
  spacer: {
    flex: 1,
  },
  logo: {
    width: 112,
    height: 112,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
});