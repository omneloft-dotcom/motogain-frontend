import React, { useState, useEffect } from "react";
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, Wind, CloudFog } from "lucide-react";
import { useAuth } from "../../context/AuthProvider";
import { getWeather } from "../../api/weatherApi";

const WeatherBanner = () => {
  const { user } = useAuth();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Kullanıcının şehir bilgisini al
  const userCity = user?.profile?.location?.city || user?.location?.city;

  useEffect(() => {
    // Şehir bilgisi yoksa banner'ı gösterme
    if (!userCity) {
      setLoading(false);
      return;
    }

    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(false);
        const response = await getWeather(userCity);

        if (response.success) {
          setWeather(response.data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("[WeatherBanner] Failed to fetch weather:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [userCity]);

  // Hava durumu ikonunu seç (Open-Meteo icon mapping)
  const getWeatherIcon = (icon) => {
    const iconProps = "w-5 h-5";

    switch (icon) {
      case "clear":
        return <Sun className={`${iconProps} text-yellow-400`} />;
      case "partly-cloudy":
        return <Cloud className={`${iconProps} text-gray-300`} />;
      case "cloudy":
        return <Cloud className={`${iconProps} text-gray-400`} />;
      case "rain":
        return <CloudRain className={`${iconProps} text-blue-400`} />;
      case "drizzle":
        return <CloudDrizzle className={`${iconProps} text-blue-300`} />;
      case "thunderstorm":
        return <CloudLightning className={`${iconProps} text-yellow-500`} />;
      case "snow":
        return <CloudSnow className={`${iconProps} text-blue-200`} />;
      case "fog":
        return <CloudFog className={`${iconProps} text-gray-300`} />;
      default:
        return <Sun className={`${iconProps} text-yellow-400`} />;
    }
  };

  // Şehir bilgisi yoksa banner'ı gösterme
  if (!userCity) {
    return null;
  }

  // Hata durumunda banner'ı gösterme (sessizce)
  if (error) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 px-4 py-3 bg-card border border-border/60 rounded-lg mb-6 animate-pulse">
        <div className="w-5 h-5 bg-gray-700 rounded-full"></div>
        <div className="h-4 bg-gray-700 rounded w-32"></div>
        <div className="h-4 bg-gray-700 rounded w-12"></div>
        <div className="h-4 bg-gray-700 rounded w-24"></div>
      </div>
    );
  }

  // Hava durumu verisi yoksa gösterme
  if (!weather) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 px-4 py-3 bg-card border border-border/60 rounded-lg mb-6 overflow-x-auto">
      {/* İkon */}
      <div className="flex-shrink-0">
        {getWeatherIcon(weather.icon)}
      </div>

      {/* Şehir */}
      <span className="text-sm sm:text-base font-medium text-text-primary whitespace-nowrap">
        {weather.city}
      </span>

      {/* Ayraç */}
      <span className="text-text-muted hidden sm:inline">•</span>

      {/* Sıcaklık */}
      <span className="text-sm sm:text-base font-semibold text-primary whitespace-nowrap">
        {weather.temperature}°C
      </span>

      {/* Ayraç */}
      <span className="text-text-muted hidden sm:inline">•</span>

      {/* Açıklama */}
      <span className="text-sm text-text-secondary whitespace-nowrap capitalize">
        {weather.description}
      </span>
    </div>
  );
};

export default WeatherBanner;
