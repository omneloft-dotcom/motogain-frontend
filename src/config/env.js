/**
 * Production-Safe Environment Configuration
 *
 * Centralizes all environment variable access with validation
 * Prevents localhost URLs from leaking into production builds
 */

const isDevelopment = import.meta.env.MODE === 'development';
const isProduction = import.meta.env.MODE === 'production';

// Validate and sanitize API URL
const getApiUrl = () => {
  // 🔒 HARD-LOCK: If running on localhost, ALWAYS use local backend
  // This prevents accidental production API calls during local development
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.log('🔒 [HARD-LOCK] Running on localhost - forcing local backend');
    return 'http://localhost:5000';
  }

  const rawUrl = import.meta.env.VITE_API_URL;

  // Production MUST have API URL configured
  if (isProduction && (!rawUrl || rawUrl.includes('localhost'))) {
    console.error('⚠️ PRODUCTION BUILD ERROR: VITE_API_URL not configured or contains localhost');
    console.error('Build with: VITE_API_URL=https://api.usecordy.com npm run build');
    // Fail gracefully in production (use production URL as fallback)
    return 'https://api.usecordy.com';
  }

  // Validate URL format (prevent malformed URLs like "https://https://...")
  if (rawUrl) {
    const normalized = rawUrl.trim();

    // Check for double protocol
    if (normalized.match(/^https?:\/\/https?:\/\//)) {
      console.error('⚠️ Malformed VITE_API_URL detected (double protocol):', normalized);
      // Fix it by removing duplicate protocol
      return normalized.replace(/^https?:\/\/(https?:\/\/)/, '$1');
    }

    // Remove trailing /api or /api/ if present (will be added by axios client)
    return normalized.replace(/\/api\/?$/, '');
  }

  // Development fallback
  return 'http://localhost:5000';
};

// Get socket URL from API URL
const getSocketUrl = () => {
  const apiUrl = getApiUrl();

  // Socket URL is same as API base (without /api path)
  // API: https://api.usecordy.com/api/v1 → Socket: https://api.usecordy.com
  return apiUrl;
};

// Get Google Client ID
const getGoogleClientId = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Return null if not configured (Google login will be hidden)
  if (!clientId || clientId.trim() === '' || clientId.includes('your-google-client-id')) {
    return null;
  }

  return clientId.trim();
};

// Export config
export const config = {
  apiUrl: getApiUrl(),
  socketUrl: getSocketUrl(),
  googleClientId: getGoogleClientId(),
  isDevelopment,
  isProduction,
};

// Log config with hostname for debugging
const hostname = typeof window !== 'undefined' ? window.location.hostname : 'unknown';
const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

console.log('🚀 [CORDY] API Routing Config:', {
  hostname: hostname,
  isLocalhost: isLocalhost,
  mode: import.meta.env.MODE,
  apiUrl: config.apiUrl,
  socketUrl: config.socketUrl,
  googleClientId: config.googleClientId ? '***configured***' : 'not configured',
});

// Additional warning if on localhost but somehow using production API (should never happen now)
if (isLocalhost && config.apiUrl.includes('api.usecordy.com')) {
  console.error('❌ [CRITICAL] Running on localhost but using production API! This should not happen.');
  console.error('   Please report this bug.');
}

// Validate in production
if (isProduction) {
  if (config.apiUrl.includes('localhost')) {
    console.error('❌ PRODUCTION BUILD WARNING: API URL still points to localhost!');
  }
  if (!config.googleClientId) {
    console.warn('⚠️ Google Client ID not configured - Google Sign-In will be unavailable');
  }
}
