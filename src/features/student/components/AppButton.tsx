import { colors } from '@/features/student/theme';
import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

type Variant = 'primary' | 'danger' | 'light' | 'ghostDark';

// Move these into your theme file when convenient.
const GHOST_BORDER = 'rgba(255,255,255,0.6)';
const BUTTON_MIN_HEIGHT = 46;
const BUTTON_RADIUS = 10;
const BUTTON_PADDING_X = 16;
const ICON_GAP = 8;
const LABEL_SIZE = 13;
const MIN_LABEL_SCALE = 0.85;
const PRESSED_OPACITY = 0.85;
const DISABLED_OPACITY = 0.5;

const VARIANTS: Record<Variant, { bg: string; text: string; border: string }> = {
  primary: { bg: colors.navy, text: colors.white, border: colors.navy },
  danger: { bg: colors.danger, text: colors.white, border: colors.danger },
  light: { bg: colors.white, text: colors.navy, border: colors.white },
  ghostDark: { bg: 'transparent', text: colors.white, border: GHOST_BORDER },
}

interface Props {
  title: string;
  onPress: () => void;
  variant?: Variant;
  icon?: (color: string) => React.ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>; // outer wrapper: flex / margins from the parent
  buttonStyle?: StyleProp<ViewStyle>; // the visible button box
}

export default function AppButton({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  style,
  buttonStyle,
}: Props) {
  const v = VARIANTS[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        { opacity: disabled ? DISABLED_OPACITY : pressed ? PRESSED_OPACITY : 1 },
        style,
      ]}
    >
      <View style={[styles.button, buttonStyle, { backgroundColor: v.bg, borderColor: v.border }]}>
        {icon ? <View style={styles.icon}>{icon(v.text)}</View> : null}
        <Text
          style={[styles.text, { color: v.text }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={MIN_LABEL_SCALE}
        >
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    // minHeight + flexGrow: two buttons in one row always end up the same height,
    // even if one label wraps or the system font size is larger.
    flexGrow: 1,
    minHeight: BUTTON_MIN_HEIGHT,
    borderRadius: BUTTON_RADIUS,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: BUTTON_PADDING_X,
  },
  icon: { marginRight: ICON_GAP },
  text: { fontSize: LABEL_SIZE, fontWeight: '600', flexShrink: 1 },
});
