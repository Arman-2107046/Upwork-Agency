/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Dev server only: where /api and /storage are proxied (see vite.config.ts). */
  readonly VITE_BACKEND_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
