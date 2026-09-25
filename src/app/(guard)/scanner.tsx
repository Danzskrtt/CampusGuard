import { GUARD_ACTION_LABELS, GUARD_BARCODE_TYPES, GUARD_COPY, GUARD_RPC, GUARD_THEME } from '@/constants/guard';
import { extractPassQrToken } from '@/features/student/utils/pass.shared';
import { useCameraGate } from '@/hooks/useCameraGate';
import { notifyGuardScanResult } from '@/lib/pushNotifications';
import { supabase } from '@/supabase';
import { Feather } from '@expo/vector-icons';
import { CameraView } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { usePathname } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function PermissionGate() {
  const gate = useCameraGate();
  const denied = gate.status === 'denied';
  return <SafeAreaView style={styles.permission}><View style={styles.permissionIcon}><Feather name="camera" size={GUARD_THEME.iconSize} color={GUARD_THEME.amber} /></View><Text style={styles.permissionTitle}>{gate.status === 'loading' ? gate.copy.checkingCamera : gate.copy.cameraTitle}</Text><Text style={styles.permissionReason}>{gate.copy.cameraReason}</Text>{gate.status !== 'loading' ? <Pressable accessibilityRole="button" onPress={denied ? gate.openSettings : gate.requestPermission} style={styles.permissionButton}><Text style={styles.permissionButtonText}>{denied ? gate.copy.openSettings : gate.copy.allowCamera}</Text></Pressable> : null}</SafeAreaView>;
}

