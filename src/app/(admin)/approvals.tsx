import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import ApprovalRow from '@/features/admin/components/ApprovalRow';
import RejectSheet from '@/features/admin/components/RejectSheet';
import { REQUEST_STATUS } from '@/constants/admin';
import { useApprovals, type PendingRequest } from '@/hooks/useApprovals';

export default function Approvals() {
  const { items, loading, busyId, error, refresh, decide } = useApprovals();
  const [rejecting, setRejecting] = useState<PendingRequest | null>(null);
  return (
    <>
      <ScrollView className="flex-1" contentContainerClassName="gap-4 p-5 md:p-10"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}>
        <View>
          <Text className="text-2xl font-extrabold text-ink">Pending Approvals</Text>
          <Text className="text-sm text-muted">Review visitor requests submitted by students</Text>
        </View>
        {error ? (
          <View className="rounded-2xl border border-bad bg-white p-4">
            <Text className="text-sm text-bad">{error}</Text>
            <Pressable onPress={refresh} className="mt-2"><Text className="text-sm font-bold text-navy">Try again</Text></Pressable>
          </View>
        ) : null}
        {items.map((it) => (
          <ApprovalRow key={it.id} item={it} busy={busyId === it.id}
            onApprove={(id) => decide(id, REQUEST_STATUS.approved)} onReject={setRejecting} />
        ))}
        {!loading && !items.length && !error ? <Text className="py-10 text-center text-sm text-muted">No pending requests.</Text> : null}
      </ScrollView>
      <RejectSheet name={rejecting?.visitor_name ?? null} visible={!!rejecting} onCancel={() => setRejecting(null)}
        onConfirm={(reason) => { if (rejecting) decide(rejecting.id, REQUEST_STATUS.rejected, reason); setRejecting(null); }} />
    </>
  );
}
