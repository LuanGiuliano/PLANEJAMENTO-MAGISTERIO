// vite.config.ts
// Fix: manualChunks só se aplica ao ambiente client (não ao SSR)
// O ambiente SSR trata react/react-dom como externos — não podem ir no manualChunks

import { defineConfig } from '@lovable.dev/vite-tanstack-config'

export default defineConfig({
  // Desativa o @cloudflare/vite-plugin para deploy no Vercel
  cloudflare: false,

  vite: {
    build: {
      chunkSizeWarningLimit: 1000,
    },

    environments: {
      // Configuração de chunks APENAS para o ambiente client
      client: {
        build: {
          rollupOptions: {
            output: {
              manualChunks: {
                // 'vendor-react' REMOVIDO — estava vazio e causava o erro no SSR
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