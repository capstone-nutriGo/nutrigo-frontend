import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { AuthResponse } from "../api/auth";

export function KakaoCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // 이미 처리했으면 다시 실행하지 않음
    if (hasProcessed.current) {
      return;
    }

    const success = searchParams.get("success");
    
    if (success === "true") {
      // 성공 시 토큰 정보를 받아서 로그인 처리
      const accessToken = searchParams.get("accessToken");
      const refreshToken = searchParams.get("refreshToken");
      const userId = searchParams.get("userId");
      const email = searchParams.get("email");
      const nickname = searchParams.get("nickname");
      const isNewUser = searchParams.get("isNewUser") === "true";

      if (accessToken && refreshToken && userId && email && nickname) {
        hasProcessed.current = true;
        
        const authResponse: AuthResponse = {
          success: true,
          data: {
            accessToken,
            refreshToken,
            tokenType: "Bearer",
            expiresIn: 3600,
            user: {
              userId: parseInt(userId),
              email: decodeURIComponent(email),
              nickname: decodeURIComponent(nickname),
            },
          },
          isNewUser: isNewUser,
        };

        login(authResponse);
        // 상태 업데이트를 위해 약간의 지연 후 메인 화면으로 이동
        // replace: true로 히스토리 교체하여 뒤로가기 시 콜백 페이지로 돌아가지 않도록 함
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 100);
      } else {
        hasProcessed.current = true;
        // 필수 파라미터가 없는 경우
        alert("로그인 정보를 받아오는데 실패했습니다.");
        navigate("/login", { replace: true });
      }
    } else if (success === "false") {
      hasProcessed.current = true;
      // 실패 시 에러 메시지 표시
      const error = searchParams.get("error");
      alert(error ? decodeURIComponent(error) : "카카오 로그인에 실패했습니다.");
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">카카오 로그인 처리 중...</p>
      </div>
    </div>
  );
}

