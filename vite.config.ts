// vite.config.ts — SPA estática para Vercel
import { defineConfig } from '@lovable.dev/vite-tanstack-config'

export default defineConfig({
  cloudflare: false,

  tanstackStart: {
    ssr: false,
  },

  vite: {
    build: {
      chunkSizeWarningLimit: 1000,
    },
    environments: {
      client: {
        build: {
          rollupOptions: {
            output: {
              manualChunks: {
                'vendor-router':   ['@tanstack/react-router'],
                'vendor-recharts': ['recharts'],
                'vendor-motion':   ['framer-motion'],
                'vendor-ui': [
                  '@radix-ui/react-dialog',
                  '@radix-ui/react-dropdown-menu',
                  '@radix-ui/react-select',
                  '@radix-ui/react-tabs',
                  '@radix-ui/react-tooltip',
                ],
              },
            },
          },
        },
      },
    },
  },
})