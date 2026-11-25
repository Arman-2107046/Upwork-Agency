/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string
  readonly VITE_CONTACT_EMAIL?: string
  readonly VITE_UPWORK_URL?: string
  readonly VITE_FORM_ENDPOINT?: string
  readonly VITE_FORM_ACCESS_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
