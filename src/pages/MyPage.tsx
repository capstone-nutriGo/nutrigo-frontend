import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Target, User, Activity, Save, Settings, Camera, Calendar, Trophy, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner@2.0.3";
import { getProfile, updateProfile, updateSettings, type UserProfileResponse, type Gender, type DefaultMode } from "../api/user";
import { handleApiError, isUnauthorizedError } from "../api/errorHandler";

export function MyPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // 프로필 정보
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [nickname, setNickname] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [birthday, setBirthday] = useState("");
  
  // 설정 정보
  const [defaultMode, setDefaultMode] = useState<DefaultMode | "">("");
  const [eveningCoach, setEveningCoach] = useState(false);
  const [challengeReminder, setChallengeReminder] = useState(false);

  // 프로필 정보 불러오기
  useEffect(() => {
    if (!isLoggedIn) {
      toast.error("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getProfile();
        setProfile(data);
        
        // 폼에 데이터 채우기
        if (data.data) {
          setNickname(data.data.nickname || "");
          setName(data.data.name || "");
          setGender(data.data.gender || "");
          setBirthday(data.data.birthday || "");
          setDefaultMode(data.data.preferences?.defaultMode || "");
          
          // 설정 정보는 로컬 스토리지에서 불러오기 (백엔드에 설정 조회 API가 없음)
          const savedSettings = localStorage.getItem('userSettings');
          if (savedSettings) {
            try {
              const settings = JSON.parse(savedSettings);
              setEveningCoach(settings.eveningCoach ?? false);
              setChallengeReminder(settings.challengeReminder ?? false);
            } catch (e) {
              console.error("설정 불러오기 실패:", e);
            }
          }
        }
      } catch (error: any) {
        console.error("프로필 조회 실패:", error);
        const errorInfo = handleApiError(error);
        if (isUnauthorizedError(error)) {
          // 401 에러는 인터셉터에서 이미 처리됨
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isLoggedIn, navigate]);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await updateProfile({
        nickname: nickname || undefined,
        name: name || undefined,
        gender: gender || undefined,
        birthday: birthday || undefined,
      });
      
      // 프로필 다시 불러오기
      const updatedProfile = await getProfile();
      setProfile(updatedProfile);
      
      toast.success("프로필이 저장되었어요!");
    } catch (error: any) {
      console.error("프로필 저장 실패:", error);
      const errorInfo = handleApiError(error);
      if (isUnauthorizedError(error)) {
        // 401 에러는 인터셉터에서 이미 처리됨
        return;
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    // 토큰 확인
    const tokenData = localStorage.getItem("tokenData");
    if (!tokenData) {
      toast.error("로그인이 필요합니다. 다시 로그인해주세요.");
      navigate("/login");
      return;
    }

    try {
      const parsed = JSON.parse(tokenData);
      if (!parsed.accessToken) {
        toast.error("인증 토큰이 없습니다. 다시 로그인해주세요.");
        navigate("/login");
        return;
      }
    } catch (error) {
      toast.error("토큰 정보를 읽을 수 없습니다. 다시 로그인해주세요.");
      navigate("/login");
      return;
    }

    try {
      setSaving(true);
      await updateSettings({
        notification: {
          eveningCoach,
          challengeReminder,
        },
        defaultMode: defaultMode || undefined,
      });
      
      // 로컬 스토리지에도 저장
      localStorage.setItem('userSettings', JSON.stringify({
        eveningCoach,
        challengeReminder,
      }));
      
      toast.success("설정이 저장되었어요!");
    } catch (error: any) {
      console.error("설정 저장 실패:", error);
      const errorInfo = handleApiError(error);
      if (isUnauthorizedError(error)) {
        // 401 에러는 인터셉터에서 이미 처리됨
        return;
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-stone-50 to-lime-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">프로필 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-stone-50 to-lime-50/30">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl mb-4">
              마이페이지
            </h1>
            <p className="text-lg text-muted-foreground">
              개인 정보를 관리하세요
            </p>
          </div>

          <div className="space-y-8">
            {/* 사용자 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-6 h-6 text-primary" />
                  사용자 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>이메일</Label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {profile?.data.email || '이메일 없음'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>닉네임</Label>
                    <Input
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="닉네임을 입력하세요"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>이름</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="이름을 입력하세요"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>성별</Label>
                    <Select value={gender} onValueChange={(value) => setGender(value as Gender)}>
                      <SelectTrigger>
                        <SelectValue placeholder="선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">남성</SelectItem>
                        <SelectItem value="female">여성</SelectItem>
                        <SelectItem value="other">기타</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>생년월일</Label>
                    <Input
                      type="date"
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleSaveProfile} 
                  className="w-full" 
                  size="lg"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      프로필 저장
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* 알림 설정 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-6 h-6 text-primary" />
                  알림 설정
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-base">저녁 코치 알림</Label>
                      <p className="text-sm text-muted-foreground">
                        저녁 식사 전 영양 코칭을 받아보세요
                      </p>
                    </div>
                    <Select 
                      value={eveningCoach ? "true" : "false"} 
                      onValueChange={(value) => setEveningCoach(value === "true")}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">켜기</SelectItem>
                        <SelectItem value="false">끄기</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-base">챌린지 리마인더</Label>
                      <p className="text-sm text-muted-foreground">
                        챌린지 진행 상황을 알려드려요
                      </p>
                    </div>
                    <Select 
                      value={challengeReminder ? "true" : "false"} 
                      onValueChange={(value) => setChallengeReminder(value === "true")}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">켜기</SelectItem>
                        <SelectItem value="false">끄기</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={handleSaveSettings} 
                  className="w-full" 
                  size="lg"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      설정 저장
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* 빠른 메뉴 */}
            <Card>
              <CardHeader>
                <CardTitle>빠른 메뉴</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-2 hover:bg-orange-50 hover:border-orange-300"
                    onClick={() => navigate("/analyze")}
                  >
                    <Camera className="w-6 h-6 text-primary" />
                    <span>사진 기록</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-2 hover:bg-green-50 hover:border-green-300"
                    onClick={() => navigate("/insights")}
                  >
                    <Calendar className="w-6 h-6 text-secondary" />
                    <span>나의 캘린더</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-2 hover:bg-amber-50 hover:border-amber-300"
                    onClick={() => navigate("/challenges")}
                  >
                    <Trophy className="w-6 h-6 text-accent" />
                    <span>챌린지</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 영양 목표는 이제 챌린지에서 */}
            <Card className="bg-gradient-to-br from-green-50/50 via-lime-50 to-orange-50 border-green-200">
              <CardContent className="p-8 text-center">
                <Target className="w-16 h-16 mx-auto mb-4 text-secondary" />
                <h3 className="text-xl mb-2 text-green-900">
                  영양 목표 설정이 필요하신가요?
                </h3>
                <p className="text-green-800 mb-4">
                  챌린지 페이지에서 칼로리, 나트륨, 단백질 등<br />
                  다양한 영양 목표를 챌린지로 만들어 관리할 수 있어요! 😊
                </p>
                <Button 
                  onClick={() => navigate('/challenges')}
                  className="bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90"
                >
                  <Target className="w-4 h-4 mr-2" />
                  챌린지 둘러보기
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}