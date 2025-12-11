// src/api/notification.ts
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
        }
      } catch (error) {
        console.error("토큰 파싱 오류:", error);
      }
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
      localStorage.removeItem("tokenData");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

export interface NotificationResult {
  sentCount: number;
  skippedCount: number;
  message: string;
}

export interface NotificationResponse {
  success: boolean;
  data: NotificationResult;
}

/**
 * 테스트용: 식단 코치 알림 전송
 */
export async function testMealCoachNotification(): Promise<NotificationResult> {
  try {
    console.log("[notification.ts] 식단 코치 알림 테스트 API 호출");
    const res = await api.post<NotificationResponse>("/api/v1/notifications/test/meal-coach");
    console.log("[notification.ts] 식단 코치 알림 테스트 API 응답:", res.data);
    if (!res.data.success || !res.data.data) {
      throw new Error("응답 데이터가 올바르지 않습니다.");
    }
    return res.data.data;
  } catch (error) {
    console.error("[notification.ts] 식단 코치 알림 테스트 에러:", error);
    // handleApiError는 토스트를 표시하지 않도록 false로 설정했으므로 여기서는 에러만 던짐
    throw error;
  }
}

/**
 * 테스트용: 챌린지 리마인드 알림 전송
 */
export async function testChallengeReminder(): Promise<NotificationResult> {
  try {
    console.log("[notification.ts] 챌린지 리마인드 테스트 API 호출");
    const res = await api.post<NotificationResponse>("/api/v1/notifications/test/challenge-reminder");
    console.log("[notification.ts] 챌린지 리마인드 테스트 API 응답:", res.data);
    if (!res.data.success || !res.data.data) {
      throw new Error("응답 데이터가 올바르지 않습니다.");
    }
    return res.data.data;
  } catch (error) {
    console.error("[notification.ts] 챌린지 리마인드 테스트 에러:", error);
    // handleApiError는 토스트를 표시하지 않도록 false로 설정했으므로 여기서는 에러만 던짐
    throw error;
  }
}

