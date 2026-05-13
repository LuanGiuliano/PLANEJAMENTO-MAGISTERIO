// vite.config.ts
// Desabilita SSR completamente — serve como SPA pura no Vercel/Render.
// É a solução mais simples e estável para este caso de uso (dashboard C-Level).
// O SSR não agrega valor aqui pois os dados vêm de CSV via fetch no cliente.

import { defineConfig } from '@lovable.dev/vite-tanstack-config'

export default defineConfig({
  // Desativa Cloudflare (incompatível com Vercel)
  cloudflare: false,

  // Passa configuração direta para o TanStack Start
  tanstackStart: {
    // Desabilita o bundle SSR — só gera dist/client/
    ssr: false,
  },

  vite: {
    // --- ADICIONE ESTE BLOCO AQUI PARA O RENDER ---
    server: {
      allowedHosts: [
        "planejamento-magisterio.onrender.com"
      ],
    },
    // ----------------------------------------------
    
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