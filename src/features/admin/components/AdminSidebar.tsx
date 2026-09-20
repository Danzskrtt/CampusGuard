import { ADMIN_LABEL, ADMIN_NAV, ICON_COLORS } from '@/constants/admin';
import { supabase } from '@/supabase';
import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter, useSegments, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

type Props = { name?: string | null; badges?: Record<string, number> };

export default function AdminSidebar({ name, badges = {} }: Props) {
  const router = useRouter();
  const active = useSegments()[1] ?? null;

  const go = (segment: string | null) => {
    router.push((segment ? `/(admin)/${segment}` : '/(admin)') as Href);
  };
  const signOut = async () => { await supabase.auth.signOut(); router.replace('/login' as Href); };

  return (
    <View className="flex-1 px-3 py-6" style={{ backgroundColor: '#1B2A4A' }}>
      <View className="px-3 pb-6">
        <Text className="text-lg font-extrabold text-white">{Constants.expoConfig?.name}</Text>
        <Text className="text-xs text-sky">{ADMIN_LABEL}</Text>
      </View>
      <View className="flex-1 gap-1">
        {ADMIN_NAV.map((item) => {
          const on = item.segment === active;
          const badge = badges[item.key];
          return (
            <Pressable key={item.key} onPress={() => go(item.segment)} accessibilityRole="button" accessibilityState={{ selected: on }}
              className={`flex-row items-center gap-3 rounded-xl px-3 py-3 ${on ? 'bg-white/15' : ''}`}>
              <Feather name={item.icon} size={18} color={ICON_COLORS.onDark} />
              <Text className={`flex-1 text-sm ${on ? 'font-bold' : 'font-semibold'} text-white`}>{item.label}</Text>
              {badge ? <View className="min-w-5 items-center rounded-full bg-bad px-1.5 py-0.5"><Text className="text-xs font-bold text-white">{badge}</Text></View> : null}
            </Pressable>
          );
        })}
      </View>
      <View className="flex-row items-center gap-3 border-t border-white/15 px-3 pt-4">
        <Text className="flex-1 text-sm font-semibold text-white" numberOfLines={1}>{name}</Text>
        <Pressable onPress={signOut} accessibilityLabel="Sign out" hitSlop={8}><Feather name="log-out" size={18} color={ICON_COLORS.onDark} /></Pressable>
      </View>
    </View>
  );
}
