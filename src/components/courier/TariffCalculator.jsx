import { useState } from "react";
import { Calculator, Plus, Trash2 } from "lucide-react";

/**
 * TariffCalculator - Platform Bazlı Tarife Hesaplayıcı
 *
 * Trendyol, Yemeksepeti gibi platformların tarifelerine göre
 * sipariş bazlı kazanç hesaplama aracı
 */

// Platform tarifeleri (örnek veriler - gerçek tarife tablolarından alınacak)
const PLATFORM_TARIFFS = {
  trendyol: {
    name: "Trendyol",
    icon: "🟠",
    rates: {
      standard: { base: 38, perKm: 5, description: "0-6 km arası" },
      express: { base: 50, perKm: 7, description: "Express teslimat" },
    },
  },
  yemeksepeti: {
    name: "Yemeksepeti",
    icon: "🍕",
    rates: {
      standard: { base: 35, perKm: 6, description: "Standart sipariş" },
      express: { base: 45, perKm: 8, description: "Hızlı teslimat" },
    },
  },
  getir: {
    name: "Getir",
    icon: "🟣",
    rates: {
      standard: { base: 40, perKm: 5.5, description: "Normal" },
      express: { base: 55, perKm: 7.5, description: "Acil" },
    },
  },
  migros: {
    name: "Migros",
    icon: "🟠",
    rates: {
      standard: { base: 42, perKm: 6, description: "Market" },
      scheduled: { base: 50, perKm: 0, description: "Randevulu" },
    },
  },
  diğer: {
    name: "Diğer",
    icon: "📦",
    rates: {
      standard: { base: 0, perKm: 0, description: "Manuel giriş" },
    },
  },
};

const EXPENSE_CATEGORIES = {
  fuel: { name: "Yakıt", icon: "⛽", color: "text-red-400" },
  maintenance: { name: "Bakım", icon: "🔧", color: "text-orange-400" },
  parking: { name: "Otopark", icon: "🅿️", color: "text-blue-400" },
  fine: { name: "Ceza", icon: "🚫", color: "text-red-500" },
  food: { name: "Yemek", icon: "🍔", color: "text-yellow-400" },
  other: { name: "Diğer", icon: "📝", color: "text-gray-400" },
};

