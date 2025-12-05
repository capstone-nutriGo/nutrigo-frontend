// src/api/errorHandler.ts
import { AxiosError } from "axios";
import { toast } from "sonner@2.0.3";

// 백엔드 ApiResponse 구조
export interface ApiErrorResponse {
  success: false;
  data: null;
  message: string;
  errorCode: string;
}

// 에러 코드 타입 정의
export type ErrorCode = 
  // 공통 에러
  | "COMMON_001" | "COMMON_002" | "COMMON_003" | "COMMON_004" | "COMMON_005" | "COMMON_006" | "COMMON_007" | "COMMON_999"
  // 인증 에러
  | "AUTH_001" | "AUTH_002" | "AUTH_003"
  // 사용자 에러
  | "USER_001"
  // 챌린지 에러
  | "CHALLENGE_001"
  // 인사이트 에러
  | "INSIGHT_001" | "INSIGHT_002"
  // 검증 에러
  | "VALIDATION_001" | "VALIDATION_002" | "VALIDATION_003" | "VALIDATION_004" | "VALIDATION_005"
  | "VALIDATION_006" | "VALIDATION_007" | "VALIDATION_008" | "VALIDATION_009" | "VALIDATION_010"
  | "VALIDATION_011" | "VALIDATION_012" | "VALIDATION_013" | "VALIDATION_014" | "VALIDATION_015"
  | "VALIDATION_016" | "VALIDATION_017" | "VALIDATION_018" | "VALIDATION_019";

// 에러 메시지 매핑
const ERROR_MESSAGES: Record<string, string> = {
  // 공통 에러
  COMMON_001: "입력값을 확인해주세요",
  COMMON_002: "제약 조건을 위반했습니다",
  COMMON_003: "잘못된 요청 형식입니다",
  COMMON_004: "잘못된 요청입니다",
  COMMON_005: "지원하지 않는 요청 방법입니다",
  COMMON_006: "요청이 현재 데이터 상태와 충돌합니다",
  COMMON_007: "데이터 무결성 오류가 발생했습니다",
  COMMON_999: "서버 오류가 발생했습니다",
  
  // 인증 에러
  AUTH_001: "입력하신 이메일로 등록된 계정을 찾을 수 없습니다",
  AUTH_002: "이메일 또는 비밀번호가 올바르지 않습니다",
  AUTH_003: "이미 등록된 이메일입니다",
  
  // 사용자 에러
  USER_001: "사용자를 찾을 수 없습니다",
  
  // 챌린지 에러
  CHALLENGE_001: "챌린지를 찾을 수 없습니다",
  
  // 인사이트 에러
  INSIGHT_001: "분석 세션을 찾을 수 없습니다",
  INSIGHT_002: "잘못된 리포트 범위입니다",
};

/**
 * HTTP 상태 코드에 따른 기본 에러 메시지
 */
function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return "잘못된 요청입니다";
    case 401:
      return "인증이 필요합니다";
    case 403:
      return "접근 권한이 없습니다";
    case 404:
      return "요청한 리소스를 찾을 수 없습니다";
    case 405:
      return "지원하지 않는 요청 방법입니다";
    case 409:
      return "요청이 현재 데이터 상태와 충돌합니다";
    case 422:
      return "입력값을 확인해주세요";
    case 500:
      return "서버 오류가 발생했습니다";
    case 502:
      return "게이트웨이 오류가 발생했습니다";
    case 503:
      return "서비스를 일시적으로 사용할 수 없습니다";
    default:
      return "알 수 없는 오류가 발생했습니다";
  }
}

/**
 * 에러 코드에 따른 사용자 친화적 메시지 반환
 */
function getErrorMessage(errorCode: string | undefined, defaultMessage: string): string {
  if (errorCode && ERROR_MESSAGES[errorCode]) {
    return ERROR_MESSAGES[errorCode];
  }
  return defaultMessage;
}

/**
 * Axios 에러를 파싱하여 에러 정보 반환
 */
export function parseApiError(error: unknown): {
  status: number | null;
  message: string;
  errorCode: string | null;
} {
  if (error instanceof AxiosError) {
    const status = error.response?.status ?? null;
    const responseData = error.response?.data as ApiErrorResponse | undefined;
    
    // 백엔드 ApiResponse 형식의 에러
    if (responseData && !responseData.success && responseData.errorCode) {
      return {
        status,
        message: getErrorMessage(responseData.errorCode, responseData.message || getDefaultErrorMessage(status ?? 500)),
        errorCode: responseData.errorCode,
      };
    }
    
    // 일반적인 HTTP 에러
    const message = responseData?.message || error.message || getDefaultErrorMessage(status ?? 500);
    return {
      status,
      message,
      errorCode: responseData?.errorCode || null,
    };
  }
  
  // Axios 에러가 아닌 경우
  if (error instanceof Error) {
    return {
      status: null,
      message: error.message,
      errorCode: null,
    };
  }
  
  return {
    status: null,
    message: "알 수 없는 오류가 발생했습니다",
    errorCode: null,
  };
}

/**
 * 에러를 처리하고 사용자에게 알림 표시
 * @param error - 처리할 에러
 * @param customMessage - 커스텀 메시지 (선택사항)
 * @param showToast - 토스트 메시지 표시 여부 (기본값: true)
 * @returns 에러 정보
 */
export function handleApiError(
  error: unknown,
  customMessage?: string,
  showToast: boolean = true
): {
  status: number | null;
  message: string;
  errorCode: string | null;
} {
  const errorInfo = parseApiError(error);
  
  if (showToast) {
    const message = customMessage || errorInfo.message;
    
    // 상태 코드에 따라 다른 토스트 스타일 적용
    if (errorInfo.status === 401) {
      toast.error(message, {
        description: "다시 로그인해주세요",
      });
    } else if (errorInfo.status === 404) {
      toast.error(message);
    } else if (errorInfo.status === 400 || errorInfo.status === 422) {
      toast.error(message, {
        description: "입력값을 확인해주세요",
      });
    } else if (errorInfo.status === 409) {
      toast.error(message, {
        description: "데이터 충돌이 발생했습니다",
      });
    } else if (errorInfo.status && errorInfo.status >= 500) {
      toast.error(message, {
        description: "잠시 후 다시 시도해주세요",
      });
    } else {
      toast.error(message);
    }
  }
  
  return errorInfo;
}

/**
 * 401 에러인지 확인
 */
export function isUnauthorizedError(error: unknown): boolean {
  const errorInfo = parseApiError(error);
  return errorInfo.status === 401;
}

/**
 * 404 에러인지 확인
 */
export function isNotFoundError(error: unknown): boolean {
  const errorInfo = parseApiError(error);
  return errorInfo.status === 404;
}

/**
 * 400 또는 422 에러인지 확인 (검증 에러)
 */
export function isValidationError(error: unknown): boolean {
  const errorInfo = parseApiError(error);
  return errorInfo.status === 400 || errorInfo.status === 422;
}

