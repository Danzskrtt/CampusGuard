import { ADMIN_NAV, ICON_COLORS } from '@/constants/admin';
import { Feather } from '@expo/vector-icons';
import { GlassView } from 'expo-glass-effect';
import { useRouter, useSegments, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MobileTabBar() {
  const router = useRouter();
  const active = useSegments()[1] ?? null;
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <GlassView style={styles.glass} glassEffectStyle="regular" tintColor="#FFFFFF" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {ADMIN_NAV.filter((i) => i.primary || i.segment === 'passes').map((i) => {
          const on = i.segment === active;
          return (
              <Pressable key={i.key} accessibilityRole="tab" accessibilityState={{ selected: on }} style={styles.tab}
              onPress={() => router.push((i.segment ? `/(admin)/${i.segment}` : '/(admin)') as Href)}>
              <View style={[styles.iconWrap, on && styles.iconWrapActive]}>
                <Feather name={i.icon} size={18} color={on ? ICON_COLORS.active : ICON_COLORS.idle} />
              </View>
              <Text numberOfLines={1} style={[styles.label, on ? styles.labelActive : styles.labelIdle]}>{i.short ?? i.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderTopColor: '#E2E8F0',
    borderTopWidth: StyleSheet.hairlineWidth,
    minHeight: 72,
    paddingHorizontal: 4,
    paddingTop: 7,
    boxShadow: '0px -3px 10px rgba(15, 23, 42, 0.06)',
  },
  glass: { ...StyleSheet.absoluteFill, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  tabs: { alignItems: 'flex-start', flexDirection: 'row', gap: 4, paddingHorizontal: 4 },
  tab: { alignItems: 'center', minWidth: 68, paddingHorizontal: 4 },
  iconWrap: { alignItems: 'center', borderRadius: 12, height: 34, justifyContent: 'center', width: 44 },
  iconWrapActive: { backgroundColor: '#E8F3F7' },
  label: { fontSize: 9, marginTop: 3, maxWidth: 58 },
  labelActive: { color: '#1B2A4A', fontWeight: '800' },
  labelIdle: { color: '#64748B', fontWeight: '600' },
});
