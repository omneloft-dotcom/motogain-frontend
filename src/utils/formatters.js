// 💰 TL fiyat formatı (taşma & scientific engelli)
export const formatPrice = (price) => {
  if (!price || isNaN(price)) return "₺0";

  const safe = Number(price);
  if (!isFinite(safe)) return "₺0";

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(safe);
};

// 💵 Para birimi formatı (kurye takvimi için)
export const formatCurrency = (amount) => {
  if (!amount || isNaN(amount)) return "₺0";

  const safe = Number(amount);
  if (!isFinite(safe)) return "₺0";

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(safe);
};

// 🖼 Görsel güvenliği
export const getSafeImage = (images, fallback) => {
  if (Array.isArray(images) && images.length > 0) return images[0];
  return fallback;
};
