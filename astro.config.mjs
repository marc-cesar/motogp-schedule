import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  vite: {
    server: {
      // In `astro dev`, stand in for the Netlify function in netlify/functions/motogp.mts.
      proxy: {
        '/api/motogp': {
          target: 'https://api.motogp.pulselive.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/motogp/, '/motogp/v1'),
          configure: (proxy) => {
            // The API rejects requests carrying a foreign Origin header.
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.removeHeader('origin');
              proxyReq.removeHeader('referer');
            });
          },
        },
      },
    },
  },
});
