import type { Tone } from '@/constants/admin';
import { RANGE_DASH } from '@/constants/ui';
import { StyleSheet, Text, View } from 'react-native';
import StatusPill from './StatusPill';

type Props = { label: string; value: number | null; tone: Tone; tag?: string };

export default function StatCard({ label, value, tone, tag }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value ?? RANGE_DASH}</Text>
        {tag && value ? <StatusPill label={tag} tone={tone} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: 18, borderWidth: 1, flex: 1, minWidth: 136, padding: 16 },
  label: { color: '#64748B', fontSize: 12, fontWeight: '700' },
  valueRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  value: { color: '#14213D', fontSize: 30, fontWeight: '800' },
});
