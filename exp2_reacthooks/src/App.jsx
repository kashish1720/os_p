import React, { useState, useEffect, createContext, useContext, useCallback, useReducer, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Error Boundary Definition
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="weather-card p-4 text-center text-red-600 dark:text-red-400">
          <h2>Oops! Kuch galat ho gaya!</h2>
          <p>Error: {this.state.error.message}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="ml-2 px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ----------------------------- Context for Temperature Unit ---------------------------- */
const UnitContext = createContext(null);

function useUnit() {
  const ctx = useContext(UnitContext);
  if (!ctx) throw new Error('useUnit must be used inside UnitProvider');
  return ctx;
}

/* ----------------------------- Custom Hooks ---------------------------- */
function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch (e) {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {}
  }, [key, state]);

  return [state, setState];
}

function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function useFetchWeather(city, unit = 'celsius') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const controllerRef = useRef(null);
  const fetchTimeoutRef = useRef(null);

  const fetchWeather = useCallback(async () => {
    if (!city || city.trim().length < 2) {
      setLoading(false);
      return;
    }
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const geoRes = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)}&key=2ad4428a089e44b8b498954d54723da1&limit=1&language=en`,
        { signal: controller.signal }
      );
      if (!geoRes.ok) throw new Error(`Geocoding failed with status ${geoRes.status}`);
      const geoJson = await geoRes.json();
      if (!geoJson.results || geoJson.results.length === 0) {
        setError('The entered city was not found. Please try a different city.');
        throw new Error('City not found');
      }
      const { lat, lng } = geoJson.results[0].geometry;

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m&current_weather=true&temperature_unit=${unit}&forecast_hours=4`,
        { signal: controller.signal }
      );
      if (!weatherRes.ok) throw new Error(`Weather API failed with status ${weatherRes.status}`);
      const weatherJson = await weatherRes.json();
      setData({
        current: { temperature: weatherJson.current_weather?.temperature, unit: weatherJson.current_weather_units?.temperature || unit },
        forecast: weatherJson.hourly?.temperature_2m?.slice(0, 4) || [],
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        if (!error || error !== 'The entered city was not found. Please try a different city.') setError(err.message);
      }
    } finally {
      setLoading(false);
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  }, [city, unit]);

  useEffect(() => {
    if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    fetchTimeoutRef.current = setTimeout(() => fetchWeather(), 2000);
    const interval = setInterval(() => fetchWeather(), 15 * 60 * 1000);
    return () => {
      if (controllerRef.current) controllerRef.current.abort();
      clearInterval(interval);
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    };
  }, [fetchWeather]);

  return { data, loading, error, refetch: fetchWeather };
}
/* ----------------------------- Components ---------------------------- */
function UnitProvider({ children }) {
  const [unit, setUnit] = useLocalStorage('weather_unit', 'celsius');
  const showAlert = (temp) => temp > 30 && alert(`Arre bhai, garmi zyada hai! ${temp}°C ho gaya!`);
  return <UnitContext.Provider value={{ unit, setUnit, showAlert }}>{children}</UnitContext.Provider>;
}

function Header({ city, setCity }) {
  const { unit, setUnit } = useUnit();
  const [themeDark, setThemeDark] = useLocalStorage('theme_dark', false);

  useEffect(() => {
    if (themeDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.backgroundColor = '#1f2937'; // Dark gray background
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.backgroundColor = '#ffffff'; // White background
    }
  }, [themeDark]);

  return (
    <header className="mb-4 p-4" style={{ backgroundColor: themeDark ? '#1f2937' : '#ffffff' }}>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-800">Weather Widget</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">React Hooks Demo</p>
      <div className="mt-2 flex gap-2">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city (e.g., Berlin)"
          className="flex-1 p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
        >
          <option value="celsius">°C</option>
          <option value="fahrenheit">°F</option>
        </select>
        <button
          onClick={() => setThemeDark((t) => !t)}
          className="px-3 py-2 rounded border bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
        >
          {themeDark ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>
    </header>
  );
}

function WeatherDisplay({ city }) {
  const { unit, showAlert } = useUnit();
  const { data, loading, error, refetch } = useFetchWeather(city, unit);
  const themeDark = useLocalStorage('theme_dark', false)[0];
  const canvasRef = useRef(null);

  // useReducer for animation state
  const initialState = { isAnimating: false, frame: 0 };
  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'START_ANIMATION':
        return { ...state, isAnimating: true };
      case 'UPDATE_FRAME':
        return { ...state, frame: (state.frame + 1) % 60 };
      case 'STOP_ANIMATION':
        return { ...state, isAnimating: false, frame: 0 };
      default:
        return state;
    }
  }, initialState);

  useEffect(() => {
    if (data?.forecast && data.forecast.length > 0) {
      dispatch({ type: 'START_ANIMATION' });
      const animationId = setInterval(() => dispatch({ type: 'UPDATE_FRAME' }), 1000 / 60);
      return () => {
        clearInterval(animationId);
        dispatch({ type: 'STOP_ANIMATION' });
      };
    }
  }, [data]);

  useEffect(() => {
    if (data?.current?.temperature) {
      showAlert(data.current.temperature);
    }
  }, [data, showAlert]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data?.forecast || !state.isAnimating) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('Canvas context not found! Skipping draw.');
      return;
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!data.forecast || data.forecast.length === 0) {
        ctx.fillStyle = themeDark ? '#ffffff' : '#000000';
        ctx.fillText('No forecast data available', 10, 20);
        return;
      }

      ctx.beginPath();
      ctx.strokeStyle = data.current.temperature > 30 ? '#ff4444' : '#44ff44';
      ctx.lineWidth = 2;

      const step = canvas.width / (data.forecast.length - 1);
      const maxTemp = Math.max(...data.forecast);
      const minTemp = Math.min(...data.forecast);
      const range = maxTemp - minTemp || 1;

      data.forecast.forEach((temp, index) => {
        const x = index * step;
        const y = canvas.height - ((temp - minTemp) / range) * canvas.height * 0.8;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      const progress = state.frame / 60;
      const currentX = progress * canvas.width;
      ctx.fillStyle = themeDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(currentX - 2, 0, 4, canvas.height);
    }

    // Initial draw
    draw();

    let animationFrameId;
    const animate = () => {
      draw();
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [data, state.frame, state.isAnimating, themeDark]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="weather-card p-4 text-center"
        >
          <div className="animate-pulse h-6 w-32 mx-auto bg-gray-200 dark:bg-gray-700 rounded" />
        </motion.div>
      )}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="weather-card p-4 text-center text-red-600 dark:text-red-400"
        >
          {error}
          <button
            onClick={refetch}
            className="ml-2 px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
          >
            Retry
          </button>
        </motion.div>
      )}
      {data && !loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="weather-card p-4 text-center"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Weather in {city || 'Berlin'}
          </h2>
          <p className="text-3xl text-gray-900 dark:text-white">
            {data.current.temperature} {unit === 'celsius' ? '°C' : '°F'}
          </p>
          <div className="mt-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">4-Hour Forecast</h3>
            <canvas ref={canvasRef} width="400" height="200"></canvas>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
/* ----------------------------- Main App ---------------------------- */
export default function App() {
  const [city, setCity] = useLocalStorage('weather_city', '');
  const debouncedCity = useDebounce(city);

  return (
    <ErrorBoundary>
      <UnitProvider>
        <div className="min-h-screen">
          <Header city={city} setCity={setCity} />
          {debouncedCity && <WeatherDisplay city={debouncedCity} />}
        </div>
      </UnitProvider>
    </ErrorBoundary>
  );
}