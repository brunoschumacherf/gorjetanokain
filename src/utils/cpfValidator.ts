export function cleanCPF(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

export function isValidCPFFormat(cpf: string): boolean {
  const cleaned = cleanCPF(cpf);
  return cleaned.length === 11 && /^\d{11}$/.test(cleaned);
}

export function isValidCPF(cpf: string): boolean {
  const cleaned = cleanCPF(cpf);
  
  if (cleaned.length !== 11) return false;
  
  if (/^(\d)\1{10}$/.test(cleaned)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned.charAt(10))) return false;
  
  return true;
}

export function formatCPF(cpf: string): string {
  const cleaned = cleanCPF(cpf);
  if (cleaned.length !== 11) return cpf;
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}
