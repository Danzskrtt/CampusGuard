export type DateTimePickerEvent = { type: string };

export type DateTimePickerProps = {
  value: Date;
  mode?: 'date' | 'time';
  minimumDate?: Date;
  display?: string;
  themeVariant?: 'light' | 'dark';
  textColor?: string;
  onValueChange?: (event: unknown, date: Date) => void;
  onDismiss?: () => void;
  style?: unknown;
};

export default function DateTimePicker(_props: DateTimePickerProps) {
  return null;
}
