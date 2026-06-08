export function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  const area = digits.slice(0, 2);
  const ninthDigit = digits.slice(2, 3);
  const firstPart = digits.slice(3, 7);
  const secondPart = digits.slice(7, 11);

  if (digits.length <= 2) {
    return area ? `(${area}` : '';
  }

  if (digits.length <= 3) {
    return `(${area})${ninthDigit}`;
  }

  if (digits.length <= 7) {
    return `(${area})${ninthDigit} ${firstPart}`;
  }

  return `(${area})${ninthDigit} ${firstPart}-${secondPart}`;
}
