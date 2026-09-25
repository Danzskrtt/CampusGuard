import Avatar from '@/components/ui/Avatar';
import { GUARD_THEME } from '@/constants/guard';
import { StyleSheet, Text, View } from 'react-native';

export default function GuardHeader({ name, avatarPath }: { name: string; avatarPath?: string | null }) {
  return (
    <View style={styles.header}>
      <View style={styles.profile}>
        <Avatar name={name} uri={avatarPath} size="sm" />
        <Text style={styles.userName}>{name}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    paddingVertical: 12,
  },
  profile: { alignItems: 'center', flexDirection: 'row' },
  userName: { color: '#1B2A4A', fontSize: 13, fontWeight: '600', marginLeft: GUARD_THEME.spacingSm, maxWidth: 180 },
});
