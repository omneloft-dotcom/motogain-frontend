/**
 * Courier Web Compatibility Adapter
 *
 * Safe field normalization between web form data and backend CourierEntry.
 * Handles both simple mode (direct income/expense) and calculator mode (orders/expenses arrays).
 *
 * CRITICAL: This is an app-local adapter to avoid Vite/Node cross-runtime issues.
 */

/**
 * Convert web simple mode form data to backend CourierEntry format
 *
 * Simple mode fields:
 * - income: Number (direct entry)
 * - expense: Number (direct entry)
 * - deliveryCount: Number (direct entry)
 * - workHours: Number (0-24)
 * - note: String
 *
 * Backend receives these as-is (no orders/expenses arrays).
 */
export function webToBackendSimple(formData) {
  return {
    date: formData.date,
    income: parseFloat(formData.income) || 0,
    expense: parseFloat(formData.expense) || 0,
    deliveryCount: parseInt(formData.deliveryCount) || 0,
    workHours: parseFloat(formData.workHours) || 0,
    note: formData.note || null
  };
}

/**
 * Convert web calculator mode form data to backend CourierEntry format
 *
 * Calculator mode fields:
 * - orders: Array of { platform, orderType, count, earnings, distance }
 * - expenses: Array of { category, amount, note }
 * - workHours: Number (0-24)
 * - note: String
 *
 * Backend will auto-calculate income, expense, deliveryCount via pre-save hook.
 */
export function webToBackendCalculator(formData) {
  return {
    date: formData.date,
    orders: formData.orders || [],
    expenses: formData.expenses || [],
    workHours: parseFloat(formData.workHours) || 0,
    note: formData.note || null
  };
}

/**
 * Determine if form data should use calculator mode
 *
 * Calculator mode is active if:
 * - orders array exists and has items, OR
 * - expenses array exists and has items
 */
export function isCalculatorMode(formData) {
  return (
    (formData.orders && formData.orders.length > 0) ||
    (formData.expenses && formData.expenses.length > 0)
  );
}

/**
 * Convert web form data to backend format (auto-detects mode)
 */
export function webToBackend(formData) {
  if (isCalculatorMode(formData)) {
    return webToBackendCalculator(formData);
  }
  return webToBackendSimple(formData);
}

/**
 * Validate web form data
 */
export function validateWebEntry(formData, mode = 'simple') {
  const errors = {};

  if (!formData.date || !/^\d{4}-\d{2}-\d{2}$/.test(formData.date)) {
    errors.date = 'Geçersiz tarih formatı';
  }

  if (mode === 'simple') {
    const income = parseFloat(formData.income) || 0;
    const expense = parseFloat(formData.expense) || 0;

    if (income < 0) {
      errors.income = 'Gelir negatif olamaz';
    }

    if (expense < 0) {
      errors.expense = 'Gider negatif olamaz';
    }

    if (formData.deliveryCount && parseInt(formData.deliveryCount) < 0) {
      errors.deliveryCount = 'Teslimat sayısı negatif olamaz';
    }
  }

  if (mode === 'calculator') {
    if (!formData.orders || formData.orders.length === 0) {
      errors.orders = 'En az bir sipariş ekleyin';
    }
  }

  const workHours = parseFloat(formData.workHours) || 0;
  if (workHours < 0 || workHours > 24) {
    errors.workHours = 'Çalışma saati 0-24 arası olmalı';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Normalize backend response for web display
 *
 * Currently a passthrough, but provides extension point
 * for future backend schema changes.
 */
export function backendToWeb(backendEntry) {
  return backendEntry;
}
