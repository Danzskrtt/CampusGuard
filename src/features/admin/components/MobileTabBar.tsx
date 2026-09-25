import { ADMIN_NAV, ICON_COLORS, MOBILE_PHONE_TAB_KEYS } from '@/constants/admin';
import { useResponsive } from '@/hooks/useResponsive';
import type { NavigationBadges } from '@/hooks/useNavigationBadges';
import { Feather } from '@expo/vector-icons';
import { useRouter, useSegments, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MobileTabBar({ badges = {} }: { badges?: NavigationBadges }) {
  const router = useRouter();
  const active = useSegments()[1] ?? null;
  const insets = useSafeAreaInsets();
  const { isTablet } = useResponsive();
  const tabs = ADMIN_NAV.filter((item) => isTablet ? item.primary : MOBILE_PHONE_TAB_KEYS.includes(item.key as typeof MOBILE_PHONE_TAB_KEYS[number]));
  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom }] }>
      <View style={styles.tabs}>
        {tabs.map((i) => {
          const on = i.segment === active;
          return (
              <Pressable key={i.key} accessibilityRole="tab" accessibilityState={{ selected: on }} style={styles.tab}
              onPress={() => router.push((i.segment ? `/(admin)/${i.segment}` : '/(admin)') as Href)}>
              <View style={[styles.iconWrap, on && styles.iconWrapActive]}>
                <Feather name={i.icon} size={18} color={on ? ICON_COLORS.active : ICON_COLORS.idle} />
                {badges[i.key] ? <View style={styles.dot} /> : null}
              </View>
              <Text numberOfLines={1} style={[styles.label, on ? styles.labelActive : styles.labelIdle]}>{i.short ?? i.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E2E8F0',
    borderTopWidth: StyleSheet.hairlineWidth,
    boxShadow: '0px -3px 10px rgba(15, 23, 42, 0.06)',
  },
  tabs: { alignItems: 'stretch', flexDirection: 'row', paddingTop: 8, width: '100%' },
  tab: { alignItems: 'center', flex: 1, minWidth: 0, paddingHorizontal: 2 },
  iconWrap: { alignItems: 'center', backgroundColor: 'transparent', borderRadius: 999, height: 32, justifyContent: 'center', width: 44 },
  iconWrapActive: { backgroundColor: '#E8F3F7' },
  dot: { backgroundColor: '#B42318', borderColor: '#FFFFFF', borderRadius: 5, borderWidth: 1.5, height: 9, position: 'absolute', right: 7, top: 1, width: 9 },
  label: { fontSize: 10, marginTop: 4, maxWidth: '100%' },
  labelActive: { color: '#1B2A4A', fontWeight: '800' },
  labelIdle: { color: '#64748B', fontWeight: '600' },
});
