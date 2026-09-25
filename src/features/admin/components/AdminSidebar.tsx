import { ADMIN_LABEL, ADMIN_NAV, ICON_COLORS } from '@/constants/admin';
import Avatar from '@/components/ui/Avatar';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter, useSegments, type Href } from 'expo-router';
import type { NavigationBadges } from '@/hooks/useNavigationBadges';
import { Pressable, Text, View } from 'react-native';

type Props = { name?: string | null; avatarUri?: string | null; badges?: NavigationBadges };

export default function AdminSidebar({ name, avatarUri, badges = {} }: Props) {
  const router = useRouter();
  const active = useSegments()[1] ?? null;

  const go = (segment: string | null) => {
    router.push((segment ? `/(admin)/${segment}` : '/(admin)') as Href);
  };
  return (
    <View className="flex-1 px-3 py-6" style={{ backgroundColor: '#1B2A4A' }}>
      <View className="flex-row items-center gap-2 px-3 pb-6">
        <Image source={require('../../../../assets/images/slrc-logo.png')} style={{ height: 28, width: 28 }} contentFit="contain" />
        <View>
          <Text className="text-lg font-extrabold text-white">CampusGuard</Text>
          <Text className="text-xs text-sky">{ADMIN_LABEL}</Text>
        </View>
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
              {badge ? <View className="h-2.5 w-2.5 rounded-full bg-bad" /> : null}
            </Pressable>
          );
        })}
      </View>
      <View className="flex-row items-center gap-3 border-t border-white/15 px-3 pt-4">
        <Avatar name={name ?? 'Administrator'} size="sm" uri={avatarUri} />
        <Text className="flex-1 text-sm font-semibold text-white" numberOfLines={1}>{name}</Text>
      </View>
    </View>
  );
}
