export function generatePassId(): string {
  return `CP-${Math.floor(100000 + Math.random() * 900000)}`;
}

export function generateQrToken(): string {
  const cryptoObject = globalThis.crypto as Crypto | undefined;
  return cryptoObject?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 14)}`;
}