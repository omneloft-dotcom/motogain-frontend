import axiosClient from "./axiosClient";

/**
 * Courier Calendar API
 *
 * Kurye takvimi için API fonksiyonları
 */

const courierApi = {
  // 📝 Belirli bir aydaki tüm girişleri getir
  async getEntries(month) {
    const { data } = await axiosClient.get("/courier/entries", {
      params: { month }, // Format: "YYYY-MM"
    });
    return data.data; // Array of entries
  },

  // 📝 Belirli bir günün girdisini getir
  async getEntry(date) {
    const { data } = await axiosClient.get(`/courier/entries/${date}`);
    return data.data; // Entry object or null
  },

  // ✏️ Yeni giriş oluştur veya güncelle
  async saveEntry(entryData) {
    const { data } = await axiosClient.post("/courier/entries", entryData);
    return data.data; // Saved entry
  },

  // 🗑️ Giriş sil
  async deleteEntry(date) {
    const { data } = await axiosClient.delete(`/courier/entries/${date}`);
    return data;
  },

  // 📊 Aylık istatistikleri getir
  async getStats(month) {
    const { data } = await axiosClient.get("/courier/stats", {
      params: { month }, // Format: "YYYY-MM"
    });
    return data.data; // Stats object
  },

  // 📅 En son kayıt bulunan ayı getir
  async getLatestMonth() {
    const { data } = await axiosClient.get("/courier/latest-month");
    return data.data; // { hasData: boolean, latestMonth: string | null }
  },
};

export default courierApi;
