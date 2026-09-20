import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    KeyboardTypeOptions,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import DateTimePicker from '@/components/DateTimePicker';
import { colors } from '@/features/student/theme';
import { formatLongDate, parseISODate, toISODate } from '@/features/student/utils/date';

function FieldShell({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <View style={styles.shell}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
}

export function TextField({ label, error, ...inputProps }: TextFieldProps) {
  return (
    <FieldShell label={label} error={error}>
      <TextInput
        {...inputProps}
        placeholderTextColor={colors.textMuted}
        style={[styles.box, styles.input, error ? styles.boxError : null]}
      />
    </FieldShell>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export function SelectField({ label, value, options, onSelect, placeholder = 'Select', error }: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  return (
    <FieldShell label={label} error={error}>
      <Pressable style={[styles.box, styles.selectRow, error ? styles.boxError : null]} onPress={() => setOpen(true)}>
        <Text style={[styles.valueText, !value && { color: colors.textMuted }]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Feather name="chevron-down" size={16} color={colors.textSecondary} />
      </Pressable>
      <Modal transparent animationType="fade" visible={open} onRequestClose={() => setOpen(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <ScrollView>
              {options.map((option) => (
                <Pressable
                  key={option}
                  style={styles.optionRow}
                  onPress={() => {
                    onSelect(option);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.optionText, option === value && styles.optionSelected]}>{option}</Text>
                  {option === value && <Feather name="check" size={16} color={colors.navy} />}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </FieldShell>
  );
}

interface DateFieldProps {
  label: string;
  value: string; // YYYY-MM-DD or ''
  onChange: (iso: string) => void;
  error?: string;
}

export function DateField({ label, value, onChange, error }: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const current = value ? parseISODate(value) : new Date();

  const handleChange = (date?: Date) => {
    if (Platform.OS === 'android') {
      setOpen(false);
      if (date) onChange(toISODate(date));
      return;
    }
    if (date) onChange(toISODate(date));
  };

  const openPicker = () => {
    if (!value) onChange(toISODate(new Date()));
    setOpen(true);
  };

  return (
    <FieldShell label={label} error={error}>
      <Pressable style={[styles.box, styles.selectRow, error ? styles.boxError : null]} onPress={openPicker}>
        <Text style={[styles.valueText, !value && { color: colors.textMuted }]} numberOfLines={1}>
          {value ? formatLongDate(value) : 'Select date'}
        </Text>
        <Feather name="calendar" size={15} color={colors.textSecondary} />
      </Pressable>

      {Platform.OS === 'android' && open && (
        <DateTimePicker value={current} mode="date" minimumDate={new Date()} onValueChange={(_event, date) => handleChange(date)} onDismiss={() => setOpen(false)} />
      )}

      {Platform.OS === 'ios' && (
        <Modal transparent animationType="slide" visible={open} onRequestClose={() => setOpen(false)}>
          <View style={styles.modalRoot}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
            <View style={styles.sheet}>
              <View style={styles.doneRow}>
                <Pressable onPress={() => setOpen(false)} hitSlop={10}>
                  <Text style={styles.doneText}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={current}
                mode="date"
                display="inline"
                themeVariant="light"
                textColor={colors.textPrimary}
                minimumDate={new Date()}
                onValueChange={(_event, date) => handleChange(date)}
                onDismiss={() => setOpen(false)}
                style={styles.datePicker}
              />
            </View>
          </View>
        </Modal>
      )}
    </FieldShell>
  );
}

const styles = StyleSheet.create({
  shell: { marginBottom: 12 },
  label: { fontSize: 11, color: colors.textSecondary, marginBottom: 5 },
  box: {
    height: 40,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
  },
  boxError: { borderColor: colors.danger },
  input: { fontSize: 12, color: colors.textPrimary },
  selectRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  valueText: { flex: 1, fontSize: 12, color: colors.textPrimary, marginRight: 6 },
  error: { fontSize: 10, color: colors.danger, marginTop: 3 },
  modalRoot: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,23,42,0.4)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
    minHeight: 380,
    paddingHorizontal: 12,
  },
  sheetTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, padding: 16 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  optionText: { fontSize: 13, color: colors.textPrimary },
  optionSelected: { fontWeight: '700', color: colors.navy },
  doneRow: { alignItems: 'flex-end', padding: 16 },
  doneText: { fontSize: 14, fontWeight: '600', color: colors.navy },
  datePicker: { width: '100%', height: 320 },
});
