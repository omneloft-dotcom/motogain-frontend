/**
 * Error Handler Utility
 * Normalizes backend errors and provides user-friendly messages
 */

/**
 * Get user-friendly error message from API error
 * @param {Error} error - Error object from API call
 * @returns {string} - User-friendly error message in Turkish
 */
export const getErrorMessage = (error) => {
  // Network error (API unreachable)
  if (!error.response) {
    if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
      return "Bağlantı sorunu. İnternet bağlantınızı kontrol edin.";
    }
    return "Sunucuya ulaşılamıyor. Lütfen daha sonra tekrar deneyin.";
  }

  const status = error.response?.status;
  const message = error.response?.data?.message;

  // Use backend message if available and user-friendly
  if (message && typeof message === "string") {
    return message;
  }

  // Default messages based on status code
  switch (status) {
    case 400:
      return "Geçersiz istek. Lütfen girdiğiniz bilgileri kontrol edin.";
    case 401:
      return "Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.";
    case 403:
      return "Bu işlem için yetkiniz yok.";
    case 404:
      return "İstenen kaynak bulunamadı.";
    case 409:
      return "Bu işlem çakışma oluşturuyor. Lütfen tekrar deneyin.";
    case 429:
      return "Çok fazla istek gönderildi. Lütfen biraz bekleyin.";
    case 500:
      return "Sunucu hatası. Lütfen daha sonra tekrar deneyin.";
    case 503:
      return "Sunucu şu anda kullanılamıyor. Lütfen daha sonra deneyin.";
    default:
      return "Bir hata oluştu. Lütfen tekrar deneyin.";
  }
};

/**
 * Check if error is network/connectivity issue
 * @param {Error} error
 * @returns {boolean}
 */
export const isNetworkError = (error) => {
  return (
    !error.response &&
    (error.message === "Network Error" || error.code === "ERR_NETWORK")
  );
};

/**
 * Check if error is authentication issue
 * @param {Error} error
 * @returns {boolean}
 */
export const isAuthError = (error) => {
  return error.response?.status === 401;
};

/**
 * Check if error is authorization issue
 * @param {Error} error
 * @returns {boolean}
 */
export const isAuthorizationError = (error) => {
  return error.response?.status === 403;
};

/**
 * Log error to console in development only
 * @param {string} context - Where the error occurred
 * @param {Error} error - Error object
 */
export const logError = (context, error) => {
  if (process.env.NODE_ENV === "development") {
    console.error(`[${context}]`, error);
  }
};
