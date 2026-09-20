import NativeDateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import type { ComponentProps } from 'react';

export type { DateTimePickerEvent };
export type DateTimePickerProps = ComponentProps<typeof NativeDateTimePicker>;

export default function DateTimePicker(props: DateTimePickerProps) {
  return <NativeDateTimePicker {...props} />;
}
