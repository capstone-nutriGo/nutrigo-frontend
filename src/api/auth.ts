// src/api/auth.ts
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

/** ====== 백엔드 DTO 매핑 ====== */

// AuthResponse.java
export interface UserData {
  userId: number;
  email: string;
  nickname: string;
}

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  tokenType: string; // "Bearer"
  expiresIn: number; // 3600 (초)
  user: UserData;
}

export interface AuthResponse {
  success: boolean;
  data: TokenData;
}

// LoginRequest.java
export interface LoginRequest {
  email: string;
  password: string;
}

// RegisterRequest.java
// Gender enum은 문자열로 온다고 가정 (ex. "MALE", "FEMALE"...)
export type Gender = "male" | "female" | "other"; // 실제 enum 이름에 맞게 수정 가능

export interface RegisterRequest {
  email: string;
  password: string;
  nickname: string;
  name: string;
  gender: Gender;
  birthday: string; // LocalDate → "YYYY-MM-DD" 형태로 보내기
}

// RefreshRequest.java
export interface RefreshRequest {
  refreshToken: string;
}

// LogoutRequest.java 의 Response
export interface LogoutResponse {
  success: boolean;
  data: {
    revoked: boolean;
  };
}

// SocialLoginRequest.java
export type SocialProvider = "KAKAO" | "GOOGLE" | "NAVER";

export interface DeviceInfo {
  os: string;
  appVersion: string;
}

export interface SocialLoginRequest {
  provider: SocialProvider;
  accessToken: string;
  idToken: string;
  deviceInfo: DeviceInfo;
}

/** ====== API 함수들 ====== */

// 로그인
export async function loginApi(body: LoginRequest): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/api/v1/auth/login", body);
  return res.data;
}

// 회원가입
export async function registerApi(body: RegisterRequest): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/api/v1/auth/register", body);
  return res.data;
}

// 토큰 재발급
export async function refreshApi(body: RefreshRequest): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/api/v1/auth/refresh", body);
  return res.data;
}

// 로그아웃
export async function logoutApi(
  accessToken: string,
  body: RefreshRequest
): Promise<LogoutResponse> {
  const res = await api.post<LogoutResponse>("/api/v1/auth/logout", body, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.data;
}

// 소셜 로그인
export async function socialLoginApi(
  body: SocialLoginRequest
): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/api/v1/auth/social/login", body);
  return res.data;
}
