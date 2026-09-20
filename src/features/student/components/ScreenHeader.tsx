import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/features/student/theme';

interface Props {
  title: string;
  onBack?: () => void;
  onMore?: () => void;
  showMore?: boolean;
}

export default function ScreenHeader({ title, onBack, onMore, showMore = true }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {onBack && (
          <Pressable onPress={onBack} hitSlop={10} style={styles.iconBtn}>
            <Feather name="chevron-left" size={22} color={colors.navy} />
          </Pressable>
        )}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={[styles.side, styles.sideRight]}>
        {showMore && (
          <Pressable onPress={onMore} hitSlop={10} style={styles.iconBtn}>
            <Feather name="more-horizontal" size={20} color={colors.navy} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  side: { width: 40 },
  sideRight: { alignItems: 'flex-end' },
  iconBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
