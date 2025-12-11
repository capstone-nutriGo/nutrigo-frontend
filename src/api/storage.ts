// src/api/storage.ts
import axios from "axios";
import { handleApiError } from "./errorHandler";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

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

