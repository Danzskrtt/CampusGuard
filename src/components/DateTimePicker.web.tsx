import type { ComponentProps } from 'react';

export type DateTimePickerEvent = { type: string };
export type DateTimePickerProps = ComponentProps<'input'> & {
  minimumDate?: Date;
  mode?: 'date' | 'time';
  onValueChange?: (event: unknown, date: Date) => void;
  onDismiss?: () => void;
  themeVariant?: 'light' | 'dark';
  textColor?: string;
};

export default function DateTimePicker(_props: DateTimePickerProps) {
  return null;
}
