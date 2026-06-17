import { MOCK_LATENCY_MAX_MS, MOCK_LATENCY_MIN_MS } from '@/constants';

const faultRate = Number(import.meta.env.VITE_MOCK_FAULT_RATE ?? '0');

export function randomLatency(): number {
  return MOCK_LATENCY_MIN_MS + Math.random() * (MOCK_LATENCY_MAX_MS - MOCK_LATENCY_MIN_MS);
}

export function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, randomLatency()));
}

/** When enabled via VITE_MOCK_FAULT_RATE, randomly force a request to fail. */
export function shouldFault(): boolean {
  return faultRate > 0 && Math.random() < faultRate;
}
