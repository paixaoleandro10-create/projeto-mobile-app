import {
  dashboardOverview,
  dashboardTasks,
  recentPerformance,
  reportLines,
  reportStudent,
  reportSummary,
  scheduleEvents,
  subjectsData,
  type MobileDashboardResponse,
  type MobileReportResponse,
  type MobileScheduleResponse,
  type MobileSubjectsResponse
} from "@/lib/mobile-data";

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://127.0.0.1:8000/api/v1";

export type ApiResult<T> = {
  data: T;
  source: "api" | "fallback";
  error: string | null;
};

async function fetchMobile<T>(path: string, fallback: T): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      cache: "no-store"
    });
    if (!response.ok) {
      return {
        data: fallback,
        source: "fallback",
        error: `HTTP ${response.status}`
      };
    }

    return {
      data: (await response.json()) as T,
      source: "api",
      error: null
    };
  } catch (error) {
    return {
      data: fallback,
      source: "fallback",
      error: error instanceof Error ? error.message : "Unknown network error"
    };
  }
}

const dashboardFallback: MobileDashboardResponse = {
  overview: dashboardOverview,
  tasks: dashboardTasks,
  performance: recentPerformance
};

const subjectsFallback: MobileSubjectsResponse = {
  subjects: subjectsData
};

const scheduleFallback: MobileScheduleResponse = {
  month_label: "October 2024",
  default_day: 10,
  events: scheduleEvents
};

const reportFallback: MobileReportResponse = {
  student: reportStudent,
  summary: reportSummary,
  lines: reportLines
};

export async function getMobileDashboard(): Promise<ApiResult<MobileDashboardResponse>> {
  return fetchMobile<MobileDashboardResponse>("/mobile/dashboard", dashboardFallback);
}

export async function getMobileSubjects(): Promise<ApiResult<MobileSubjectsResponse>> {
  return fetchMobile<MobileSubjectsResponse>("/mobile/subjects", subjectsFallback);
}

export async function getMobileSchedule(): Promise<ApiResult<MobileScheduleResponse>> {
  return fetchMobile<MobileScheduleResponse>("/mobile/schedule", scheduleFallback);
}

export async function getMobileReport(): Promise<ApiResult<MobileReportResponse>> {
  return fetchMobile<MobileReportResponse>("/mobile/report", reportFallback);
}
