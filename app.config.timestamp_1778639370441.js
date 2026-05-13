// app.config.ts
import { defineConfig } from "@tanstack/react-start/config";
import viteTsconfigPaths from "vite-tsconfig-paths";
var app_config_default = defineConfig({
  // Aponta para os entry points que já existem no seu projeto
  routers: {
    client: {
      entry: "./src/routes/start.ts"
    },
    server: {
      entry: "./src/routes/server.ts"
    }
  },
  // Preset Vercel — gera output em .output/public
  // Remove necessidade de @cloudflare/vite-plugin
  server: {
    preset: "vercel"
  },
  vite: {
    plugins: [
      viteTsconfigPaths({ projects: ["./tsconfig.json"] })
    ],
    build: {
      chunkSizeWarningLimit: 1e3,
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-react": ["react", "react-dom"],
            "vendor-router": ["@tanstack/react-router"],
            "vendor-recharts": ["recharts"],
            "vendor-motion": ["framer-motion"],
            "vendor-ui": [
              "@radix-ui/react-dialog",
              "@radix-ui/react-dropdown-menu",
              "@radix-ui/react-select",
              "@radix-ui/react-tabs",
              "@radix-ui/react-tooltip"
            ]
          }
        }
      }
    }
  }
});
export {
  app_config_default as default
};
