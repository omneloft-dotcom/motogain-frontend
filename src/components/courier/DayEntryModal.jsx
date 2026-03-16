import { useState, useEffect } from "react";
import { X, Trash2, Save, Calculator } from "lucide-react";
import courierApi from "../../api/courierApi";
import TariffCalculator from "./TariffCalculator";

/**
 * DayEntryModal - Günlük Kazanç/Gider Giriş Modal'ı
 *
 * Features:
 * - Gelir, gider, not, teslimat sayısı, çalışma saati girişi
 * - Mevcut giriş varsa düzenle, yoksa yeni oluştur
 * - Silme özelliği
 * - Form validation
 */

export default function DayEntryModal({ date, onClose, onSaveSuccess }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [existingEntry, setExistingEntry] = useState(null);
  const [useCalculator, setUseCalculator] = useState(false); // Hesaplayıcı modu

  const [formData, setFormData] = useState({
    income: "",
    expense: "",
    note: "",
    deliveryCount: "",
    workHours: "",
    orders: [],
    expenses: [],
  });

  // Mevcut girişi yükle
  useEffect(() => {
    loadEntry();
  }, [date]);

  const loadEntry = async () => {
    try {
      setLoading(true);
      const entry = await courierApi.getEntry(date);

      if (entry) {
        setExistingEntry(entry);
        setFormData({
          income: entry.income || "",
          expense: entry.expense || "",
          note: entry.note || "",
          deliveryCount: entry.deliveryCount || "",
          workHours: entry.workHours || "",
          orders: entry.orders || [],
          expenses: entry.expenses || [],
        });
        // Eğer orders/expenses varsa hesaplayıcı modunda aç
        if (entry.orders?.length > 0 || entry.expenses?.length > 0) {
          setUseCalculator(true);
        }
      }
    } catch (error) {
      console.error("[DayEntryModal] Load error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Tarife hesaplayıcısından gelen veriyi formData'ya aktar
  const handleCalculatorUpdate = (calculatedData) => {
    setFormData((prev) => ({
      ...prev,
      orders: calculatedData.orders,
      expenses: calculatedData.expenses,
      income: calculatedData.income,
      expense: calculatedData.expense,
      deliveryCount: calculatedData.deliveryCount,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const entryData = {
        date,
        note: formData.note || null,
        workHours: parseFloat(formData.workHours) || 0,
      };

      // Hesaplayıcı modu: orders ve expenses gönder
      if (useCalculator) {
        entryData.orders = formData.orders;
        entryData.expenses = formData.expenses;
      } else {
        // Basit mod: direkt income/expense
        entryData.income = parseFloat(formData.income) || 0;
        entryData.expense = parseFloat(formData.expense) || 0;
        entryData.deliveryCount = parseInt(formData.deliveryCount) || 0;
      }

      await courierApi.saveEntry(entryData);
      onSaveSuccess();
    } catch (error) {
      console.error("[DayEntryModal] Save error:", error);
      alert("Kayıt sırasında hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bu günün girdisini silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      setDeleting(true);
      await courierApi.deleteEntry(date);
      onSaveSuccess();
    } catch (error) {
      console.error("[DayEntryModal] Delete error:", error);
      alert("Silme sırasında hata oluştu");
    } finally {
      setDeleting(false);
    }
  };

  // Tarih formatı (14 Ocak 2026)
  const formattedDate = formatDate(date);

  // Net kazanç hesapla
  const income = parseFloat(formData.income) || 0;
  const expense = parseFloat(formData.expense) || 0;
  const netIncome = income - expense;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border border-border max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">
              {existingEntry ? "Günü Düzenle" : "Yeni Gün Ekle"}
            </h2>
            <p className="text-sm text-text-secondary mt-1">{formattedDate}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-card-hover rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-card-hover rounded"></div>
              <div className="h-10 bg-card-hover rounded"></div>
              <div className="h-20 bg-card-hover rounded"></div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              {/* Mod Seçici */}
              <div className="flex items-center justify-between bg-background border border-border rounded-lg p-3">
                <span className="text-sm text-text-secondary">Detaylı Giriş</span>
                <button
                  type="button"
                  onClick={() => setUseCalculator(!useCalculator)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    useCalculator
                      ? "bg-primary text-white"
                      : "bg-card text-text-secondary hover:bg-card-hover"
                  }`}
                >
                  <Calculator className="w-4 h-4" />
                  {useCalculator ? "Aktif" : "Pasif"}
                </button>
              </div>

              {useCalculator ? (
                /* Tarife Hesaplayıcı Modu */
                <TariffCalculator onCalculate={handleCalculatorUpdate} />
              ) : (
                /* Basit Giriş Modu */
                <>
                  {/* Gelir */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      💰 Gelir (Kazanç)
                    </label>
                    <input
                      type="number"
                      name="income"
                      value={formData.income}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Gider */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  💸 Gider (Yakıt, Bakım, vs.)
                </label>
                <input
                  type="number"
                  name="expense"
                  value={formData.expense}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Teslimat Sayısı */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  📦 Teslimat Sayısı (Opsiyonel)
                </label>
                <input
                  type="number"
                  name="deliveryCount"
                  value={formData.deliveryCount}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
                </>
              )}

              {/* Çalışma Saati - Her iki modda da */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  ⏱️ Çalışma Saati (Opsiyonel)
                </label>
                <input
                  type="number"
                  name="workHours"
                  value={formData.workHours}
                  onChange={handleChange}
                  min="0"
                  max="24"
                  step="0.5"
                  placeholder="0.0"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Not - Her iki modda da */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  📝 Not (Opsiyonel)
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  rows={3}
                  maxLength={500}
                  placeholder="Bugün hakkında not ekleyebilirsin..."
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                <div className="text-xs text-text-muted mt-1 text-right">
                  {(formData.note || "").length}/500
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-border">
              {/* Sil butonu (sadece mevcut giriş varsa) */}
              {existingEntry && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting ? "Siliniyor..." : "Sil"}
                </button>
              )}

              {/* Spacer */}
              {!existingEntry && <div></div>}

              {/* Kaydet butonu */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-text-secondary hover:bg-card-hover rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ==================== HELPER FUNCTIONS ====================

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const monthNames = [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ];
  return `${day} ${monthNames[month - 1]} ${year}`;
}
