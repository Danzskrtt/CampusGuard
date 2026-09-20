import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '@/features/student/theme';

type Variant = 'primary' | 'danger' | 'light' | 'ghostDark';

const VARIANTS: Record<Variant, { bg: string; text: string; border: string }> = {
  primary: { bg: '#1B2A4A', text: '#FFFFFF', border: '#1B2A4A' },
  danger: { bg: colors.danger, text: colors.white, border: colors.danger },
  light: { bg: colors.white, text: colors.navy, border: colors.white },
  ghostDark: { bg: 'transparent', text: colors.white, border: 'rgba(255,255,255,0.6)' },
};

interface Props {
  title: string;
  onPress: () => void;
  variant?: Variant;
  icon?: (color: string) => React.ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function AppButton({ title, onPress, variant = 'primary', icon, disabled, style }: Props) {
  const v = VARIANTS[variant];
  
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        { opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        style, // Applies the marginTop from your HomeDashboardScreen
      ]}
    >
      <View
        style={[
          styles.button,
          { backgroundColor: v.bg, borderColor: v.border },
        ]}
      >
        <View style={styles.row}>
          {icon ? <View style={styles.icon}>{icon(v.text)}</View> : null}
          <Text style={[styles.text, { color: v.text }]}>{title}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  icon: { marginRight: 8 },
  text: { fontSize: 13, fontWeight: '600' },
});