export default function GuardScanner() {
  const gate = useCameraGate();
  const pathname = usePathname();
  const focused = pathname.endsWith('/scanner');
  const [torch, setTorch] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ status: 'granted' | 'denied'; reason: string | null; action: 'entry' | 'exit' | null; visitorName: string | null; passId: string | null } | null>(null);
  const locked = useRef(false);
  const lastCode = useRef<string | null>(null);

  useEffect(() => { if (!focused) return; void activateKeepAwakeAsync('guard-scanner'); return () => { void deactivateKeepAwake('guard-scanner'); }; }, [focused]);
  if (gate.status !== 'granted') return <PermissionGate />;

  const handleScan = async ({ data: rawCode }: { data: string }) => {
    if (locked.current || !rawCode || rawCode === lastCode.current) return;
    locked.current = true;
    lastCode.current = rawCode;
    setScanning(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const qrToken = extractPassQrToken(rawCode);
    const { data: rpcData, error } = await supabase.rpc(GUARD_RPC.scan, { p_qr_token: qrToken });
    await new Promise((resolve) => setTimeout(resolve, GUARD_THEME.scanResultDelayMs));
    if (error) {
      void notifyGuardScanResult('denied').catch(() => undefined);
      setResult({ status: 'denied', reason: GUARD_COPY.scanNetworkError, action: null, visitorName: null, passId: null });
    } else {
      const response = rpcData as { result?: 'granted' | 'denied'; reason?: string | null; action?: 'entry' | 'exit'; visitor_name?: string | null; pass_id?: string | null };
      const status = response.result === 'granted' ? 'granted' : 'denied';
      void notifyGuardScanResult(status).catch(() => undefined);
      setResult({ status, reason: response.reason ?? null, action: response.action ?? null, visitorName: response.visitor_name ?? null, passId: response.pass_id ?? null });
    }
    setScanning(false);
  };
  const reset = () => { locked.current = false; lastCode.current = null; setResult(null); };

  return <View style={styles.screen}><CameraView style={StyleSheet.absoluteFill} facing="back" active={focused && !result} enableTorch={torch} barcodeScannerSettings={{ barcodeTypes: [...GUARD_BARCODE_TYPES] }} onBarcodeScanned={handleScan} /><View style={[StyleSheet.absoluteFill, styles.scrim]} /><SafeAreaView style={styles.overlay}><View style={styles.scannerHeader}><Text style={styles.scannerTitle}>{scanning ? GUARD_COPY.scanningTitle : GUARD_COPY.scannerTitle}</Text><Pressable accessibilityRole="button" accessibilityLabel={torch ? GUARD_COPY.torchOn : GUARD_COPY.torchOff} onPress={() => setTorch((value) => !value)} style={styles.torch}><Feather name="zap" size={GUARD_THEME.iconSize} color={torch ? GUARD_THEME.amber : GUARD_THEME.white} /></Pressable></View><View style={styles.frameArea}><View style={[styles.frame, scanning && styles.frameScanning]} /><Text style={styles.caption}>{scanning ? GUARD_COPY.scanningCaption : GUARD_COPY.scanCaption}</Text></View>{result ? <View style={styles.result}><View style={[styles.resultIcon, { backgroundColor: result.status === 'granted' ? GUARD_THEME.greenSoft : GUARD_THEME.redSoft }]}><Feather name={result.status === 'granted' ? 'check' : 'x'} size={GUARD_THEME.iconSize} color={result.status === 'granted' ? GUARD_THEME.green : GUARD_THEME.red} /></View><Text style={styles.resultTitle}>{result.status === 'granted' ? GUARD_COPY.accessGranted : GUARD_COPY.accessDenied}</Text>{result.action ? <Text style={styles.action}>{GUARD_ACTION_LABELS[result.action]}</Text> : null}{result.reason ? <Text style={styles.resultDetail}>{result.reason}</Text> : null}{result.visitorName ? <Text style={styles.resultDetail}>{GUARD_COPY.visitorName}: {result.visitorName}</Text> : null}{result.passId ? <Text style={styles.resultDetail}>{GUARD_COPY.passId}: {result.passId}</Text> : null}<Pressable accessibilityRole="button" onPress={reset} style={styles.retry}><Text style={styles.retryText}>{GUARD_COPY.retry}</Text></Pressable>{process.env.EXPO_PUBLIC_ADMIN_CONTACT ? <Pressable accessibilityRole="button" onPress={() => void Linking.openURL(process.env.EXPO_PUBLIC_ADMIN_CONTACT ?? '')} style={styles.contact}><Text style={styles.contactText}>{GUARD_COPY.contactAdmin}</Text></Pressable> : null}</View> : null}</SafeAreaView></View>;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: GUARD_THEME.dark, flex: 1 }, scrim: { backgroundColor: GUARD_THEME.overlay }, overlay: { flex: 1, paddingHorizontal: GUARD_THEME.spacingLg }, scannerHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingTop: GUARD_THEME.spacingLg }, scannerTitle: { color: GUARD_THEME.white, fontSize: 15, fontWeight: '700' }, torch: { alignItems: 'center', height: GUARD_THEME.touchTarget, justifyContent: 'center', width: GUARD_THEME.touchTarget }, frameArea: { alignItems: 'center', flex: 1, justifyContent: 'center' }, frame: { borderColor: GUARD_THEME.white, borderRadius: GUARD_THEME.radiusMedium, borderStyle: 'dashed', borderWidth: 2, height: GUARD_THEME.scanMaxSize, maxHeight: '60%', maxWidth: '90%', width: '80%' }, frameScanning: { borderColor: GUARD_THEME.amber }, caption: { color: GUARD_THEME.white, fontSize: 12, marginTop: GUARD_THEME.spacingMd }, permission: { alignItems: 'center', backgroundColor: GUARD_THEME.dark, flex: 1, justifyContent: 'center', padding: GUARD_THEME.spacingXl }, permissionIcon: { alignItems: 'center', backgroundColor: GUARD_THEME.amberSoft, borderRadius: GUARD_THEME.radiusPill, height: GUARD_THEME.touchTarget, justifyContent: 'center', width: GUARD_THEME.touchTarget }, permissionTitle: { color: GUARD_THEME.white, fontSize: 18, fontWeight: '800', marginTop: GUARD_THEME.spacingLg, textAlign: 'center' }, permissionReason: { color: GUARD_THEME.slate, fontSize: 13, marginTop: GUARD_THEME.spacingSm, textAlign: 'center' }, permissionButton: { backgroundColor: GUARD_THEME.amber, borderRadius: GUARD_THEME.radiusMedium, marginTop: GUARD_THEME.spacingLg, minHeight: GUARD_THEME.buttonHeight, paddingHorizontal: GUARD_THEME.spacingXl, paddingVertical: GUARD_THEME.spacingMd }, permissionButtonText: { color: GUARD_THEME.navy, fontWeight: '800' }, result: { alignItems: 'center', alignSelf: 'center', backgroundColor: GUARD_THEME.surface, borderRadius: GUARD_THEME.radiusLarge, bottom: GUARD_THEME.spacingXl, maxWidth: GUARD_THEME.modalMaxWidth, padding: GUARD_THEME.spacingLg, position: 'absolute', width: '100%' }, resultIcon: { alignItems: 'center', backgroundColor: GUARD_THEME.redSoft, borderRadius: GUARD_THEME.radiusPill, height: GUARD_THEME.touchTarget, justifyContent: 'center', width: GUARD_THEME.touchTarget }, resultTitle: { color: GUARD_THEME.text, fontSize: 14, fontWeight: '700', marginTop: GUARD_THEME.spacingMd, textAlign: 'center' }, action: { color: GUARD_THEME.navy, fontSize: 14, fontWeight: '800', marginTop: GUARD_THEME.spacingSm }, resultDetail: { color: GUARD_THEME.mutedText, fontSize: 12, marginTop: GUARD_THEME.spacingSm, textAlign: 'center' }, retry: { backgroundColor: GUARD_THEME.navy, borderRadius: GUARD_THEME.radiusMedium, marginTop: GUARD_THEME.spacingMd, padding: GUARD_THEME.spacingMd, width: '100%' }, retryText: { color: GUARD_THEME.white, fontWeight: '700', textAlign: 'center' }, contact: { marginTop: GUARD_THEME.spacingSm, padding: GUARD_THEME.spacingSm }, contactText: { color: GUARD_THEME.navy, fontWeight: '700' },
});
