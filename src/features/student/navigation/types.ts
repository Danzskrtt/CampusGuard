import { FilterKey } from '@/features/student/types';

export type MainStackParamList = {
  Home: undefined;
  NewRequest: { editId?: string; prefillFromId?: string } | undefined;
  MyRequests: { filter?: FilterKey } | undefined;
  RequestDetail: { requestId: string };
  QRPass: { requestId: string };
};
