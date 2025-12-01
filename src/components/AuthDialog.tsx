import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Separator } from "./ui/separator";
import { Checkbox } from "./ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import { Mail, Lock, User as UserIcon, ArrowRight, Chrome, Check, ChevronLeft, Target, Zap, Droplets } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "signup";
}

export function AuthDialog({ isOpen, onClose, defaultTab = "login" }: AuthDialogProps) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [signupStep, setSignupStep] = useState(1); // 1: 기본정보, 2: 개인정보 & 목표설정
  const [loginData, setLoginData] = useState({ email: "", password: "", rememberMe: false });
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
    agreePrivacy: false,
    age: "",
    gender: "",
    calories: [2000],
    sodium: [2000]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // 실제로는 API 호출
    setTimeout(() => {
      setIsLoading(false);
      login(); // 로그인 상태 업데이트
      onClose();
      // 로그인 성공 처리
    }, 1500);
  };

  const handleSignupStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupData.agreeTerms || !signupData.agreePrivacy) {
      alert('필수 약관에 동의해주세요.');
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 다음 단계로
    setSignupStep(2);
  };

  const handleFinalSignup = () => {
    setIsLoading(true);
    
    // 실제로는 API 호출
    setTimeout(() => {
      setIsLoading(false);
      login(); // 회원가입 후 자동 로그인
      onClose();
      // Reset states
      setSignupStep(1);
      setSignupData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        agreeTerms: false,
        agreePrivacy: false,
        age: "",
        gender: "",
        calories: [2000],
        sodium: [2000]
      });
      // 회원가입 성공 처리
    }, 1500);
  };

  const handleSkip = () => {
    handleFinalSignup();
  };

  const handleSocialAuth = (provider: string) => {
    console.log(`${provider} 인증`);
    // 실제로는 OAuth 처리
  };

  const handleSignupPasswordChange = (field: 'password' | 'confirmPassword', value: string) => {
    const newData = { ...signupData, [field]: value };
    setSignupData(newData);
    
    if (field === 'confirmPassword' || field === 'password') {
      const pwd = field === 'password' ? value : signupData.password;
      const confirmPwd = field === 'confirmPassword' ? value : signupData.confirmPassword;
      setPasswordMatch(pwd === confirmPwd || confirmPwd === '');
    }
  };

  const handleSignupDataChange = (field: string, value: string | number[]) => {
    setSignupData(prev => ({ ...prev, [field]: value }));
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      // Reset signup step when closing
      setSignupStep(1);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>nutriGo</DialogTitle>
          <DialogDescription>
            {activeTab === "login" ? "로그인하거나 새 계정을 만드세요" : 
             signupStep === 1 ? "새 계정을 만드세요" : "개인 정보 및 영양 목표 설정"}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => {
          setActiveTab(v as "login" | "signup");
          setSignupStep(1); // Reset step when switching tabs
        }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">로그인</TabsTrigger>
            <TabsTrigger value="signup">회원가입</TabsTrigger>
          </TabsList>

          {/* 로그인 탭 */}
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">이메일</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">비밀번호</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember-dialog" 
                    checked={loginData.rememberMe}
                    onCheckedChange={(checked) => setLoginData({ ...loginData, rememberMe: checked as boolean })}
                  />
                  <label htmlFor="remember-dialog" className="text-sm cursor-pointer">
                    로그인 유지
                  </label>
                </div>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-sm" 
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/forgot-password');
                  }}
                >
                  비밀번호 찾기
                </Button>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "로그인 중..." : (
                  <>
                    로그인
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">또는</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                type="button"
                onClick={() => handleSocialAuth('google')}
              >
                <Chrome className="w-4 h-4 mr-2" />
                Google로 계속하기
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                type="button"
                onClick={() => handleSocialAuth('kakao')}
              >
                <div className="w-4 h-4 mr-2 bg-yellow-400 rounded-full" />
                카카오로 계속하기
              </Button>
            </div>
          </TabsContent>

          {/* 회원가입 탭 */}
          <TabsContent value="signup" className="space-y-4">
            {signupStep === 1 ? (
              // Step 1: 기본 회원가입 정보
              <>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Step 1 / 2</span>
                </div>

                <form onSubmit={handleSignupStep1Submit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">이름</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="홍길동"
                        value={signupData.name}
                        onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">이메일</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">비밀번호</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="8자 이상"
                        value={signupData.password}
                        onChange={(e) => handleSignupPasswordChange('password', e.target.value)}
                        className="pl-10"
                        required
                        minLength={8}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">비밀번호 확인</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="signup-confirm"
                        type="password"
                        placeholder="비밀번호 재입력"
                        value={signupData.confirmPassword}
                        onChange={(e) => handleSignupPasswordChange('confirmPassword', e.target.value)}
                        className={`pl-10 ${!passwordMatch ? 'border-red-500' : ''}`}
                        required
                      />
                      {signupData.confirmPassword && passwordMatch && (
                        <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-4 h-4" />
                      )}
                    </div>
                    {!passwordMatch && signupData.confirmPassword && (
                      <p className="text-xs text-red-500">비밀번호가 일치하지 않습니다</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="signup-terms"
                        checked={signupData.agreeTerms}
                        onCheckedChange={(checked) => setSignupData({ ...signupData, agreeTerms: checked as boolean })}
                      />
                      <label htmlFor="signup-terms" className="text-sm cursor-pointer">
                        <span className="text-red-500">*</span> 이용약관 동의
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="signup-privacy"
                        checked={signupData.agreePrivacy}
                        onCheckedChange={(checked) => setSignupData({ ...signupData, agreePrivacy: checked as boolean })}
                      />
                      <label htmlFor="signup-privacy" className="text-sm cursor-pointer">
                        <span className="text-red-500">*</span> 개인정보 처리방침 동의
                      </label>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={!passwordMatch}>
                    다음 단계
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">또는</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    type="button"
                    onClick={() => handleSocialAuth('google')}
                  >
                    <Chrome className="w-4 h-4 mr-2" />
                    Google로 시작하기
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    type="button"
                    onClick={() => handleSocialAuth('kakao')}
                  >
                    <div className="w-4 h-4 mr-2 bg-yellow-400 rounded-full" />
                    카카오로 시작하기
                  </Button>
                </div>
              </>
            ) : (
              // Step 2: 개인 정보 & 목표 설정
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSignupStep(1)}
                    className="p-0"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    이전
                  </Button>
                  <span className="text-sm text-muted-foreground">Step 2 / 2</span>
                </div>

                {/* 개인 정보 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-primary" />
                    <h4 className="font-medium">기본 정보 <span className="text-red-500">*</span></h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-sm">
                        연령대 <span className="text-red-500">*</span>
                      </Label>
                      <Select value={signupData.age} onValueChange={(value) => handleSignupDataChange('age', value)}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="20">20대</SelectItem>
                          <SelectItem value="30">30대</SelectItem>
                          <SelectItem value="40">40대</SelectItem>
                          <SelectItem value="50">50대</SelectItem>
                          <SelectItem value="60">60대 이상</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm">
                        성별 <span className="text-red-500">*</span>
                      </Label>
                      <Select value={signupData.gender} onValueChange={(value) => handleSignupDataChange('gender', value)}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">남성</SelectItem>
                          <SelectItem value="female">여성</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 영양 목표 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    <h4 className="font-medium">영양 목표</h4>
                  </div>
                  
                  {/* 칼로리 설정 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-3 h-3 text-orange-500" />
                        <Label className="text-sm">일일 칼로리 목표</Label>
                      </div>
                      <Badge variant="secondary" className="text-xs">{signupData.calories[0]} kcal</Badge>
                    </div>
                    <Slider
                      value={signupData.calories}
                      onValueChange={(value) => handleSignupDataChange('calories', value)}
                      max={3000}
                      min={1200}
                      step={100}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1,200</span>
                      <span>3,000</span>
                    </div>
                  </div>

                  {/* 나트륨 설정 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-3 h-3 text-blue-500" />
                        <Label className="text-sm">일일 나트륨 제한</Label>
                      </div>
                      <Badge variant="secondary" className="text-xs">{signupData.sodium[0]} mg</Badge>
                    </div>
                    <Slider
                      value={signupData.sodium}
                      onValueChange={(value) => handleSignupDataChange('sodium', value)}
                      max={3000}
                      min={1000}
                      step={100}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1,000</span>
                      <span>3,000</span>
                    </div>
                  </div>
                </div>

                {/* 완료/스킵 버튼 */}
                <div className="space-y-2 pt-2">
                  <Button 
                    className="w-full" 
                    onClick={handleFinalSignup}
                    disabled={isLoading || !signupData.age || !signupData.gender}
                  >
                    {isLoading ? "계정 생성 중..." : (
                      <>
                        회원가입 완료
                        <Check className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>

                {!signupData.age || !signupData.gender ? (
                  <p className="text-xs text-center text-red-500">
                    연령대와 성별을 선택해주세요
                  </p>
                ) : (
                  <p className="text-xs text-center text-muted-foreground">
                    영양 목표는 나중에 설정에서 수정할 수 있습니다
                  </p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}