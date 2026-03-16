import axiosClient from "./axiosClient";

/**
 * Şehir adına göre geocoding bilgisi getirir (Open-Meteo)
 * Requires authentication - returns 401 if not authenticated
 * @param {string} city - Şehir adı (örn: "Istanbul", "Ankara")
 * @returns {Promise<Object>} { ok: boolean, data: [{name, country, admin1, latitude, longitude, timezone}], cached: boolean }
 */
export const getGeocode = async (city) => {
  try {
    // Note: Uses axiosClient which auto-attaches auth token from localStorage
    const response = await axiosClient.get("/weather/geocode", {
      params: { q: city },
    });
    return response.data;
  } catch (error) {
    // Suppress console error for 401 (unauthenticated user)
    if (error.response?.status !== 401) {
      console.error(`[Weather API] Error fetching geocode for ${city}:`, error.message);
    }
    throw error;
  }
};

/**
 * Koordinatlara göre hava durumu tahmini getirir (Open-Meteo)
 * Requires authentication - returns 401 if not authenticated
 * @param {number} lat - Enlem (-90 ile 90 arası)
 * @param {number} lon - Boylam (-180 ile 180 arası)
 * @param {string} tz - Timezone (opsiyonel, varsayılan: "Europe/Istanbul")
 * @returns {Promise<Object>} { ok: boolean, data: {current, daily, timezone}, cached: boolean }
 */
export const getForecast = async (lat, lon, tz = "Europe/Istanbul") => {
  try {
    // Note: Uses axiosClient which auto-attaches auth token from localStorage
    const response = await axiosClient.get("/weather/forecast", {
      params: { lat, lon, tz },
    });
    return response.data;
  } catch (error) {
    // Suppress console error for 401 (unauthenticated user)
    if (error.response?.status !== 401) {
      console.error(`[Weather API] Error fetching forecast for ${lat},${lon}:`, error.message);
    }
    throw error;
  }
};

/**
 * Şehir adına göre hava durumu bilgisi getirir (2-step: geocode + forecast)
 * @param {string} city - Şehir adı (örn: "Istanbul", "Ankara")
 * @returns {Promise<Object>} { success: boolean, data: {city, country, temperature, description, icon, ...} }
 */
export const getWeather = async (city) => {
  try {
    // Step 1: Geocode - şehir adını lat/lon'a çevir
    const geocodeResponse = await getGeocode(city);

    if (!geocodeResponse.ok || !geocodeResponse.data || geocodeResponse.data.length === 0) {
      return {
        success: false,
        error: "Şehir bulunamadı",
      };
    }

    // İlk sonucu al
    const location = geocodeResponse.data[0];

    // Step 2: Forecast - lat/lon ile hava durumu al
    const forecastResponse = await getForecast(
      location.latitude,
      location.longitude,
      location.timezone
    );

    if (!forecastResponse.ok || !forecastResponse.data) {
      return {
        success: false,
        error: "Hava durumu bilgisi alınamadı",
      };
    }

    const { current, daily } = forecastResponse.data;

    // WeatherBanner için uyumlu format
    return {
      success: true,
      data: {
        city: location.name,
        country: location.country,
        temperature: current.temperature,
        feelsLike: current.feelsLike,
        description: current.description,
        icon: current.icon,
        main: current.icon, // Icon mapping için
        precipitation: current.precipitation,
        windSpeed: current.windSpeed,
        daily: daily, // 7 günlük tahmin
        cached: geocodeResponse.cached || forecastResponse.cached,
      },
    };
  } catch (error) {
    console.error(`[Weather API] Error in getWeather for ${city}:`, error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default {
  getWeather,
  getGeocode,
  getForecast,
};
