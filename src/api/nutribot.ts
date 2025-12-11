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
    handleApiError(error, undefined, false);
    return Promise.reject(error);
  }
);

export interface NutriBotCoachResponse {
  reply: string;
  tone: "gentle" | "strict" | "motivational";
  recommendedActions: string[];
}

export async function chatWithNutriBot(
  message: string
): Promise<NutriBotCoachResponse> {
  try {
    const res = await api.post<any>("/api/v1/nutribot/chat", {
      message,
    });
    return res.data.data;
  } catch (error) {
    handleApiError(error, "챗봇 응답을 받아오는데 실패했습니다", true);
    throw error;
  }
}