export default function TariffCalculator({ onCalculate }) {
  const [orders, setOrders] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Yeni sipariş formu
  const [newOrder, setNewOrder] = useState({
    platform: "trendyol",
    orderType: "standard",
    count: 1,
    distance: 0,
    earnings: 0,
  });

  // Yeni gider formu
  const [newExpense, setNewExpense] = useState({
    category: "fuel",
    amount: 0,
    note: "",
  });

  // Sipariş ekle
  const handleAddOrder = () => {
    if (newOrder.earnings > 0 && newOrder.count > 0) {
      setOrders([...orders, { ...newOrder, id: Date.now() }]);
      setNewOrder({
        platform: "trendyol",
        orderType: "standard",
        count: 1,
        distance: 0,
        earnings: 0,
      });
      setShowAddOrder(false);
      calculateTotals([...orders, newOrder], expenses);
    }
  };

  // Gider ekle
  const handleAddExpense = () => {
    if (newExpense.amount > 0) {
      setExpenses([...expenses, { ...newExpense, id: Date.now() }]);
      setNewExpense({ category: "fuel", amount: 0, note: "" });
      setShowAddExpense(false);
      calculateTotals(orders, [...expenses, newExpense]);
    }
  };

  // Sipariş sil
  const removeOrder = (id) => {
    const updated = orders.filter((o) => o.id !== id);
    setOrders(updated);
    calculateTotals(updated, expenses);
  };

  // Gider sil
  const removeExpense = (id) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    calculateTotals(orders, updated);
  };

  // Toplam hesapla ve parent'a bildir
  const calculateTotals = (ordersList, expensesList) => {
    const totalIncome = ordersList.reduce((sum, o) => sum + o.earnings, 0);
    const totalExpense = expensesList.reduce((sum, e) => sum + e.amount, 0);
    const totalDeliveries = ordersList.reduce((sum, o) => sum + o.count, 0);
    const totalDistance = ordersList.reduce((sum, o) => sum + (o.distance || 0), 0);

    onCalculate({
      orders: ordersList.map(({ id, ...order }) => order),
      expenses: expensesList.map(({ id, ...expense }) => expense),
      income: totalIncome,
      expense: totalExpense,
      deliveryCount: totalDeliveries,
      totalDistance: totalDistance,
      netIncome: totalIncome - totalExpense,
    });
  };

  // Tarife bazlı kazanç hesapla
  const calculateEarnings = (platform, orderType, distance, count) => {
    const tariff = PLATFORM_TARIFFS[platform]?.rates[orderType];
    if (!tariff) return 0;
    const perOrder = tariff.base + tariff.perKm * distance;
    return perOrder * count;
  };

  // Platform değişince kazancı otomatik hesapla
  const handleOrderChange = (field, value) => {
    const updated = { ...newOrder, [field]: value };

    // Eğer platform, orderType, distance veya count değiştiyse kazancı hesapla
    if (["platform", "orderType", "distance", "count"].includes(field)) {
      if (updated.platform !== "diğer") {
        updated.earnings = calculateEarnings(
          updated.platform,
          updated.orderType,
          updated.distance,
          updated.count
        );
      }
    }

    setNewOrder(updated);
  };

  const totalIncome = orders.reduce((sum, o) => sum + o.earnings, 0);
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netIncome = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      {/* Özet Kart */}
      <div className="bg-background border border-border rounded-lg p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span className="font-semibold text-sm sm:text-base">Günlük Özet</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div>
            <div className="text-[10px] sm:text-xs text-text-muted mb-1">Gelir</div>
            <div className="text-sm sm:text-lg font-bold text-green-400">₺{totalIncome.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-[10px] sm:text-xs text-text-muted mb-1">Gider</div>
            <div className="text-sm sm:text-lg font-bold text-red-400">₺{totalExpense.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-[10px] sm:text-xs text-text-muted mb-1">Net</div>
            <div
              className={`text-sm sm:text-lg font-bold ${
                netIncome > 0 ? "text-primary" : netIncome < 0 ? "text-red-400" : "text-text-muted"
              }`}
            >
              ₺{netIncome.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Siparişler */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">📦 Slotlar</h3>
          <button
            type="button"
            onClick={() => setShowAddOrder(!showAddOrder)}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Ekle
          </button>
        </div>

        {showAddOrder && (
          <div className="bg-background border border-border rounded-lg p-3 sm:p-4 mb-3 space-y-3">
            {/* Platform */}
            <div>
              <label className="block text-[10px] sm:text-xs text-text-secondary mb-1">Platform</label>
              <select
                value={newOrder.platform}
                onChange={(e) => handleOrderChange("platform", e.target.value)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-card border border-border rounded-lg text-xs sm:text-sm text-text-primary [&>option]:bg-card [&>option]:text-text-primary"
              >
                {Object.entries(PLATFORM_TARIFFS).map(([key, data]) => (
                  <option key={key} value={key}>
                    {data.icon} {data.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sipariş Tipi */}
            <div>
              <label className="block text-[10px] sm:text-xs text-text-secondary mb-1">Teslimat Tipi</label>
              <select
                value={newOrder.orderType}
                onChange={(e) => handleOrderChange("orderType", e.target.value)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-card border border-border rounded-lg text-xs sm:text-sm text-text-primary [&>option]:bg-card [&>option]:text-text-primary"
              >
                {Object.entries(PLATFORM_TARIFFS[newOrder.platform]?.rates || {}).map(
                  ([key, data]) => (
                    <option key={key} value={key}>
                      {data.description}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {/* Adet */}
              <div>
                <label className="block text-[10px] sm:text-xs text-text-secondary mb-1">Adet</label>
                <input
                  type="number"
                  min="1"
                  value={newOrder.count}
                  onChange={(e) => handleOrderChange("count", parseInt(e.target.value) || 1)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-card border border-border rounded-lg text-xs sm:text-sm"
                />
              </div>

              {/* Mesafe */}
              <div>
                <label className="block text-[10px] sm:text-xs text-text-secondary mb-1">Mesafe (km)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={newOrder.distance}
                  onChange={(e) => handleOrderChange("distance", parseFloat(e.target.value) || 0)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-card border border-border rounded-lg text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Kazanç */}
            <div>
              <label className="block text-[10px] sm:text-xs text-text-secondary mb-1">Kazanç (₺)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newOrder.earnings}
                onChange={(e) => handleOrderChange("earnings", parseFloat(e.target.value) || 0)}
                disabled={newOrder.platform !== "diğer"}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-card border border-border rounded-lg text-xs sm:text-sm disabled:opacity-50"
              />
              {newOrder.platform !== "diğer" && (
                <p className="text-[10px] sm:text-xs text-text-muted mt-1">Tarife bazlı otomatik hesaplandı</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddOrder}
                className="flex-1 bg-primary text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-primary-hover text-xs sm:text-sm"
              >
                Ekle
              </button>
              <button
                type="button"
                onClick={() => setShowAddOrder(false)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-text-secondary hover:bg-card rounded-lg text-xs sm:text-sm"
              >
                İptal
              </button>
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <p className="text-[10px] sm:text-xs text-text-muted text-center py-4">Henüz slot eklenmedi</p>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between bg-background border border-border rounded-lg p-2 sm:p-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                    <span className="text-sm sm:text-base">{PLATFORM_TARIFFS[order.platform]?.icon}</span>
                    <span className="text-xs sm:text-sm font-medium truncate">
                      {PLATFORM_TARIFFS[order.platform]?.name}
                    </span>
                    <span className="text-[10px] sm:text-xs text-text-muted flex-shrink-0">× {order.count}</span>
                  </div>
                  <div className="text-[10px] sm:text-xs text-text-secondary">
                    {order.distance > 0 && `${order.distance} km • `}
                    ₺{order.earnings.toFixed(2)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeOrder(order.id)}
                  className="p-1.5 sm:p-2 text-red-400 hover:bg-red-400/10 rounded-lg flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Giderler */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">💸 Giderler</h3>
          <button
            type="button"
            onClick={() => setShowAddExpense(!showAddExpense)}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Ekle
          </button>
        </div>

        {showAddExpense && (
          <div className="bg-background border border-border rounded-lg p-3 sm:p-4 mb-3 space-y-3">
            {/* Kategori */}
            <div>
              <label className="block text-[10px] sm:text-xs text-text-secondary mb-1">Kategori</label>
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-card border border-border rounded-lg text-xs sm:text-sm text-text-primary [&>option]:bg-card [&>option]:text-text-primary"
              >
                {Object.entries(EXPENSE_CATEGORIES).map(([key, data]) => (
                  <option key={key} value={key}>
                    {data.icon} {data.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tutar */}
            <div>
              <label className="block text-[10px] sm:text-xs text-text-secondary mb-1">Tutar (₺)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newExpense.amount}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-card border border-border rounded-lg text-xs sm:text-sm"
              />
            </div>

            {/* Not */}
            <div>
              <label className="block text-[10px] sm:text-xs text-text-secondary mb-1">Not (Opsiyonel)</label>
              <input
                type="text"
                maxLength={200}
                value={newExpense.note}
                onChange={(e) => setNewExpense({ ...newExpense, note: e.target.value })}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-card border border-border rounded-lg text-xs sm:text-sm"
                placeholder="Ör: Shell, Kadıköy"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddExpense}
                className="flex-1 bg-primary text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-primary-hover text-xs sm:text-sm"
              >
                Ekle
              </button>
              <button
                type="button"
                onClick={() => setShowAddExpense(false)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-text-secondary hover:bg-card rounded-lg text-xs sm:text-sm"
              >
                İptal
              </button>
            </div>
          </div>
        )}

        {expenses.length === 0 ? (
          <p className="text-[10px] sm:text-xs text-text-muted text-center py-4">Henüz gider eklenmedi</p>
        ) : (
          <div className="space-y-2">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between bg-background border border-border rounded-lg p-2 sm:p-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                    <span className="text-sm sm:text-base">{EXPENSE_CATEGORIES[expense.category]?.icon}</span>
                    <span className="text-xs sm:text-sm font-medium truncate">
                      {EXPENSE_CATEGORIES[expense.category]?.name}
                    </span>
                  </div>
                  <div className="text-[10px] sm:text-xs text-text-secondary truncate">
                    ₺{expense.amount.toFixed(2)}
                    {expense.note && ` • ${expense.note}`}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeExpense(expense.id)}
                  className="p-1.5 sm:p-2 text-red-400 hover:bg-red-400/10 rounded-lg flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
