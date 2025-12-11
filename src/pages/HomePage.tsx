import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { ArrowRight, Camera, Calendar, Trophy, Bot, TrendingUp, Sparkles, Search, Utensils, Salad, Zap, Flame, Target, CheckCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { fetchCalendar, fetchDayMeals, getWeeklySummary } from "../api/insight";
import { getProgress } from "../api/challenge";

export function HomePage() {
  const navigate = useNavigate();
  const [showMealAlert, setShowMealAlert] = useState(false);
  const [mealAdvice, setMealAdvice] = useState({
    title: "",
    message: "",
    suggestions: [] as string[]
  });
  const [weekSummary, setWeekSummary] = useState({
    avgCalories: 0,
    redDays: 0,
    challengesActive: 0,
    recordedDays: 0
  });
  const [isLoadingWeekSummary, setIsLoadingWeekSummary] = useState(true);
  const [weeklySummaryData, setWeeklySummaryData] = useState<any>(null);
  const [weeklyTip, setWeeklyTip] = useState<string>("");

  // 페이지 로드 시 이전 식사 기록 체크
  useEffect(() => {
    const checkPreviousMeal = async () => {
      // 오늘 이미 알림을 봤는지 체크
      const today = new Date().toISOString().split('T')[0];
      const lastShown = localStorage.getItem('mealAlertLastShown');
      
      if (lastShown === today) {
        return; // 오늘 이미 봤으면 표시하지 않음
      }

      try {
        const now = new Date();
        const currentHour = now.getHours();
        
        let targetDate: string;
        let targetMealTime: "DINNER" | "LUNCH" | "BREAKFAST";
        let timeContext: string;
        
        // 시간대에 따라 확인할 식사 결정 (모든 끼니에 알림)
        if (currentHour >= 6 && currentHour < 11) {
          // 아침 시간대: 전날 저녁 확인
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          targetDate = yesterday.toISOString().split('T')[0];
          targetMealTime = "DINNER";
          timeContext = "어제 저녁";
        } else if (currentHour >= 11 && currentHour < 15) {
          // 점심 시간대: 당일 아침 확인
          targetDate = today;
          targetMealTime = "BREAKFAST";
          timeContext = "오늘 아침";
        } else if (currentHour >= 17) {
          // 저녁 시간대: 당일 점심 확인
          targetDate = today;
          targetMealTime = "LUNCH";
          timeContext = "오늘 점심";
        } else {
          // 다른 시간대는 알림 표시 안 함
          return;
        }

        // 해당 날짜의 식사 데이터 가져오기
        const dayMealsResponse = await fetchDayMeals(targetDate);
        
        if (!dayMealsResponse.data || !dayMealsResponse.data.meals || dayMealsResponse.data.meals.length === 0) {
          return; // 데이터가 없으면 알림 표시 안 함
        }

        // 해당 시간대의 식사 찾기
        const targetMeals = dayMealsResponse.data.meals.filter(
          meal => meal.mealTime === targetMealTime
        );

        if (targetMeals.length === 0) {
          return; // 해당 시간대 식사가 없으면 알림 표시 안 함
        }

        // 식사 데이터 분석
        const dayData = dayMealsResponse.data;
        const totalKcal = dayData.totalKcal || 0;
        const totalSodiumMg = dayData.totalSodiumMg || 0;
        
        // 기준값 설정 (일반적인 권장량 기준)
        const highCalorieThreshold = 2500; // 하루 권장 칼로리
        const highSodiumThreshold = 2000; // 하루 권장 나트륨 (mg)
        
        // 조언 메시지 생성
        let advice: { title: string; message: string; suggestions: string[] } | null = null;

        if (totalSodiumMg > highSodiumThreshold) {
          advice = {
            title: `${timeContext}이(가) 조금 짜셨네요 🧂`,
            message: "오늘은 나트륨이 낮은 메뉴로 몸을 쉬게 해주면 좋을 것 같아요!",
            suggestions: ["샐러드", "닭가슴살 덮밥", "과일", "요거트"]
          };
        } else if (totalKcal > highCalorieThreshold) {
          advice = {
            title: `${timeContext}이(가) 조금 무거웠어요 😅`,
            message: currentHour >= 17 
              ? "저녁은 조금 가볍게 드셔보는 건 어떨까요?"
              : currentHour >= 11 && currentHour < 15
              ? "오늘 점심은 튀김보다는 국/덮밥 위주로 가볍게 먹어보는 건 어떨까요?"
              : "오늘은 나트륨이 낮은 메뉴로 몸을 쉬게 해주면 좋을 것 같아요!",
            suggestions: currentHour >= 17 
              ? ["국밥", "비빔밥", "샐러드", "죽"]
              : currentHour >= 11 && currentHour < 15
              ? ["국밥", "비빔밥", "샐러드", "샌드위치"]
              : ["샐러드", "닭가슴살 덮밥", "과일", "요거트"]
          };
        } else {
          // 칼로리와 나트륨이 모두 적정 범위면 알림 표시 안 함
          return;
        }

        if (advice) {
          setMealAdvice(advice);
          setShowMealAlert(true);
        }
      } catch (error) {
        console.error("식사 데이터 확인 중 오류:", error);
        // 에러 발생 시 알림 표시 안 함
      }
    };

    // 컴포넌트 마운트 후 1초 뒤에 체크 (자연스러운 UX)
    const timer = setTimeout(checkPreviousMeal, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleAlertClose = () => {
    // 오늘 날짜 저장
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('mealAlertLastShown', today);
    setShowMealAlert(false);
  };

  const quickActions = [
    {
      icon: Camera,
      title: "사진으로 기록하기",
      description: "배달앱 스크린샷 찍고 영양소 자동 분석",
      color: "from-primary to-orange-600",
      path: "/analyze"
    },
    {
      icon: Search,
      title: "주문 전 분석하기",
      description: "메뉴 미리 분석하고 더 나은 선택",
      color: "from-secondary to-green-700",
      path: "/pre-order"
    },
    {
      icon: Calendar,
      title: "내 캘린더 보기",
      description: "이번 주 식습관 확인하고 인사이트 받기",
      color: "from-accent to-amber-700",
      path: "/insights"
    },
    {
      icon: Trophy,
      title: "챌린지 도전하기",
      description: "가벼운 목표로 습관 만들기",
      color: "from-emerald-500 to-secondary",
      path: "/challenges"
    }
  ];

  // 이번 주 데이터 로드
  useEffect(() => {
    const loadWeekSummary = async () => {
      try {
        setIsLoadingWeekSummary(true);
        
        // 오늘 날짜를 기준으로 주간 요약 조회
        const today = new Date();
        const baseDate = today.toISOString().split('T')[0]; // "YYYY-MM-DD"
        
        // 병렬로 데이터 가져오기
        const [weeklySummaryRes, progressRes] = await Promise.all([
          getWeeklySummary(baseDate).catch(() => null), // 에러 발생 시 null 반환
          getProgress().catch(() => null)
        ]);
        
        // 주간 요약 API에서 데이터 가져오기
        if (weeklySummaryRes && weeklySummaryRes.data) {
          const summary = weeklySummaryRes.data.summary;
          const trends = weeklySummaryRes.data.trends;
          
          // 평균 칼로리 계산 (일일 평균)
          const avgCalories = summary.averageKcalPerMeal 
            ? Math.round(summary.averageKcalPerMeal) 
            : 0;
          
          // 빨간 날 개수 계산 (trends에서 dayColor가 "RED"인 날)
          const redDays = trends.days.filter(day => day.dayColor === "RED").length;
          
          // 기록한 날 개수 (trends에 데이터가 있는 날)
          const recordedDays = trends.days.filter(day => day.totalKcal !== null).length;
          
          // 진행 중 챌린지 개수
          const challengesActive = progressRes?.data?.inProgress?.length || 0;
          
          setWeekSummary({
            avgCalories,
            redDays,
            challengesActive,
            recordedDays
          });
          
          // 주간 요약 데이터 저장 (팁 생성용)
          setWeeklySummaryData(weeklySummaryRes.data);
          
          // 동적 팁 생성
          generateWeeklyTip(weeklySummaryRes.data);
        } else {
          // API 실패 시 기존 로직으로 폴백
          const dayOfWeek = today.getDay();
          const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
          const monday = new Date(today);
          monday.setDate(today.getDate() + mondayOffset);
          monday.setHours(0, 0, 0, 0);
          
          const sunday = new Date(monday);
          sunday.setDate(monday.getDate() + 6);
          sunday.setHours(23, 59, 59, 999);
          
          const startDate = monday.toISOString().split('T')[0];
          const endDate = sunday.toISOString().split('T')[0];
          
          const [calendarRes, fallbackProgressRes] = await Promise.all([
            fetchCalendar(startDate, endDate).catch(() => null),
            progressRes || getProgress().catch(() => null)
          ]);
          
          if (calendarRes) {
            const calendarDays = calendarRes.data.days;
            const dayMealsPromises = calendarDays.map(day => 
              fetchDayMeals(day.date).catch(() => null)
            );
            const dayMealsResults = await Promise.all(dayMealsPromises);
            
            let totalCalories = 0;
            let recordedDaysCount = 0;
            let redDaysCount = 0;
            
            dayMealsResults.forEach((result, index) => {
              if (result && result.data.totalKcal !== null && result.data.totalKcal !== undefined) {
                totalCalories += result.data.totalKcal;
                recordedDaysCount++;
              }
              
              if (calendarDays[index]?.highlight === "BAD") {
                redDaysCount++;
              }
            });
            
            const avgCalories = recordedDaysCount > 0 
              ? Math.round(totalCalories / recordedDaysCount) 
              : 0;
            
            const challengesActive = fallbackProgressRes?.data?.inProgress?.length || 0;
            
            setWeekSummary({
              avgCalories,
              redDays: redDaysCount,
              challengesActive,
              recordedDays: recordedDaysCount
            });
          }
        }
      } catch (error) {
        console.error("주간 요약 데이터 로드 실패:", error);
        // 에러 발생 시 기본값 유지
      } finally {
        setIsLoadingWeekSummary(false);
      }
    };
    
    loadWeekSummary();
  }, []);

  // 주간 팁 생성 함수
  const generateWeeklyTip = (data: any) => {
    if (!data || !data.trends || !data.trends.days || data.trends.days.length === 0) {
      setWeeklyTip("식사 기록을 시작하면 맞춤형 팁을 제공해드릴게요! 📝");
      return;
    }

    const days = data.trends.days;
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    
    // 빨간 날(고칼로리/고나트륨) 찾기
    const redDays = days
      .map((day: any, index: number) => ({
        dayName: dayNames[new Date(day.date).getDay()],
        date: day.date,
        totalKcal: day.totalKcal,
        dayColor: day.dayColor,
      }))
      .filter((day: any) => day.dayColor === "RED" && day.totalKcal !== null);

    // 과식한 날이 있는 경우
    if (redDays.length > 0) {
      const redDayNames = redDays.map((d: any) => d.dayName).join(", ");
      setWeeklyTip(
        `${redDayNames}요일에 고칼로리 음식을 드셨네요. 다음 주에는 이 날들에 조금 더 가볍게 먹어보는 건 어떨까요? 😊`
      );
      return;
    }

    // 좋은 날이 많은 경우
    const goodDays = days.filter((day: any) => day.dayColor === "GREEN").length;
    if (goodDays >= days.length * 0.7) {
      setWeeklyTip(
        "이번 주 식습관이 정말 좋아요! 계속 이렇게 유지해보세요 💚"
      );
      return;
    }

    // 평균 칼로리가 높은 경우
    const avgKcal = data.summary?.averageKcalPerMeal;
    if (avgKcal && avgKcal > 2500) {
      setWeeklyTip(
        "평균 칼로리가 조금 높네요. 식사량을 조금 줄이거나 가벼운 메뉴를 선택해보세요! 🥗"
      );
      return;
    }

    // 저나트륨 날이 많은 경우 (긍정적)
    const lowSodiumDays = data.summary?.lowSodiumDays || 0;
    if (lowSodiumDays >= days.length * 0.5) {
      setWeeklyTip(
        "나트륨 섭취를 잘 관리하고 계시네요! 건강한 식습관을 유지하고 있어요 👍"
      );
      return;
    }

    // 기본 팁
    setWeeklyTip(
      "규칙적인 식사 시간을 유지하고 균형 잡힌 식단을 챙겨보세요! 🌟"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-stone-50 to-lime-50/30">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* 웰컴 섹션 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h1 className="text-4xl mb-3">환영해요! 👋</h1>
            <p className="text-xl text-muted-foreground">
              오늘도 건강한 선택을 도와드릴게요
            </p>
          </motion.div>

          {/* 이번 주 요약 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-12"
          >
            <Card className="bg-gradient-to-br from-secondary via-emerald-500 to-emerald-600 text-white border-0 shadow-2xl">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-4xl font-bold flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-7 h-7" />
                      </div>
                      이번 주 한눈에 보기
                    </h2>
                    <p className="text-white/80 text-base ml-14">이번 주 식습관 요약</p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/insights')}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30"
                  >
                    자세히 보기
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                {isLoadingWeekSummary ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-white/25 backdrop-blur-md rounded-xl p-5 border border-white/30">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                              <Loader2 className="w-7 h-7 text-white/50 animate-spin" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="h-5 bg-white/20 rounded mb-2 animate-pulse"></div>
                            <div className="h-12 bg-white/20 rounded mb-2 animate-pulse"></div>
                            <div className="h-4 bg-white/20 rounded w-2/3 animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white/25 backdrop-blur-md rounded-xl p-5 border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105 cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                            <Zap className="w-7 h-7 text-yellow-300" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-base opacity-90 font-semibold">평균 칼로리</p>
                            <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                          </div>
                          <p className="text-5xl font-bold mb-1">{weekSummary.avgCalories.toLocaleString()}</p>
                          <p className="text-sm opacity-75">kcal/일</p>
                        </div>
                      </div>
                    </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/25 backdrop-blur-md rounded-xl p-5 border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                          <Flame className="w-7 h-7 text-red-300" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-base opacity-90 font-semibold">빨간 날</p>
                          <div className={`w-2.5 h-2.5 rounded-full ${weekSummary.redDays <= 2 ? 'bg-green-400' : weekSummary.redDays <= 4 ? 'bg-yellow-400' : 'bg-red-400'} animate-pulse`}></div>
                        </div>
                        <p className="text-5xl font-bold mb-1">{weekSummary.redDays}</p>
                        <p className="text-sm opacity-75">고칼로리/나트륨</p>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/25 backdrop-blur-md rounded-xl p-5 border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105 cursor-pointer"
                    onClick={() => navigate('/challenges')}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                          <Trophy className="w-7 h-7 text-amber-300" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-base opacity-90 font-semibold">진행 중 챌린지</p>
                          <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse"></div>
                        </div>
                        <p className="text-5xl font-bold mb-1">{weekSummary.challengesActive}</p>
                        <p className="text-sm opacity-75">개</p>
                      </div>
                    </div>
                  </motion.div>
                  
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                      className="bg-white/25 backdrop-blur-md rounded-xl p-5 border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105 cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-7 h-7 text-green-300" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-base opacity-90 font-semibold">기록한 날</p>
                            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></div>
                          </div>
                          <p className="text-5xl font-bold mb-1">{weekSummary.recordedDays}</p>
                          <p className="text-sm opacity-75 mb-2">일 / 7일</p>
                          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-white/60 rounded-full transition-all duration-500"
                              style={{ width: `${(weekSummary.recordedDays / 7) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-yellow-400/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-yellow-200" />
                    </div>
                    <div>
                      <p className="text-base font-semibold mb-2">💡 이번 주 팁</p>
                      <p className="text-base opacity-90 leading-relaxed">
                        {isLoadingWeekSummary ? (
                          "팁을 생성하는 중..."
                        ) : weeklyTip || (
                          "식사 기록을 시작하면 맞춤형 팁을 제공해드릴게요! 📝"
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 빠른 액션 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-2xl mb-6">뭘 도와드릴까요?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {quickActions.map((action, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 h-full"
                    onClick={() => navigate(action.path)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center flex-shrink-0`}>
                          <action.icon className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg mb-2">{action.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {action.description}
                          </p>
                          <Button variant="ghost" size="sm" className="p-0 h-auto">
                            시작하기
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* AI 코치와 대화하기 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            <Card className="bg-gradient-to-br from-green-50 via-lime-50 to-orange-50 border-green-200">
              <CardContent className="pt-8 pb-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl mb-2">
                      NutriBot과 대화해보세요
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      "어제 너무 짜게 먹었는데 오늘 저녁 뭐 먹을까?" 같은 질문을 편하게 물어보세요!
                    </p>
                    <Button
                      onClick={() => navigate('/nutribot')}
                      className="bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI 코치와 대화하기
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 도움말 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="mt-12 text-center"
          >
            <Card className="bg-lime-50 border-green-200">
              <CardContent className="pt-6 pb-6">
                <p className="text-sm text-green-900 mb-2">
                  💡 <strong>처음 사용하시나요?</strong>
                </p>
                <p className="text-sm text-green-700">
                  먼저 배달앱 주문 스크린샷을 찍어서 업로드해보세요. AI가 자동으로 분석하고 캘린더에 기록해드려요!
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* 식사 알림 */}
          <AlertDialog open={showMealAlert} onOpenChange={setShowMealAlert}>
            <AlertDialogContent className="bg-gradient-to-br from-green-50 via-lime-50/50 to-orange-50/30 border-2 border-green-300 max-w-md">
              <AlertDialogHeader>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-secondary to-emerald-600 rounded-full flex items-center justify-center">
                    <Salad className="w-8 h-8 text-white" />
                  </div>
                </div>
                <AlertDialogTitle className="text-center text-xl">
                  {mealAdvice.title}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-center text-base pt-2">
                  {mealAdvice.message}
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              {mealAdvice.suggestions.length > 0 && (
                <div className="py-4">
                  <p className="text-sm text-muted-foreground text-center mb-3">
                    이런 메뉴는 어떠세요?
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {mealAdvice.suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-3 py-1.5 bg-white border-2 border-green-200 rounded-full text-sm text-green-700"
                      >
                        🍽️ {suggestion}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <AlertDialogFooter className="sm:justify-center">
                <AlertDialogAction
                  onClick={handleAlertClose}
                  className="bg-gradient-to-r from-secondary to-emerald-600 hover:from-secondary/90 hover:to-emerald-600/90 w-full sm:w-auto"
                >
                  알겠어요! 👍
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}