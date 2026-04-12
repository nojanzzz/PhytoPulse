import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Explicitly expose the key so it works even if .env placement is tricky
      'import.meta.env.VITE_OPENWEATHER_API_KEY': JSON.stringify(
        env.VITE_OPENWEATHER_API_KEY || ''
      ),
    },
  };
});
