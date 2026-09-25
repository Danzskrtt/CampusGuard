import AppButton from '@/features/student/components/AppButton';
import PassCard from '@/features/student/components/PassCard';
import { useRequests } from '@/features/student/context/RequestsContext';
import { colors } from '@/features/student/theme';
import { savePassToPhotos, sharePass } from '@/features/student/utils/pass';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Move these into your theme file when convenient.
const SCREEN_PADDING_X = 24; // same value as body, so buttons line up with the pass card
const FOOTER_GAP = 12;
const FOOTER_MAX_WIDTH = 520; // keeps the buttons tidy on iPad

type Props = {
  navigation: { navigate: (name: string, params?: any) => void; goBack: () => void };
  route?: { params?: { requestId: string } };
};

export default function QRPassScreen({ navigation, route }: Props) {
  const { requests } = useRequests();
  const request = requests.find((r) => r.id === route?.params?.requestId);
  const passRef = useRef<View>(null);
  const { width: windowWidth } = useWindowDimensions();

  useEffect(() => {
    if (!request) navigation.goBack();
  }, [request, navigation]);

  if (!request) return null;

  // Explicit, equal widths set on plain wrapper Views, so they don't depend on AppButton, flex or `gap`.
  const footerWidth = Math.min(windowWidth, FOOTER_MAX_WIDTH);
  const buttonWidth = Math.floor((footerWidth - SCREEN_PADDING_X * 2 - FOOTER_GAP) / 2);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.closeBtn}>
          <Feather name="x" size={16} color={colors.white} />
        </Pressable>
        <Text style={styles.title}>Digital Entry Pass</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View ref={passRef} collapsable={false} style={styles.passWrap}>
          <PassCard request={request} />
        </View>
      </ScrollView>

      <View style={[styles.footer, { width: footerWidth }]}>
        <View style={{ width: buttonWidth }}>
          <AppButton
            title="Share Pass"
            variant="ghostDark"
            icon={(c) => <Feather name="share" size={20} color={c} />}
            onPress={() => sharePass(request, passRef)}
            style={styles.fill}
          />
        </View>
        <View style={{ width: buttonWidth, marginLeft: FOOTER_GAP }}>
          <AppButton
            title="Save to Photos"
            variant="light"
            icon={(c) => <Feather name="download" size={20} color={c} />}
            onPress={() => savePassToPhotos(passRef)}
            style={styles.fill}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.navy },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: { width: 28, height: 28 },
  title: { fontSize: 14, fontWeight: '600', color: colors.white },
  body: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SCREEN_PADDING_X,
    paddingVertical: 16,
  },
  passWrap: { width: '100%' },
  fill: { flex: 1 },
  footer: {
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    paddingHorizontal: SCREEN_PADDING_X,
    paddingVertical: 16,
  },
});
