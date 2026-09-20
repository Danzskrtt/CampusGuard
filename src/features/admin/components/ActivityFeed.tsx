import { Text, View } from 'react-native';
import StatusPill from './StatusPill';
import { LOG_STATUS } from '@/constants/admin';
import type { FeedItem } from '@/hooks/useAdminDashboard';

const time = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

export default function ActivityFeed({ items }: { items: FeedItem[] }) {
  if (!items.length) return <Text className="py-6 text-center text-sm text-muted">No scans yet.</Text>;
  return (
    <View>
      {items.map((it, i) => {
        const s = LOG_STATUS[it.result === 'denied' ? 'denied' : it.action];
        const sub = [it.guard_name, it.result === 'denied' ? it.deny_reason : null].filter(Boolean).join(' Â· ');
        return (
          <View key={it.id} className={`flex-row items-center gap-3 py-3 ${i ? 'border-t border-line' : ''}`}>
            <Text className="w-16 text-xs text-muted">{time(it.scanned_at)}</Text>
            <View className="flex-1">
              <Text className="text-sm font-bold text-ink" numberOfLines={1}>{it.visitor_name ?? 'Unknown code'}</Text>
              {sub ? <Text className="text-xs text-muted" numberOfLines={1}>{sub}</Text> : null}
            </View>
            <StatusPill label={s.label} tone={s.tone} />
          </View>
        );
      })}
    </View>
  );
}
