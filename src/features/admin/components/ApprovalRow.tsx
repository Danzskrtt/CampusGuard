import { Pressable, Text, View } from 'react-native';
import type { PendingRequest } from '@/hooks/useApprovals';

type Props = { item: PendingRequest; busy: boolean; onApprove: (id: string) => void; onReject: (item: PendingRequest) => void };

const fmt = (d: string) => new Date(`${d}T00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

// Stacked card on phones; single row on iPad (md:)
export default function ApprovalRow({ item, busy, onApprove, onReject }: Props) {
  const meta = [item.relationship, item.requester?.full_name && `Requested by ${item.requester.full_name}`].filter(Boolean).join(' Â· ');
  return (
    <View className="gap-3 rounded-2xl border border-line bg-white p-4 md:flex-row md:items-center">
      <View className="flex-1 gap-0.5">
        <Text className="text-base font-bold text-ink">{item.visitor_name}</Text>
        {meta ? <Text className="text-xs text-muted">{meta}</Text> : null}
        <Text className="text-xs text-muted">{fmt(item.visit_date)} Â· {item.time_window}</Text>
        <Text className="text-xs text-muted">{item.purpose}</Text>
      </View>
      <View className="flex-row gap-2 md:w-64">
        <Pressable disabled={busy} onPress={() => onReject(item)} accessibilityRole="button"
          className="h-11 flex-1 items-center justify-center rounded-xl border border-bad">
          <Text className="text-sm font-bold text-bad">Reject</Text>
        </Pressable>
        <Pressable disabled={busy} onPress={() => onApprove(item.id)} accessibilityRole="button"
          className="h-11 flex-1 items-center justify-center rounded-xl bg-ok">
          <Text className="text-sm font-bold text-white">Approve</Text>
        </Pressable>
      </View>
    </View>
  );
}
