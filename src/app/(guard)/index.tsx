import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

export default function GuardDashboard() {
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!permission?.granted && permission?.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  if (!permission) {
    return <View className="flex-1 items-center justify-center bg-[#1E2B45]"><Text className="text-white">Checking camera permission...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-[#1E2B45] px-6">
        <Text className="text-center text-lg font-bold text-white">Camera access is required</Text>
        <Text className="mt-2 text-center text-slate-300">Enable camera permission to scan student passes.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#1E2B45]">
      <View className="px-6 pb-5 pt-20">
        <Text className="text-2xl font-bold text-white">Guard Dashboard</Text>
        <Text className="mt-2 text-slate-300">Scan a student QR code to verify entry.</Text>
      </View>
      <CameraView className="flex-1" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} />
    </View>
  );
}