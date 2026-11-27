import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

/**
 * The site is served by the Laravel backend in production (it fills index.html with the page's
 * meta tags and the CMS content). During `npm run dev`, these paths are proxied to the backend.
 */
const backendPaths = ['/api', '/storage', '/sitemap.xml', '/robots.txt']

/** One .env at the repository root serves docker compose and the dev server. */
const envDir = fileURLToPath(new URL('..', import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, envDir, 'VITE_')
  const backend = env.VITE_BACKEND_URL || 'http://localhost:8080'

  return {
    envDir,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      proxy: Object.fromEntries(
        backendPaths.map((path) => [path, { target: backend, changeOrigin: true }]),
      ),
    },
    build: {
      target: 'es2022',
      cssCodeSplit: true,
    },
  }
})
