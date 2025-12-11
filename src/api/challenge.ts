// src/api/challenge.ts
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
      // 401 Unauthorized 또는 403 Forbidden 에러 시 로그아웃 처리
      localStorage.removeItem("tokenData");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

/** ====== 백엔드 DTO 매핑 ====== */

// ChallengeCategory enum
export type ChallengeCategory = "HEALTH" | "FUN";

// ChallengeType enum
export type ChallengeType = "kcal" | "sodium" | "frequency" | "day_color" | "delivery_count" | "custom";

// ChallengeStatus (백엔드에서 반환하는 실제 값)
export type ChallengeStatus = "available" | "in-progress" | "done" | "AVAILABLE" | "IN_PROGRESS" | "COMPLETED" | "FAILED";

// ChallengeListResponse.java
export interface ChallengeListResponse {
  success: boolean;
  data: {
    challenges: ChallengeSummary[];
  };
}

export interface ChallengeSummary {
  challengeId: number;
  title: string;
  description: string;
  category: ChallengeCategory;
  type: ChallengeType;
  durationDays: number;
  status: ChallengeStatus;
  progressValue: number | null;
  startedAt: string | null; // ISO datetime string
  endedAt: string | null; // ISO datetime string
}

// ChallengeProgressResponse.java
export interface ChallengeProgressResponse {
  success: boolean;
  data: {
    inProgress: InProgressChallenge[];
    done: CompletedChallenge[];
  };
}

export interface InProgressChallenge {
  challengeId: number;
  title: string;
  category: ChallengeCategory;
  type: ChallengeType;
  progressRate: number; // 0-100
  logsCount: number;
  remainingDays: number;
}

export interface CompletedChallenge {
  challengeId: number;
  title: string;
  category: ChallengeCategory;
  type: ChallengeType;
  finishedAt: string; // ISO datetime string
}

// JoinChallengeResponse.java
export interface JoinChallengeResponse {
  success: boolean;
  data: {
    challengeId: number;
    status: ChallengeStatus;
    startedAt: string; // ISO datetime string
    endedAt: string; // ISO datetime string
  };
}

// ChallengeCreateRequest.java
export interface ChallengeCreateRequest {
  title: string;
  description?: string;
  category: ChallengeCategory;
  type: ChallengeType;
  durationDays: number;
  goal: {
    targetCount?: number;
    maxKcalPerMeal?: number;
    maxSodiumMgPerMeal?: number;
    customDescription?: string;
  };
}

// ChallengeCreateResponse.java
export interface ChallengeCreateResponse {
  success: boolean;
  data: {
    challengeId: number;
    title: string;
    description: string;
    category: ChallengeCategory;
    type: ChallengeType;
    durationDays: number;
    status: ChallengeStatus;
    startedAt: string; // ISO datetime string
    expectedEndAt: string; // ISO datetime string
    goal: {
      targetCount: number | null;
      maxKcalPerMeal: number | null;
      maxSodiumMgPerMeal: number | null;
      customDescription: string | null;
    };
  };
}

// ChallengeQuitResponse.java
export interface ChallengeQuitResponse {
  success: boolean;
  data: {
    challengeId: number;
    status: ChallengeStatus;
    finishedAt: string; // ISO datetime string
  };
}

// ChallengeProgressDetailResponse.java
export interface DailyIntake {
  date: string; // "YYYY-MM-DD"
  totalKcal: number | null;
  totalSodiumMg: number | null;
  totalProteinG: number | null;
  totalCarbG: number | null;
  totalSnack: number | null;
  totalNight: number | null;
  dayScore: number | null;
  dayColor: string | null;
}

export interface ChallengeProgressDetailResponse {
  success: boolean;
  data: {
    challengeId: number;
    title: string;
    description: string;
    type: ChallengeType;
    status: ChallengeStatus;
    progressRate: number; // 0-100
    remainingDays: number;
    totalDays: number;
    completedDays: number;
    startedAt: string; // "YYYY-MM-DD"
    endedAt: string; // "YYYY-MM-DD"
    finishedAt: string | null; // ISO datetime string
    dailyIntakes: DailyIntake[];
  };
}

/** ====== API 함수들 ====== */

// 챌린지 목록 조회
export async function getChallenges(status?: string): Promise<ChallengeListResponse> {
  try {
    const params = status ? { status } : {};
    const res = await api.get<ChallengeListResponse>("/api/v1/challenges", { params });
    return res.data;
  } catch (error) {
    handleApiError(error, undefined, false);
    throw error;
  }
}

// 챌린지 참여
export async function joinChallenge(challengeId: number): Promise<JoinChallengeResponse> {
  try {
    const res = await api.post<JoinChallengeResponse>(`/api/v1/challenges/${challengeId}/join`);
    return res.data;
  } catch (error) {
    handleApiError(error, undefined, false);
    throw error;
  }
}

// 진행 상황 조회
export async function getProgress(): Promise<ChallengeProgressResponse> {
  try {
    const res = await api.get<ChallengeProgressResponse>("/api/v1/challenges/progress");
    return res.data;
  } catch (error) {
    handleApiError(error, undefined, false);
    throw error;
  }
}

// 커스텀 챌린지 생성
export async function createCustomChallenge(
  request: ChallengeCreateRequest
): Promise<ChallengeCreateResponse> {
  try {
    const res = await api.post<ChallengeCreateResponse>(
      "/api/v1/users/me/challenges",
      request
    );
    return res.data;
  } catch (error) {
    handleApiError(error, undefined, false);
    throw error;
  }
}

// 챌린지 포기
export async function quitChallenge(challengeId: number): Promise<ChallengeQuitResponse> {
  try {
    const res = await api.post<ChallengeQuitResponse>(`/api/v1/challenges/${challengeId}/quit`);
    return res.data;
  } catch (error) {
    handleApiError(error, undefined, false);
    throw error;
  }
}

// 챌린지 상세 진행 상황 조회
export async function getChallengeProgress(
  challengeId: number
): Promise<ChallengeProgressDetailResponse> {
  try {
    const res = await api.get<ChallengeProgressDetailResponse>(
      `/api/v1/challenges/${challengeId}/progress`
    );
    return res.data;
  } catch (error) {
    handleApiError(error, undefined, false);
    throw error;
  }
}

