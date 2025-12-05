// src/pages/SignupPage.tsx
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Checkbox } from "../components/ui/checkbox";
import { Logo } from "../components/Logo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  Chrome,
  Check,
  ChevronLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  registerApi,
  RegisterRequest,
  Gender,
  AuthResponse,
} from "../api/auth";

export function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState(1); // 1: 기본정보, 2: 생년월일/성별
  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthday: "", // YYYY-MM-DD
    gender: "",   // "MALE" | "FEMALE"
  });

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // 비밀번호 확인 검증
    if (field === "confirmPassword" || field === "password") {
      const pwd = field === "password" ? (value as string) : formData.password;
      const confirmPwd =
        field === "confirmPassword"
          ? (value as string)
          : formData.confirmPassword;
      setPasswordMatch(pwd === confirmPwd || confirmPwd === "");
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeTerms || !agreePrivacy) {
      alert("필수 약관에 동의해주세요.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 다음 단계로
    setStep(2);
  };

  /** 최종 회원가입 + 자동 로그인 */
  const handleFinalSignup = async () => {
    setIsLoading(true);

    try {
      await registerApi({
        email: formData.email,
        password: formData.password,
        nickname: formData.name,
        name: formData.name,
        birthday: formData.birthday,
        gender: formData.gender as Gender
      });

      alert("회원가입이 완료되었습니다. 이제 로그인해주세요.");
      navigate("/login");

    } catch (err) {
      console.error(err);
      alert("회원가입 실패");
    } finally {
      setIsLoading(false);
    }
  };


  /** '나중에 설정하기'도 실제로 회원가입은 진행 */
  const handleSkip = () => {
    handleFinalSignup();
  };

  const handleSocialSignup = (provider: string) => {
    console.log(`${provider} 회원가입`);
    // 실제로는 OAuth 처리
  };

  const handleAgreeAll = (checked: boolean) => {
    setAgreeTerms(checked);
    setAgreePrivacy(checked);
    setAgreeMarketing(checked);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50/40 via-stone-50 to-emerald-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl mb-2">회원가입</h1>
          <p className="text-muted-foreground">건강한 배달 생활을 시작해보세요</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              {step === 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(1)}
                  className="p-0"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  이전
                </Button>
              )}
              <div className="ml-auto text-sm text-muted-foreground">
                Step {step} / 2
              </div>
            </div>
            <CardTitle>
              {step === 1 ? "계정 만들기" : "개인 정보 입력"}
            </CardTitle>
            <CardDescription>
              {step === 1
                ? "정보를 입력하여 nutriGo 계정을 만드세요"
                : "더 나은 추천을 위해 기본 정보를 입력해주세요 (선택사항)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              // Step 1: 기본 회원가입 정보
              <>
                <form onSubmit={handleStep1Submit} className="space-y-4">
                  {/* 이름 */}
                  <div className="space-y-2">
                    <Label htmlFor="name">이름</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="홍길동"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {/* 닉네임 */}
                  <div className="space-y-2">
                    <Label htmlFor="nickname">닉네임</Label>
                    <Input
                      id="nickname"
                      type="text"
                      placeholder="앱에서 사용할 이름"
                      value={formData.nickname}
                      onChange={(e) =>
                        handleChange("nickname", e.target.value)
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      입력하지 않으면 이름으로 대신 사용됩니다.
                    </p>
                  </div>

                  {/* 이메일 */}
                  <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
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
                        placeholder="8자 이상 입력하세요"
                        value={formData.password}
                        onChange={(e) =>
                          handleChange("password", e.target.value)
                        }
                        className="pl-10"
                        required
                        minLength={8}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      영문, 숫자, 특수문자를 포함하여 8자 이상
                    </p>
                  </div>

                  {/* 비밀번호 확인 */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="비밀번호를 다시 입력하세요"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleChange("confirmPassword", e.target.value)
                        }
                        className={`pl-10 ${
                          !passwordMatch ? "border-red-500" : ""
                        }`}
                        required
                      />
                      {formData.confirmPassword && passwordMatch && (
                        <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-4 h-4" />
                      )}
                    </div>
                    {!passwordMatch && formData.confirmPassword && (
                      <p className="text-xs text-red-500">
                        비밀번호가 일치하지 않습니다
                      </p>
                    )}
                  </div>

                  {/* 약관 동의 */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                      <Checkbox
                        id="agreeAll"
                        checked={
                          agreeTerms && agreePrivacy && agreeMarketing
                        }
                        onCheckedChange={(checked) =>
                          handleAgreeAll(checked as boolean)
                        }
                      />
                      <label
                        htmlFor="agreeAll"
                        className="text-sm cursor-pointer flex-1"
                      >
                        전체 동의
                      </label>
                    </div>

                    <div className="space-y-2 pl-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="agreeTerms"
                          checked={agreeTerms}
                          onCheckedChange={(checked) =>
                            setAgreeTerms(checked as boolean)
                          }
                        />
                        <label
                          htmlFor="agreeTerms"
                          className="text-sm cursor-pointer flex-1"
                        >
                          <span className="text-red-500">*</span> 이용약관 동의
                        </label>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-xs"
                          type="button"
                        >
                          보기
                        </Button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="agreePrivacy"
                          checked={agreePrivacy}
                          onCheckedChange={(checked) =>
                            setAgreePrivacy(checked as boolean)
                          }
                        />
                        <label
                          htmlFor="agreePrivacy"
                          className="text-sm cursor-pointer flex-1"
                        >
                          <span className="text-red-500">*</span> 개인정보
                          처리방침 동의
                        </label>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-xs"
                          type="button"
                        >
                          보기
                        </Button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="agreeMarketing"
                          checked={agreeMarketing}
                          onCheckedChange={(checked) =>
                            setAgreeMarketing(checked as boolean)
                          }
                        />
                        <label
                          htmlFor="agreeMarketing"
                          className="text-sm cursor-pointer flex-1"
                        >
                          마케팅 정보 수신 동의 (선택)
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* 다음 단계 버튼 */}
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={!passwordMatch}
                  >
                    다음 단계
                    <ArrowRight className="w-4 h-4 ml-2" />
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

                {/* 소셜 회원가입 */}
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    type="button"
                    onClick={() => handleSocialSignup("google")}
                  >
                    <Chrome className="w-4 h-4 mr-2" />
                    Google로 시작하기
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    type="button"
                    onClick={() => handleSocialSignup("kakao")}
                  >
                    <div className="w-4 h-4 mr-2 bg-yellow-400 rounded-full" />
                    카카오로 시작하기
                  </Button>
                </div>

                {/* 로그인 링크 */}
                <div className="mt-6 text-center text-sm">
                  <span className="text-muted-foreground">
                    이미 계정이 있으신가요?{" "}
                  </span>
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => navigate("/login")}
                  >
                    로그인
                  </Button>
                </div>
              </>
            ) : (
              // Step 2: 생년월일 & 성별
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <UserIcon className="w-5 h-5 text-primary" />
                    <h3 className="font-medium">기본 정보</h3>
                  </div>

                  {/* 생년월일 */}
                  <div className="space-y-2">
                    <Label htmlFor="birthday">생년월일</Label>
                    <Input
                      id="birthday"
                      type="date"
                      value={formData.birthday}
                      onChange={(e) =>
                        handleChange("birthday", e.target.value)
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      YYYY-MM-DD 형식으로 입력해주세요
                    </p>
                  </div>

                  {/* 성별 */}
                  <div className="space-y-2">
                    <Label>성별</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => handleChange("gender", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">남성</SelectItem>
                        <SelectItem value="female">여성</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 에러 메시지 */}
                {error && (
                  <p className="text-sm text-red-500 text-center">{error}</p>
                )}

                {/* 완료/스킵 버튼 */}
                <div className="space-y-3 pt-4">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleFinalSignup}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      "계정 생성 중..."
                    ) : (
                      <>
                        회원가입 완료
                        <Check className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={handleSkip}
                    disabled={isLoading}
                  >
                    나중에 설정하기
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  이 정보는 나중에 마이페이지에서 수정할 수 있습니다
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 뒤로가기 */}
        {step === 1 && (
          <div className="mt-4 text-center">
            <Button variant="ghost" onClick={() => navigate("/")}>
              홈으로 돌아가기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
