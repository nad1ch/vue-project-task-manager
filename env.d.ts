/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Fraction (0..1) of mock requests to fail, for exercising error states. Default 0. */
  readonly VITE_MOCK_FAULT_RATE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
