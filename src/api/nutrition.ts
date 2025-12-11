// src/api/nutrition.ts
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

export interface OrderImageAnalysisRequest {
  s3_key?: string;
  image_url?: string;
  image_base64?: string;
  capture_id?: string;
  order_date: string; // "YYYY-MM-DD"
  meal_time: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
}

export interface MealLogCandidate {
  menu: string;
  category: string;
  kcal: number;
  sodium_mg: number;
  protein_g: number;
  carb_g: number;
  total_score: number;
  intake_min_ratio?: number;
  intake_max_ratio?: number;
  intake_default_ratio?: number;
}

export interface OrderImageMealLogResponse {
  success: boolean;
  data: {
    capture_id: string;
    items: MealLogCandidate[];
    order_date?: string;
    meal_time?: string;
    raw_ocr_text?: string;
  };
}

export interface UserInfoRequest {
  gender: "male" | "female" | "other";
  birthday: string; // "YYYY-MM-DD"
}

export interface StoreLinkAnalysisRequest {
  store_url: string;
  user_info: UserInfoRequest;
}

export interface CartImageAnalysisRequest {
  s3_key?: string;
  image_url?: string;
  image_base64?: string;
  capture_id?: string;
  user_info: UserInfoRequest;
}

export interface MenuAnalysis {
  menu: {
    id: string;
    name: string;
    description?: string;
    price?: number;
    category_hint?: string;
    option_text?: string;
  };
  nutrition: {
    kcal: number;
    carb_g: number;
    protein_g: number;
    fat_g: number;
    sodium_mg: number;
    confidence: number;
  };
  score: number;
  badges: string[];
  coach_sentence: string;
}

export interface NutritionAnalysisResponse {
  success: boolean;
  data: {
    analyses: MenuAnalysis[];
    summary: string;
    recommended_menu_ids: string[];
  };
}

/** ====== API 함수들 ====== */

/**
 * 주문내역 이미지 분석 (S3 키 사용)
 */
export async function analyzeOrderImage(
  request: OrderImageAnalysisRequest
): Promise<OrderImageMealLogResponse> {
  try {
    const res = await api.post<OrderImageMealLogResponse>(
      "/api/v1/nutrition/order-image",
      request
    );
    return res.data;
  } catch (error) {
    handleApiError(error, undefined, false);
    throw error;
  }
}

/**
 * 배달앱 가게 링크 분석
 */
export async function analyzeStoreLink(
  request: StoreLinkAnalysisRequest
): Promise<NutritionAnalysisResponse> {
  try {
    const res = await api.post<NutritionAnalysisResponse>(
      "/api/v1/nutrition/store-link",
      request
    );
    return res.data;
  } catch (error) {
    handleApiError(error, undefined, false);
    throw error;
  }
}

/**
 * 장바구니 이미지 분석 (S3 키 사용)
 */
export async function analyzeCartImage(
  request: CartImageAnalysisRequest
): Promise<NutritionAnalysisResponse> {
  try {
    const res = await api.post<NutritionAnalysisResponse>(
      "/api/v1/nutrition/cart-image",
      request
    );
    return res.data;
  } catch (error) {
    handleApiError(error, undefined, false);
    throw error;
  }
}

