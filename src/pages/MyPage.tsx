import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Target, User, Activity, Save, Settings, Camera, Calendar, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner@2.0.3";

export function MyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [activity, setActivity] = useState("");

  // 저장된 정보 불러오기
  useEffect(() => {
    // 사용자 기본 정보
    if (user?.age) setAge(user.age);
    if (user?.gender) setGender(user.gender);

    // 기본 정보 불러오기
    const savedGoals = localStorage.getItem('nutritionGoals');
    if (savedGoals) {
      const goals = JSON.parse(savedGoals);
      if (goals.activity) setActivity(goals.activity);
    }
  }, [user]);

  const handleSaveInfo = () => {
    // 로컬 스토리지에 저장
    const info = {
      age, gender, activity
    };
    localStorage.setItem('userInfo', JSON.stringify(info));
    
    // 토스트 메시지 표시
    toast.success("기본 정보가 저장되었어요!");
  };

  const getRecommendedCalories = () => {
    if (!age || !gender || !activity) return null;
    
    const ageNum = parseInt(age);
    let bmr = 0;
    
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * 70) + (4.799 * 170) - (5.677 * ageNum); // 가정: 70kg, 170cm
    } else {
      bmr = 447.593 + (9.247 * 60) + (3.098 * 160) - (4.330 * ageNum); // 가정: 60kg, 160cm
    }
    
    const activityMultiplier = {
      'sedentary': 1.2,
      'light': 1.375,
      'moderate': 1.55,
      'active': 1.725,
      'very_active': 1.9
    }[activity] || 1.2;
    
    return Math.round(bmr * activityMultiplier);
  };

  const recommendedCal = getRecommendedCalories();

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
                      {user?.email || '이메일 없음'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>이름</Label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {user?.name || '이름 없음'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 기본 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-6 h-6 text-primary" />
                  기본 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>연령대</Label>
                    <Select value={age} onValueChange={setAge}>
                      <SelectTrigger>
                        <SelectValue placeholder="선택하세요" />
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
                    <Label>성별</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger>
                        <SelectValue placeholder="선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">남성</SelectItem>
                        <SelectItem value="female">여성</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>활동량</Label>
                    <Select value={activity} onValueChange={setActivity}>
                      <SelectTrigger>
                        <SelectValue placeholder="선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">좌식 생활</SelectItem>
                        <SelectItem value="light">가벼운 활동</SelectItem>
                        <SelectItem value="moderate">보통 활동</SelectItem>
                        <SelectItem value="active">활발한 활동</SelectItem>
                        <SelectItem value="very_active">매우 활발</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {recommendedCal && (
                  <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-5 h-5 text-green-700" />
                      <span className="text-green-900">권장 칼로리</span>
                    </div>
                    <p className="text-green-800">
                      입력하신 정보를 바탕으로 일일 권장 칼로리는 <strong>{recommendedCal} kcal</strong>입니다.
                    </p>
                    <p className="text-sm text-green-700 mt-2">
                      💡 이 정보를 활용하여 챌린지 페이지에서 칼로리 목표 챌린지를 만들어보세요!
                    </p>
                  </div>
                )}

                <Button onClick={handleSaveInfo} className="w-full" size="lg">
                  <Save className="w-4 h-4 mr-2" />
                  기본 정보 저장
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