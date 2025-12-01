import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Checkbox } from "../components/ui/checkbox";
import { Logo } from "../components/Logo";
import { Mail, Lock, ArrowRight, Chrome } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // 실제로는 API 호출
    setTimeout(() => {
      setIsLoading(false);
      login(); // 로그인 상태 업데이트
      // 로그인 성공 후 홈으로 이동
      navigate('/');
    }, 1500);
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`${provider} 로그인`);
    // 실제로는 OAuth 처리
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/40 via-stone-50 to-lime-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl font-bold mb-2">환영합니다!</h1>
          <p className="text-muted-foreground">nutriGo에 로그인하여 시작하세요</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>로그인</CardTitle>
            <CardDescription>
              계정 정보를 입력하여 로그인하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* 이메일 */}
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* 비밀번호 */}
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* 로그인 유지 & 비밀번호 찾기 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    로그인 유지
                  </label>
                </div>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-sm" 
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                >
                  비밀번호 찾기
                </Button>
              </div>

              {/* 로그인 버튼 */}
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  "로그인 중..."
                ) : (
                  <>
                    로그인
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* 구분선 */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  또는
                </span>
              </div>
            </div>

            {/* 소셜 로그인 */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                type="button"
                onClick={() => handleSocialLogin('google')}
              >
                <Chrome className="w-4 h-4 mr-2" />
                Google로 계속하기
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                type="button"
                onClick={() => handleSocialLogin('kakao')}
              >
                <div className="w-4 h-4 mr-2 bg-yellow-400 rounded-full" />
                카카오로 계속하기
              </Button>
            </div>

            {/* 회원가입 링크 */}
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">아직 계정이 없으신가요? </span>
              <Button 
                variant="link" 
                className="p-0 h-auto"
                onClick={() => navigate('/signup')}
              >
                회원가입
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 뒤로가기 */}
        <div className="mt-4 text-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
          >
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}