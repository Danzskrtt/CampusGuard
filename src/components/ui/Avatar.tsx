import { AVATAR_COLORS, AVATAR_COPY, AVATAR_SIZES, AVATAR_TEXT_COLORS } from '@/constants/avatar';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  uri?: string | null;
  name: string;
  size: keyof typeof AVATAR_SIZES;
  onPress?: () => void;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0]?.[0] ?? '?').toUpperCase();
}

function colorIndex(name: string) {
  return Array.from(name.trim()).reduce((total, character) => total + character.charCodeAt(0), 0) % AVATAR_COLORS.length;
}

function AvatarImage({ uri, pixels, fallback }: { uri: string; pixels: number; fallback: React.ReactNode }) {
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  if (failed) return <>{fallback}</>;

  // The image is always mounted so it can load; the fallback sits on top until onLoad fires.
  return (
    <View style={{ height: pixels, width: pixels }}>
      <Image
        source={{ uri }}
        cachePolicy="memory-disk"
        contentFit="cover"
        onError={() => setFailed(true)}
        onLoad={() => setLoading(false)}
        style={{ borderRadius: pixels / 2, height: pixels, width: pixels }}
      />
      {loading ? (
        <View style={[StyleSheet.absoluteFill, styles.nonInteractive]}>
          {fallback}
        </View>
      ) : null}
    </View>
  );
}

export default function Avatar({ uri, name, size, onPress }: Props) {
  const pixels = AVATAR_SIZES[size];
  const index = colorIndex(name);
  const fallback = (
    <View style={[styles.fallback, { backgroundColor: AVATAR_COLORS[index], height: pixels, width: pixels }]}>
      <Text style={[styles.initials, { color: AVATAR_TEXT_COLORS[index], fontSize: Math.max(12, Math.round(pixels * 0.34)) }]}>{initials(name)}</Text>
    </View>
  );

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={AVATAR_COPY.profilePhoto(name)}
      style={{ borderRadius: pixels / 2 }}
    >
      {uri ? <AvatarImage key={uri} fallback={fallback} pixels={pixels} uri={uri} /> : fallback}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', borderRadius: 999, justifyContent: 'center' },
  initials: { fontWeight: '800' },
  nonInteractive: { pointerEvents: 'none' },
});
