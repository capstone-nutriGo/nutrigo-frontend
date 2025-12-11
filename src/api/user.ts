// src/api/user.ts
import axios, { AxiosError } from "axios";
import { handleApiError, parseApiError, type ApiErrorResponse } from "./errorHandler";

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

/** ====== 백엔드 DTO 매핑 ====== */

// Gender enum
export type Gender = "male" | "female" | "other";

// HealthMode enum
export type HealthMode = "relaxed" | "normal" | "strict";

// DefaultMode enum
export type DefaultMode = "STRICT" | "BALANCED" | "FLEX";

// UserProfileResponse.java
export interface UserProfileResponse {
  success: boolean;
  data: {
    userId: number;
    email: string;
    nickname: string;
    name: string;
    gender: Gender | null;
    birthday: string | null; // "YYYY-MM-DD"
    address: string | null;
    preferences: {
      healthMode: HealthMode | null;
      defaultMode: DefaultMode | null;
    } | null;
  };
}

// UserProfileUpdateRequest.java
export interface UserProfileUpdateRequest {
  nickname?: string;
  name?: string;
  gender?: Gender;
  birthday?: string; // "YYYY-MM-DD"
  address?: string;
  preferences?: {
    healthMode?: HealthMode;
    defaultMode?: DefaultMode;
  };
}

// UserSettingsRequest.java
export interface UserSettingsRequest {
  notification?: {
    eveningCoach?: boolean;
    challengeReminder?: boolean;
  };
  defaultMode?: DefaultMode;
}

// UserSettingsResponse.java
export interface UserSettingsResponse {
  success: boolean;
  data: {
    notification: {
      eveningCoach: boolean | null;
      challengeReminder: boolean | null;
    };
    defaultMode: string | null;
  };
}

/** ====== API 함수들 ====== */

// 프로필 조회
export async function getProfile(): Promise<UserProfileResponse> {
  try {
    const res = await api.get<UserProfileResponse>("/api/v1/users/me/profile");
    return res.data;
  } catch (error) {
    handleApiError(error, undefined, false); // 토스트는 호출하는 곳에서 처리
    throw error;
  }
}

// 프로필 업데이트
export async function updateProfile(
  body: UserProfileUpdateRequest
): Promise<UserProfileResponse> {
  try {
    const res = await api.put<UserProfileResponse>(
      "/api/v1/users/me/profile",
      body
    );
    return res.data;
  } catch (error) {
    handleApiError(error, undefined, false); // 토스트는 호출하는 곳에서 처리
    throw error;
  }
}

// 설정 업데이트
export async function updateSettings(
  body: UserSettingsRequest
): Promise<UserSettingsResponse> {
  try {
    const res = await api.put<UserSettingsResponse>(
      "/api/v1/users/me/settings",
      body
    );
    return res.data;
  } catch (error) {
    handleApiError(error, undefined, false); // 토스트는 호출하는 곳에서 처리
    throw error;
  }
}

