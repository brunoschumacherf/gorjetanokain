export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function formatPhone(phone: string): string {
  const digits = cleanPhone(phone);
  const local = digits.startsWith('55') && digits.length > 11 ? digits.slice(2) : digits;

  if (local.length <= 2) return local;
  if (local.length <= 6) return `(${local.slice(0, 2)}) ${local.slice(2)}`;
  if (local.length <= 10) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  }
  return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7, 11)}`;
}

export function isValidWhatsApp(phone: string): boolean {
  const digits = cleanPhone(phone);
  const local = digits.startsWith('55') && digits.length > 11 ? digits.slice(2) : digits;

  if (local.length === 11) {
    return local[2] === '9';
  }

  if (local.length === 10) {
    return /^[1-9]{2}[2-9]/.test(local);
  }

  return false;
}
