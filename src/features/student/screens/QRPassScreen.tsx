import React, { useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import AppButton from '@/features/student/components/AppButton';
import PassCard from '@/features/student/components/PassCard';
import { useRequests } from '@/features/student/context/RequestsContext';
import { colors } from '@/features/student/theme';
import { savePassToPhotos, sharePass } from '@/features/student/utils/pass';

type Props = {
  navigation: { navigate: (name: string, params?: any) => void; goBack: () => void };
  route?: { params?: { requestId: string } };
};

export default function QRPassScreen({ navigation, route }: Props) {
  const { requests } = useRequests();
  const request = requests.find((r) => r.id === route?.params?.requestId);
  const passRef = useRef<View>(null);

  useEffect(() => {
    if (!request) navigation.goBack();
  }, [request, navigation]);

  if (!request) return null;

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

      <View style={styles.footer}>
        <AppButton
          title="Share Pass"
          variant="ghostDark"
          icon={(c) => <Feather name="share" size={14} color={c} />}
          onPress={() => sharePass(request)}
          style={styles.footerButton}
        />
        <View style={styles.footerGap} />
        <AppButton
          title="Save to Photos"
          variant="light"
          icon={(c) => <Feather name="download" size={14} color={c} />}
          onPress={() => savePassToPhotos(passRef)}
          style={styles.footerButton}
        />
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
  body: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 16 },
  passWrap: { width: '100%' },
  footer: { width: '100%', flexDirection: 'row', alignItems: 'center', padding: 16 },
  footerButton: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 },
  footerGap: { width: 10 },
});
