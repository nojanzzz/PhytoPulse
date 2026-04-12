const LAT = -6.5971;
const LON = 106.806;

function getApiKey() {
  // Vite exposes env vars at build time via import.meta.env
  // If still undefined, the .env file is not in the correct location
  const key = import.meta.env.VITE_OPENWEATHER_API_KEY;
  return key && key !== 'your_api_key_here' ? key : null;
}

export async function fetchWeather() {
  const API_KEY = getApiKey();

  if (!API_KEY) {
    console.warn('[PhytoPulse] No API key found — using demo weather. Make sure .env is in the same folder as vite.config.js');
    return generateDemoWeather();
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`OWM HTTP ${res.status}`);
    const data = await res.json();

    const cloudCover = data.clouds?.all ?? 30;
    const hour = new Date().getHours();

    const result = {
      temperature: parseFloat(data.main.temp.toFixed(1)),
      humidity: data.main.humidity,
      rainfall: parseFloat((data.rain?.['1h'] ?? 0).toFixed(1)),
      cloudCover,
      uv: estimateUV(cloudCover, hour),
    };

    console.log('[PhytoPulse] Live weather from OWM:', result);
    return result;
  } catch (err) {
    console.warn('[PhytoPulse] OWM fetch failed:', err.message);
    return generateDemoWeather();
  }
}

function estimateUV(cloudCover, hour) {
  const maxUV = 10;
  const dayArc = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI));
  const cloudFactor = 1 - (cloudCover / 100) * 0.75;
  return parseFloat((maxUV * dayArc * cloudFactor).toFixed(1));
}

function generateDemoWeather() {
  const hour = new Date().getHours();
  const t = hour + new Date().getMinutes() / 60;
  const baseTemp = 26 + 6 * Math.sin(((t - 6) / 14) * Math.PI);
  const temperature = parseFloat((baseTemp + (Math.random() - 0.5) * 1.5).toFixed(1));
  const humidity = Math.round(Math.max(45, Math.min(95, 80 - ((temperature - 24) / 8) * 25 + (Math.random() - 0.5) * 8)));
  const isAfternoon = t >= 13 && t <= 16;
  const rainfall = isAfternoon && Math.random() < 0.25 ? parseFloat((Math.random() * 8).toFixed(1)) : 0;
  const cloudCover = Math.round(Math.max(0, Math.min(100, (isAfternoon ? 60 : 25) + (Math.random() - 0.5) * 30)));
  return { temperature, humidity, rainfall, cloudCover, uv: estimateUV(cloudCover, hour) };
}
