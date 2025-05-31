import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: env.PORT ? parseInt(env.PORT) : 5173,
      allowedHosts: ['legal-assist-frontend.onrender.com'],
    },
  };
});
