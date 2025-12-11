// src/api/insight.ts
import axios from "axios";
import { handleApiError } from "./errorHandler";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// 요청 인터셉터: 모든 요청에 인증 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    const tokenData = localStorage.getItem("tokenData");
    if (tokenData) {
      try {
        const parsed = JSON.parse(tokenData);
        const accessToken = parsed.accessToken;
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        } else {
          console.warn("accessToken이 없습니다. 로그인이 필요합니다.");
        }
      } catch (error) {
        console.error("토큰 파싱 오류:", error);
      }
    } else {
      console.warn("tokenData가 없습니다. 로그인이 필요합니다.");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    
    if (status === 401 || status === 403) {
      // 401 Unauthorized 또는 403 Forbidden 에러 시 로그아웃 처리
      localStorage.removeItem("tokenData");
      // 로그인 페이지로 리다이렉트 (필요시)
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

/** ====== 타입 정의 ====== */

// DayHighlight enum 매핑
export type DayHighlight = "GOOD" | "BAD" | "NEUTRAL";

// 캘린더 한 날짜
export interface CalendarDay {
  date: string;           // "2025-12-05"
  tags: string[];
  dayScore: number | null;
  highlight: DayHighlight | null;
}

// /api/v1/insights/calendar 응답
export interface InsightCalendarResponse {
  success: boolean;
  data: {
    startDate: string;
    endDate: string;
    days: CalendarDay[];
  };
}

// 하루 식사 한 끼
export type MealTime = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

export interface DayMeal {
  mealLogId: number;
  source: string;
  mealTime: MealTime;
  orderedAt: string;      // ISO 문자열
}

// 백엔드 DayMealsResponse.Meal 구조
export interface DayMealDetail {
  mealLogId: number;
  menu: string;
  category: string;
  mealTime: MealTime;
  mealDate: string;       // "YYYY-MM-DD"
  createdAt: string;     // ISO 문자열
  kcal: number | null;
  sodiumMg: number | null;
  proteinG: number | null;
  carbG: number | null;
  totalScore: number | null;
}

// /api/v1/meals/day 응답
export interface DayMealsData {
  date: string;
  totalKcal: number | null;
  totalSodiumMg: number | null;
  totalProteinG: number | null;
  totalCarbG: number | null;
  totalMeals: number;
  totalSnack: number;
  totalNight: number;
  dayScore: number | null;
  dayColor: string | null;
  meals: DayMealDetail[];
}

export interface DayMealsResponse {
  success: boolean;
  data: DayMealsData;
}

// 인사이트 로그 요청 (POST /insights/logs)
export interface InsightLogRequest {
  menu: string;
  foodImageUrl?: string;
  foodDescription?: string;
  serving: number; // 인분 단위 (0.0 ~ 1.0)
  mealtime: MealTime;
  mealDate: string; // "YYYY-MM-DD" 형식
  // 이미 분석된 영양소 정보 (선택적)
  kcal?: number;
  sodiumMg?: number;
  proteinG?: number;
  carbG?: number;
  // 카테고리 정보 (선택적)
  category?: string;
}

export interface InsightLogResponse {
  success: boolean;
  data: {
    mealLogId: number;
    linkedChallengesUpdated: number[];
  };
}

// InsightReportResponse.java
export type ReportRange = "WEEKLY" | "MONTHLY";

export interface InsightReportResponse {
  success: boolean;
  data: {
    range: ReportRange;
    startDate: string; // "YYYY-MM-DD"
    endDate: string; // "YYYY-MM-DD"
    summary: {
      totalMeals: number;
      goodDays: number;
      overeatDays: number;
      lowSodiumDays: number;
      avgScore: number;
    };
    patterns: {
      lateSnack: {
        lateSnackDays: number;
      };
    };
  };
}

// WeeklyInsightSummaryResponse.java
export interface WeeklyInsightSummaryResponse {
  success: boolean;
  data: {
    weekStart: string; // "YYYY-MM-DD"
    weekEnd: string; // "YYYY-MM-DD"
    summary: {
      totalMeals: number | null;
      goodDays: number | null;
      overeatDays: number | null;
      lowSodiumDays: number | null;
      averageScore: number | null;
      averageKcalPerMeal: number | null;
    };
    trends: {
      days: TrendDay[];
    };
    categoryTop3: CategoryStat[];
  };
}

export interface TrendDay {
  date: string; // "YYYY-MM-DD"
  dayScore: number | null;
  dayColor: string | null;
  totalKcal: number | null;
  totalCarbG: number | null;
  totalProteinG: number | null;
  totalSodiumMg: number | null;
}

export interface CategoryStat {
  category: string;
  count: number;
}

/** ====== 실제 API 함수들 ====== */

// 월별 캘린더 조회
export async function fetchCalendar(
  startDate: string, // "YYYY-MM-DD"
  endDate: string    // "YYYY-MM-DD"
): Promise<InsightCalendarResponse> {
  try {
    const res = await api.get<InsightCalendarResponse>("/api/v1/insights/calendar", {
      params: { startDate, endDate },
    });
    return res.data;
  } catch (error) {
    handleApiError(error, undefined, false); // 토스트는 호출하는 곳에서 처리
    throw error;
  }
}

// 하루 식사 조회
export async function fetchDayMeals(
  date: string   // "YYYY-MM-DD"
): Promise<DayMealsResponse> {
  try {
    const res = await api.get<DayMealsResponse>("/api/v1/meals/day", {
      params: { date },
    });
    return res.data;
  } catch (error) {
    handleApiError(error, undefined, false); // 토스트는 호출하는 곳에서 처리
    throw error;
  }
}

// 식사 로그 기록 (사진 분석 이후 호출)
export async function createInsightLog(
  body: InsightLogRequest
): Promise<InsightLogResponse> {
  try {
    const res = await api.post<InsightLogResponse>("/api/v1/insights/logs", body);
    return res.data;
  } catch (error) {
    handleApiError(error, undefined, false); // 토스트는 호출하는 곳에서 처리
    throw error;
  }
}

// 리포트 조회
export async function getReport(
  range: ReportRange,
  baseDate: string // "YYYY-MM-DD"
): Promise<InsightReportResponse> {
  try {
    const res = await api.get<InsightReportResponse>("/api/v1/insights/reports", {
      params: { range, baseDate },
    });
    return res.data;
  } catch (error) {
    handleApiError(error, undefined, false);
    throw error;
  }
}

// 주간 요약 조회
export async function getWeeklySummary(
  baseDate: string // "YYYY-MM-DD"
): Promise<WeeklyInsightSummaryResponse> {
  try {
    const res = await api.get<WeeklyInsightSummaryResponse>("/api/v1/insights/weekly-summary", {
      params: { baseDate },
    });
    return res.data;
  } catch (error) {
    handleApiError(error, undefined, false);
    throw error;
  }
}
