// src/api/insight.ts
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

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

// /api/v1/meals/day 응답
export interface DayMealsData {
  date: string;
  totalKcal: number;
  totalSodiumMg: number;
  totalProteinG: number;
  totalMeals: number;
  meals: DayMeal[];
}

export interface DayMealsResponse {
  success: boolean;
  data: DayMealsData;
}

// 인사이트 로그 요청 (POST /insights/logs)
export interface InsightLogRequest {
  source: string;
  analysisId: number;
  mealtime: MealTime;
  // 예: "2025-12-05T13:00:00.000+09:00"
  orderedAt: string;
}

export interface InsightLogResponse {
  success: boolean;
  data: {
    mealLogId: number;
    linkedChallengesUpdated: number[];
  };
}

/** ====== 실제 API 함수들 ====== */

// 월별 캘린더 조회
export async function fetchCalendar(
  startDate: string, // "YYYY-MM-DD"
  endDate: string    // "YYYY-MM-DD"
): Promise<InsightCalendarResponse> {
  const res = await api.get<InsightCalendarResponse>("/api/v1/insights/calendar", {
    params: { startDate, endDate },
  });
  return res.data;
}

// 하루 식사 조회
export async function fetchDayMeals(
  date: string   // "YYYY-MM-DD"
): Promise<DayMealsResponse> {
  const res = await api.get<DayMealsResponse>("/api/v1/meals/day", {
    params: { date },
  });
  return res.data;
}

// 식사 로그 기록 (사진 분석 이후 호출)
export async function createInsightLog(
  body: InsightLogRequest
): Promise<InsightLogResponse> {
  const res = await api.post<InsightLogResponse>("/api/v1/insights/logs", body);
  return res.data;
}
