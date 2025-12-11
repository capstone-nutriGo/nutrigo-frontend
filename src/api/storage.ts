// src/api/storage.ts
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

export interface PresignedUrlRequest {
  fileExtension: string; // "jpg", "png" 등
  contentType: string; // "image/jpeg", "image/png" 등
}

export interface PresignedUrlResponse {
  presignedUrl: string;
  key: string;
  expiresIn: number; // 초 단위
  contentType: string;
}

/** ====== API 함수들 ====== */

/**
 * 이미지 업로드를 위한 presigned URL 요청
 * 
 * 옵션 A(권장) 시퀀스의 단계 1:
 * 백엔드에 presigned URL 요청 → upload_url과 key 받기
 */
export async function getPresignedUrl(
  request: PresignedUrlRequest
): Promise<PresignedUrlResponse> {
  try {
    const res = await api.post<{ success: boolean; data: PresignedUrlResponse }>(
      "/api/v1/storage/presigned-url",
      request
    );
    return res.data.data;
  } catch (error) {
    handleApiError(error, undefined, false);
    throw error;
  }
}

/**
 * S3에 직접 파일 업로드 (presigned URL 사용)
 * 
 * 옵션 A(권장) 시퀀스의 단계 2:
 * 받은 presigned URL로 프론트엔드에서 S3에 직접 PUT 업로드
 * (백엔드를 거치지 않고 프론트엔드 → S3 직접 전송)
 */
export async function uploadToS3(
  presignedUrl: string,
  file: File,
  contentType: string
): Promise<void> {
  try {
    await axios.put(presignedUrl, file, {
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    console.error("S3 업로드 실패:", error);
    throw new Error("파일 업로드에 실패했습니다.");
  }
}

