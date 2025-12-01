import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { 
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  Flame,
  Droplets,
  Award,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  UtensilsCrossed,
  X
} from "lucide-react";
import { 
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { motion } from "motion/react";

// 모의 캘린더 데이터 (11월 데이터)
const calendarData = [
  { date: 1, calories: 1800, sodium: 2000, level: "green", meals: [
    { name: "비빔밥", restaurant: "한식당", time: "12:30", calories: 650, sodium: 1400 }
  ]},
  { date: 2, calories: 1650, sodium: 1800, level: "green", meals: [
    { name: "샐러드", restaurant: "샐러디", time: "13:00", calories: 450, sodium: 800 }
  ]},
  { date: 3, calories: 2400, sodium: 3200, level: "red", meals: [
    { name: "치킨", restaurant: "치킨플러스", time: "19:30", calories: 1850, sodium: 3200 },
    { name: "떡볶이", restaurant: "국대떡볶이", time: "15:00", calories: 550, sodium: 1800 }
  ]},
  { date: 4, calories: 1950, sodium: 2100, level: "green", meals: [
    { name: "연어 덮밥", restaurant: "스시야", time: "12:00", calories: 780, sodium: 1100 }
  ]},
  { date: 5, calories: 1700, sodium: 1900, level: "green", meals: [
    { name: "토마토 파스타", restaurant: "파스타 하우스", time: "13:30", calories: 520, sodium: 1200 }
  ]},
  { date: 6, calories: 2600, sodium: 3500, level: "red", meals: [
    { name: "삼겹살", restaurant: "돼지왕", time: "18:00", calories: 1400, sodium: 2200 },
    { name: "치즈볼", restaurant: "돼지왕", time: "18:00", calories: 600, sodium: 1300 }
  ]},
  { date: 7, calories: 2100, sodium: 2400, level: "yellow", meals: [
    { name: "짜장면", restaurant: "중화요리", time: "19:00", calories: 950, sodium: 2400 }
  ]},
  { date: 8, calories: 1850, sodium: 2000, level: "green", meals: [
    { name: "김치찌개", restaurant: "백반집", time: "12:30", calories: 650, sodium: 2000 }
  ]},
  { date: 9, calories: 1900, sodium: 2100, level: "green", meals: [
    { name: "불고기 덮밥", restaurant: "한식당", time: "13:00", calories: 720, sodium: 1800 }
  ]},
  { date: 10, calories: 2500, sodium: 3100, level: "red", meals: [
    { name: "피자", restaurant: "피자헛", time: "20:00", calories: 1600, sodium: 3100 }
  ]},
  { date: 11, calories: 1750, sodium: 1850, level: "green", meals: [
    { name: "쌀국수", restaurant: "베트남 포", time: "12:00", calories: 580, sodium: 1850 }
  ]},
  { date: 12, calories: 2200, sodium: 2500, level: "yellow", meals: [
    { name: "돈까스", restaurant: "정돈", time: "13:00", calories: 920, sodium: 2500 }
  ]},
  { date: 13, calories: 1800, sodium: 1950, level: "green", meals: [
    { name: "샐러드 볼", restaurant: "샐러디", time: "12:30", calories: 480, sodium: 950 }
  ]},
  { date: 14, calories: 1900, sodium: 2050, level: "green", meals: [
    { name: "연어 샐러드", restaurant: "스시야", time: "13:30", calories: 620, sodium: 1100 }
  ]},
  { date: 15, calories: 2300, sodium: 2700, level: "yellow", meals: [
    { name: "김치찌개", restaurant: "백반집", time: "18:30", calories: 950, sodium: 2700 }
  ]},
  { date: 16, calories: 1850, sodium: 2000, level: "green", meals: [
    { name: "비빔밥", restaurant: "한식당", time: "12:00", calories: 650, sodium: 1400 }
  ]},
  { date: 17, calories: 2700, sodium: 3600, level: "red", meals: [
    { name: "양념치킨", restaurant: "치킨플러스", time: "19:00", calories: 1900, sodium: 3600 }
  ]},
  { date: 18, calories: 1950, sodium: 2100, level: "green", meals: [
    { name: "해물 칼국수", restaurant: "칼국수집", time: "12:30", calories: 720, sodium: 2100 }
  ]},
  { date: 19, calories: 1800, sodium: 1900, level: "green", meals: [
    { name: "토마토 파스타", restaurant: "파스타 하우스", time: "13:00", calories: 520, sodium: 1200 }
  ]},
  { date: 20, calories: 2100, sodium: 2400, level: "yellow", meals: [
    { name: "불고기 백반", restaurant: "한식당", time: "12:00", calories: 850, sodium: 2400 }
  ]},
  { date: 21, calories: 1900, sodium: 2000, level: "green", meals: [
    { name: "연어 포케", restaurant: "포케샵", time: "13:30", calories: 680, sodium: 1200 }
  ]},
  { date: 22, calories: 1850, sodium: 2050, level: "green", meals: [
    { name: "샐러드", restaurant: "샐러디", time: "12:30", calories: 450, sodium: 900 }
  ]},
  { date: 23, calories: 2400, sodium: 3000, level: "red", meals: [
    { name: "짬뽕", restaurant: "중화요리", time: "19:00", calories: 1200, sodium: 3000 }
  ]},
  { date: 24, calories: 2600, sodium: 3400, level: "red", meals: [
    { name: "치킨", restaurant: "치킨플러스", time: "19:30", calories: 1850, sodium: 3200 },
    { name: "콜라", restaurant: "치킨플러스", time: "19:30", calories: 200, sodium: 200 }
  ]},
  { date: 25, calories: 1750, sodium: 1800, level: "green", meals: [
    { name: "빔밥", restaurant: "한식당", time: "12:30", calories: 650, sodium: 1400 }
  ]},
  { date: 26, calories: 1900, sodium: 2100, level: "green", meals: [
    { name: "연어 덮밥", restaurant: "스시야", time: "13:00", calories: 780, sodium: 1100 }
  ]},
  { date: 27, calories: 2200, sodium: 2600, level: "yellow", meals: [
    { name: "까르보나라 파스타", restaurant: "파스타 하우스", time: "19:00", calories: 980, sodium: 2100 }
  ]},
];

// 주간 보고서 데이터
const weeklyData = [
  { day: "월", calories: 1900, sodium: 2100 },
  { day: "화", calories: 1850, sodium: 2050 },
  { day: "수", calories: 2400, sodium: 3000 },
  { day: "목", calories: 2600, sodium: 3400 },
  { day: "금", calories: 1750, sodium: 1800 },
  { day: "토", calories: 1900, sodium: 2100 },
  { day: "일", calories: 2200, sodium: 2600 },
];

const topCategories = [
  { name: "치킨/튀김", count: 5, percentage: 28 },
  { name: "한식", count: 4, percentage: 22 },
  { name: "중식", count: 3, percentage: 17 },
];

export function InsightsPage() {
  const [currentMonth, setCurrentMonth] = useState(11); // 11월
  const [currentYear, setCurrentYear] = useState(2025);
  const [selectedDate, setSelectedDate] = useState<typeof calendarData[0] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDateClick = (day: typeof calendarData[0]) => {
    setSelectedDate(day);
    setDialogOpen(true);
  };

  const getDateColor = (level: string) => {
    switch (level) {
      case "green":
        return "bg-green-100 text-green-700 hover:bg-green-200";
      case "yellow":
        return "bg-yellow-100 text-yellow-700 hover:bg-yellow-200";
      case "red":
        return "bg-red-100 text-red-700 hover:bg-red-200";
      default:
        return "bg-gray-50 text-gray-400";
    }
  };

  // 주간 통계
  const weeklyAvgCalories = Math.round(
    weeklyData.reduce((sum, d) => sum + d.calories, 0) / weeklyData.length
  );
  const weeklyAvgSodium = Math.round(
    weeklyData.reduce((sum, d) => sum + d.sodium, 0) / weeklyData.length
  );
  const redDaysCount = calendarData.filter(d => d.level === "red").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-stone-50 to-lime-50/30">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-6xl mx-auto">
            {/* 헤더 */}
            <div className="text-center mb-12">
              <h1 className="text-4xl mb-4">나의 식습관 캘린더</h1>
              <p className="text-lg text-muted-foreground">
                매일의 식습관을 한눈에 확인하고 건강한 습관을 만들어가요 📅
              </p>
            </div>

            {/* 캘린더 */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    {currentYear}년 {currentMonth}월
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (currentMonth === 1) {
                          setCurrentMonth(12);
                          setCurrentYear(currentYear - 1);
                        } else {
                          setCurrentMonth(currentMonth - 1);
                        }
                      }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (currentMonth === 12) {
                          setCurrentMonth(1);
                          setCurrentYear(currentYear + 1);
                        } else {
                          setCurrentMonth(currentMonth + 1);
                        }
                      }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  하루 칼로리·나트륨 상태를 색상으로 표시해요
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* 범례 */}
                <div className="flex gap-4 mb-6 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-400"></div>
                    <span className="text-sm">적정</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                    <span className="text-sm">주의</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-400"></div>
                    <span className="text-sm">과식 또는 고나트륨</span>
                  </div>
                </div>

                {/* 요일 헤더 */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                    <div key={day} className="text-center text-sm text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* 날짜 그리드 */}
                <div className="grid grid-cols-7 gap-2">
                  {/* 빈 칸 (11월 1일이 금요일이므로 5칸) */}
                  {[...Array(5)].map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square"></div>
                  ))}
                  
                  {/* 실제 날짜 */}
                  {calendarData.map((day) => (
                    <motion.button
                      key={day.date}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-colors ${getDateColor(day.level)} cursor-pointer`}
                      onClick={() => handleDateClick(day)}
                    >
                      <span className="text-sm mb-1">{day.date}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        day.level === "green" ? "bg-green-500" :
                        day.level === "yellow" ? "bg-yellow-500" :
                        "bg-red-500"
                      }`}></div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 주간 보고서 */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* 이번 주 요약 */}
              <Card>
                <CardHeader>
                  <CardTitle>이번 주 요약</CardTitle>
                  <CardDescription>
                    11월 21일 ~ 11월 27일
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 평균 칼로리 */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-600" />
                        <span className="text-sm text-muted-foreground">평균 칼로리</span>
                      </div>
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        하루 평균
                      </Badge>
                    </div>
                    <p className="text-3xl text-orange-600">
                      {weeklyAvgCalories}
                      <span className="text-sm ml-1">kcal</span>
                    </p>
                  </div>

                  {/* 평균 나트륨 */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-muted-foreground">평균 나트륨</span>
                      </div>
                      <Badge variant="outline" className="text-blue-600 border-blue-300">
                        하루 평균
                      </Badge>
                    </div>
                    <p className="text-3xl text-blue-600">
                      {weeklyAvgSodium}
                      <span className="text-sm ml-1">mg</span>
                    </p>
                  </div>

                  {/* 빨간 날 카운트 */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span className="text-sm text-muted-foreground">이번 주 '빨간 날'</span>
                      </div>
                    </div>
                    <p className="text-3xl text-red-600">
                      2<span className="text-sm ml-1">일</span>
                    </p>
                    <p className="text-xs text-red-600 mt-2">
                      고칼로리 또는 고나트륨으로 기록된 날이에요
                    </p>
                  </div>

                  {/* 많이 먹은 카테고리 */}
                  <div>
                    <h4 className="mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5 text-purple-600" />
                      많이 먹은 카테고리 TOP 3
                    </h4>
                    <div className="space-y-2">
                      {topCategories.map((category, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm">{category.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {category.count}회 ({category.percentage}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-500 h-2 rounded-full"
                                style={{ width: `${category.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 주간 트렌드 차트 */}
              <Card>
                <CardHeader>
                  <CardTitle>주간 트렌드</CardTitle>
                  <CardDescription>
                    요일별 칼로리 & 나트륨 변화
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="calories" 
                        stroke="#f97316" 
                        strokeWidth={2}
                        name="칼로리"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sodium" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="나트륨"
                      />
                    </LineChart>
                  </ResponsiveContainer>

                  {/* 인사이트 메시지 */}
                  <div className="mt-6 space-y-3">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex gap-2">
                        <TrendingUp className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-900">
                          <p className="mb-1">목요일에 칼로리가 가장 높았어요!</p>
                          <p className="text-xs text-yellow-700">
                            다음 주 목요일엔 조금 가볍게 먹어보는 건 어떨까요? 😊
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex gap-2">
                        <TrendingDown className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-green-900">
                          <p className="mb-1">금요일 식단이 가장 좋았어요!</p>
                          <p className="text-xs text-green-700">
                            이런 식으로 계속 유지해보세요 💚
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 안내 메시지 */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-lg mb-4">
                    이번 주 '빨간 날'이 2일이었어요
                  </p>
                  <p className="text-muted-foreground mb-6">
                    다음 주에는 빨간 날을 조금 줄여보는 건 어떨까요? 챌린지에 도전해보세요! 🎯
                  </p>
                  <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                    챌린지 둘러보기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>

      {/* 날짜 상세 정보 다이얼로그 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>날짜 상세 정보</DialogTitle>
            <DialogDescription>
              선택한 날짜의 식사 정보를 확인해보세요
            </DialogDescription>
          </DialogHeader>
          <CardContent className="space-y-4">
            {selectedDate && (
              <>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  <span className="text-sm text-muted-foreground">
                    {currentYear}년 {currentMonth}월 {selectedDate.date}일
                  </span>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-600" />
                      <span className="text-sm text-muted-foreground">총 칼로리</span>
                    </div>
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      하루 평균
                    </Badge>
                  </div>
                  <p className="text-3xl text-orange-600">
                    {selectedDate.calories}
                    <span className="text-sm ml-1">kcal</span>
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-muted-foreground">총 나트륨</span>
                    </div>
                    <Badge variant="outline" className="text-blue-600 border-blue-300">
                      하루 평균
                    </Badge>
                  </div>
                  <p className="text-3xl text-blue-600">
                    {selectedDate.sodium}
                    <span className="text-sm ml-1">mg</span>
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <UtensilsCrossed className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-muted-foreground">식사 목록</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {selectedDate.meals.map((meal, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">{meal.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {meal.restaurant} ({meal.time})
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gray-500 h-2 rounded-full"
                              style={{ width: `${(meal.calories / selectedDate.calories) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
          <div className="flex justify-end mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(false)}
            >
              닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}