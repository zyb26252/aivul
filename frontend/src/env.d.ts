/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_API_TIMEOUT?: string
  readonly VITE_ENABLE_CACHE?: string
  readonly VITE_MAX_RETRIES?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 