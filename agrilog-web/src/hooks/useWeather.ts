import { useState, useCallback } from 'react';

const OPENWEATHER_BASE = 'https://api.openweathermap.org/data/2.5/weather';

export interface WeatherInfo {
  temp: number;        // °C
  feelsLike: number;   // °C
  humidity: number;    // %
  windSpeed: number;   // m/s
  description: string; // tiếng Việt (vi locale)
  icon: string;        // OpenWeather icon code, e.g. "10d"
  iconUrl: string;
  cityName: string;
}

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseWeatherReturn {
  weather: WeatherInfo | null;
  weatherStatus: WeatherStatus;
  weatherError: string | null;
  fetchWeather: (lat: number, lon: number) => Promise<WeatherInfo | null>;
}

export function useWeather(): UseWeatherReturn {
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [weatherStatus, setWeatherStatus] = useState<WeatherStatus>('idle');
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const fetchWeather = useCallback(async (
    lat: number,
    lon: number,
  ): Promise<WeatherInfo | null> => {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    if (!apiKey) {
      setWeatherError('Chưa cấu hình VITE_OPENWEATHER_API_KEY');
      setWeatherStatus('error');
      return null;
    }

    setWeatherStatus('loading');
    setWeatherError(null);

    try {
      const url = `${OPENWEATHER_BASE}?lat=${lat}&lon=${lon}&units=metric&lang=vi&appid=${apiKey}`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`OpenWeather API lỗi ${res.status}`);
      }

      const data = await res.json();

      const info: WeatherInfo = {
        temp: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        windSpeed: parseFloat((data.wind.speed ?? 0).toFixed(1)),
        description:
          data.weather?.[0]?.description ?? 'Không rõ',
        icon: data.weather?.[0]?.icon ?? '01d',
        iconUrl: `https://openweathermap.org/img/wn/${data.weather?.[0]?.icon ?? '01d'}@2x.png`,
        cityName: data.name ?? '',
      };

      setWeather(info);
      setWeatherStatus('success');
      return info;
    } catch (err: any) {
      setWeatherError(err?.message || 'Không thể lấy dữ liệu thời tiết');
      setWeatherStatus('error');
      return null;
    }
  }, []);

  return { weather, weatherStatus, weatherError, fetchWeather };
}
