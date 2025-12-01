import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { ArrowRight, Camera, Calendar, Trophy, Bot, TrendingUp, Sparkles, Search, Utensils, Salad } from "lucide-react";
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

export function HomePage() {
  const navigate = useNavigate();
  const [showMealAlert, setShowMealAlert] = useState(false);
  const [mealAdvice, setMealAdvice] = useState({
    title: "",
    message: "",
    suggestions: [] as string[]
  });

  // 페이지 로드 시 전날 기록 체크
  useEffect(() => {
    const checkYesterdayMeal = () => {
      // 오늘 이미 알림을 봤는지 체크
      const today = new Date().toISOString().split('T')[0];
      const lastShown = localStorage.getItem('mealAlertLastShown');
      
      if (lastShown === today) {
        return; // 오늘 이미 봤으면 표시하지 않음
      }

      // 전날 과식했는지 체크 (모의 데이터)
      // 실제로는 캘린더 데이터를 체크해야 함
      const shouldShowAlert = Math.random() > 0.3; // 70% 확률로 표시 (테스트용)
      
      if (shouldShowAlert) {
        const adviceOptions = [
          {
            title: "어제 저녁이 조금 무거웠어요 😅",
            message: "오늘 점심은 튀김보다는 국/덮밥 위주로 가볍게 먹어보는 건 어떨까요?",
            suggestions: ["국밥", "비빔밥", "샐러드", "샌드위치"]
          },
          {
            title: "어제 나트륨이 높았네요 🧂",
            message: "오늘은 짜지 않은 메뉴로 몸을 쉬게 해주면 좋을 것 같아요!",
            suggestions: ["샐러드", "닭가슴살 덮밥", "과일", "요거트"]
          },
          {
            title: "어제 칼로리가 높았어요 🍗",
            message: "오늘 점심은 조금 가볍게 드셔보는 건 어떨까요? 저녁이 더 맛있을 거예요!",
            suggestions: ["샐러드", "죽", "국수", "김밥"]
          }
        ];

        const randomAdvice = adviceOptions[Math.floor(Math.random() * adviceOptions.length)];
        setMealAdvice(randomAdvice);
        setShowMealAlert(true);
      }
    };

    // 컴포넌트 마운트 후 1초 뒤에 체크 (자연스러운 UX)
    const timer = setTimeout(checkYesterdayMeal, 1000);
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

  const weekSummary = {
    avgCalories: 2050,
    redDays: 2,
    challengesActive: 2,
    recordedDays: 5
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
            <Card className="bg-gradient-to-br from-secondary to-emerald-600 text-white border-0">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl flex items-center gap-2">
                    <TrendingUp className="w-6 h-6" />
                    이번 주 한눈에 보기
                  </h2>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/insights')}
                  >
                    자세히 보기
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-sm opacity-90 mb-1">평균 칼로리</p>
                    <p className="text-3xl">{weekSummary.avgCalories}</p>
                    <p className="text-xs opacity-75 mt-1">kcal/일</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-sm opacity-90 mb-1">빨간 날</p>
                    <p className="text-3xl">{weekSummary.redDays}</p>
                    <p className="text-xs opacity-75 mt-1">고칼로리/나트륨</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-sm opacity-90 mb-1">진행 중 챌린지</p>
                    <p className="text-3xl">{weekSummary.challengesActive}</p>
                    <p className="text-xs opacity-75 mt-1">개</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-sm opacity-90 mb-1">기록한 날</p>
                    <p className="text-3xl">{weekSummary.recordedDays}</p>
                    <p className="text-xs opacity-75 mt-1">일</p>
                  </div>
                </div>

                <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-sm mb-2">💡 이번 주 팁</p>
                  <p className="text-sm opacity-90">
                    목요일과 토요일에 고칼로리 음식을 드셨네요. 다음 주에는 이 날들에 조금 더 가볍게 먹어보는 건 어떨까요? 😊
                  </p>
                </div>
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