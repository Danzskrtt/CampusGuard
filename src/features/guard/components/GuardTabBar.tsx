import { GUARD_TABS, GUARD_THEME } from '@/constants/guard';
import { Feather } from '@expo/vector-icons';
import type { NavigationBadges } from '@/hooks/useNavigationBadges';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function GuardTabBar({ state, descriptors, navigation, badges = {} }: any & { badges?: NavigationBadges }) {
  const insets = useSafeAreaInsets();
  const currentRoute = state.routes[state.index]?.name;
  const dark = currentRoute === 'scanner';

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabs}>
        {GUARD_TABS.map((tab, index) => {
          const route = state.routes[index];
          const focused = state.index === index;
          const label = descriptors[route.key]?.options?.tabBarLabel ?? tab.label;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={String(label)}
              onPress={() => navigation.navigate(route.name)}
              style={styles.tab}
            >
              <View style={[styles.iconWrap, focused && styles.iconWrapActive, dark && focused && styles.scannerWrapActive]}>
                <Feather name={tab.icon} size={18} color={focused ? (dark ? GUARD_THEME.amber : '#1B2A4A') : '#64748B'} />
                {badges[tab.key] ? <View style={styles.dot} /> : null}
              </View>
              <Text numberOfLines={1} style={[styles.label, focused ? styles.labelActive : styles.labelIdle]}>{String(label)}</Text>
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
  scannerWrapActive: { backgroundColor: 'rgba(245,164,0,0.16)' },
  dot: { backgroundColor: '#B42318', borderColor: '#FFFFFF', borderRadius: 5, borderWidth: 1.5, height: 9, position: 'absolute', right: 7, top: 1, width: 9 },
  label: { fontSize: 10, marginTop: 4, maxWidth: '100%' },
  labelActive: { color: '#1B2A4A', fontWeight: '800' },
  labelIdle: { color: '#64748B', fontWeight: '600' },
});
