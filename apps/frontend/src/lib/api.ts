export type AnalyticRecord = {
  id: string;
  event_time: string;
  category: string;
  metric_value: number;
  source: string;
  status: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

export type AnalyticsSummary = {
  period: string;
  category: string;
  total_records: number;
  average_metric: number;
  total_metric: number;
};

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://127.0.0.1:8000/api/v1";

const fallbackRecords: AnalyticRecord[] = [
  {
    id: "sample-1",
    event_time: new Date().toISOString(),
    category: "sales",
    metric_value: 120.4,
    source: "fallback",
    status: "ok",
    notes: "Dados de fallback para ambiente sem backend.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "sample-2",
    event_time: new Date().toISOString(),
    category: "traffic",
    metric_value: 84.2,
    source: "fallback",
    status: "warning",
    notes: "Exemplo inicial para listagem.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const fallbackSummary: AnalyticsSummary[] = [
  {
    period: new Date().toISOString().slice(0, 10),
    category: "sales",
    total_records: 1,
    average_metric: 120.4,
    total_metric: 120.4
  },
  {
    period: new Date().toISOString().slice(0, 10),
    category: "traffic",
    total_records: 1,
    average_metric: 84.2,
    total_metric: 84.2
  }
];

async function fetchWithFallback<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return fallback;
    }

    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export async function getRecords(): Promise<AnalyticRecord[]> {
  return fetchWithFallback<AnalyticRecord[]>("/analytics/records?limit=20", fallbackRecords);
}

export async function getSummary(): Promise<AnalyticsSummary[]> {
  return fetchWithFallback<AnalyticsSummary[]>("/analytics/summary?period=day", fallbackSummary);
}
