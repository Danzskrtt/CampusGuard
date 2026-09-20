export type RequestStatus = 'pending' | 'approved' | 'rejected';
export type FilterKey = 'all' | RequestStatus;

export interface VisitorRequest {
  id: string;
  visitorName: string;
  relationship: string;
  email: string;
  visitDate: string; // YYYY-MM-DD
  timeWindow: string;
  purpose: string;
  status: RequestStatus;
  passId: string | null;
  qrToken: string | null;
  declinedReason?: string;
}

export interface VisitorDraft {
  fullName: string;
  relationship: string;
  email: string;
  visitDate: string; // YYYY-MM-DD
  timeWindow: string;
  purpose: string;
}
