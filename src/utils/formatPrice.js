export function formatPrice(value) {
  const num = Number(value);

  // ❌ Geçersiz / negatif / NaN
  if (!Number.isFinite(num) || num < 0) return "₺ 0";

  // ❌ Aşırı büyük sayılar (UI koruması)
  if (num > 9_999_999_999) return "₺ 9.999.999.999+";

  return `₺ ${num.toLocaleString("tr-TR")}`;
}
