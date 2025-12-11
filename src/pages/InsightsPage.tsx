import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
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
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "motion/react";
import {
  fetchCalendar,
  fetchDayMeals,
  getReport,
  getWeeklySummary,
  CalendarDay,
  DayMealsData,
  type InsightReportResponse,
  type ReportRange,
  type WeeklyInsightSummaryResponse,
} from "../api/insight";
import { handleApiError } from "../api/errorHandler";

/** ---------- 임시 주간 데이터 (백엔드 리포트 붙이기 전까지 사용) ---------- */
const weeklyData = [
  { day: "월", calories: 2100, sodium: 2200 },
  { day: "화", calories: 2300, sodium: 2500 },
  { day: "수", calories: 1900, sodium: 1800 },
  { day: "목", calories: 2600, sodium: 2700 },
  { day: "금", calories: 1800, sodium: 1600 },
  { day: "토", calories: 2400, sodium: 2600 },
  { day: "일", calories: 2000, sodium: 2100 },
];

const topCategories = [
  { name: "치킨/튀김", count: 5, percentage: 28 },
  { name: "한식", count: 4, percentage: 22 },
  { name: "중식", count: 3, percentage: 17 },
];

/** ---------- 타입 (UI에서 쓰는 확장 타입) ---------- */
type Level = "green" | "yellow" | "red" | "none";

type CalendarDayWithLevel = CalendarDay & {
  level: Level; // UI 색깔용
  dayNumber: number; // 날짜 숫자 (1~31)
};

export function InsightsPage() {
  // 기본값은 현재 월/연도로 설정
  const [currentMonth, setCurrentMonth] = useState(
    new Date().getMonth() + 1
  );
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // 백엔드에서 받아온 캘린더 데이터
  const [calendarData, setCalendarData] = useState<CalendarDayWithLevel[]>([]);

  // 선택된 날짜 & 상세 정보
  const [selectedDate, setSelectedDate] =
    useState<CalendarDayWithLevel | null>(null);
  const [dayMeals, setDayMeals] = useState<DayMealsData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // 로딩/에러 상태
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [isLoadingMeals, setIsLoadingMeals] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 리포트 상태
  const [reportRange, setReportRange] = useState<ReportRange>("WEEKLY");
  const [reportData, setReportData] = useState<InsightReportResponse | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [activeTab, setActiveTab] = useState<"calendar" | "report">("calendar");

  // 주간 요약 상태
  const [weeklySummary, setWeeklySummary] = useState<WeeklyInsightSummaryResponse | null>(null);
  const [isLoadingWeeklySummary, setIsLoadingWeeklySummary] = useState(false);

  /** ---------- 달력 계산 함수 ---------- */
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  // 0: 일요일, 6: 토요일
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = getFirstDayOfMonth(currentYear, currentMonth);

  /** ---------- DayHighlight → UI 색깔 레벨로 매핑 ---------- */
  const highlightToLevel = (highlight?: string | null): Level => {
    switch (highlight) {
      case "GOOD":
        return "green";
      case "BAD":
        return "red";
      case "NEUTRAL":
        return "yellow";
      default:
        return "none";
    }
  };

  const getDateColor = (level: Level) => {
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

  /** ---------- 캘린더 데이터 불러오기 ---------- */
  useEffect(() => {
    const loadCalendar = async () => {
      try {
        setIsLoadingCalendar(true);
        setError(null);

        const monthStr = String(currentMonth).padStart(2, "0");
        const startDate = `${currentYear}-${monthStr}-01`;
        const lastDay = getDaysInMonth(currentYear, currentMonth);
        const endDate = `${currentYear}-${monthStr}-${String(
          lastDay
        ).padStart(2, "0")}`;

        const res = await fetchCalendar(startDate, endDate);

        const mapped: CalendarDayWithLevel[] = res.data.days.map((day) => {
          const dateObj = new Date(day.date);
          return {
            ...day,
            level: highlightToLevel(day.highlight),
            dayNumber: dateObj.getDate(),
          };
        });

        setCalendarData(mapped);
      } catch (e) {
        console.error(e);
        setError("캘린더 데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoadingCalendar(false);
      }
    };

    loadCalendar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentYear, currentMonth]);

  /** ---------- 주간 요약 데이터 불러오기 ---------- */
  useEffect(() => {
    const loadWeeklySummary = async () => {
      try {
        setIsLoadingWeeklySummary(true);
        const today = new Date();
        const baseDate = today.toISOString().split('T')[0];
        const res = await getWeeklySummary(baseDate);
        setWeeklySummary(res);
      } catch (error) {
        console.error("주간 요약 로드 실패:", error);
        // 에러가 발생해도 화면은 표시되도록 함
      } finally {
        setIsLoadingWeeklySummary(false);
      }
    };

    loadWeeklySummary();
  }, []);

  /** ---------- 리포트 데이터 불러오기 ---------- */
  useEffect(() => {
    const loadReport = async () => {
      try {
        setIsLoadingReport(true);
        const today = new Date();
        const baseDate = today.toISOString().split('T')[0];
        const res = await getReport(reportRange, baseDate);
        setReportData(res);
      } catch (error) {
        console.error("리포트 로드 실패:", error);
        setReportData(null);
      } finally {
        setIsLoadingReport(false);
      }
    };

    loadReport();
  }, [reportRange]);

  /** ---------- 날짜 클릭 시 /meals/day 호출 ---------- */
  const handleDateClick = async (day: CalendarDayWithLevel) => {
    setSelectedDate(day);
    setDialogOpen(true);
    setDayMeals(null);
    setIsLoadingMeals(true);
    setError(null);

    try {
      const res = await fetchDayMeals(day.date); // day.date = "YYYY-MM-DD"
      setDayMeals(res.data);
    } catch (e) {
      console.error(e);
      setError("해당 날짜의 식사 데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoadingMeals(false);
    }
  };

  /** ---------- 주간 통계 (API 데이터 기반) ---------- */
  // API 데이터가 있으면 사용, 없으면 null 또는 0
  const weeklyAvgCalories = weeklySummary?.data?.summary?.averageKcalPerMeal 
    ? Math.round(weeklySummary.data.summary.averageKcalPerMeal) 
    : null;
  
  // 나트륨은 trends에서 계산
  const weeklyAvgSodium = weeklySummary?.data?.trends?.days?.length > 0
    ? (() => {
        const daysWithSodium = weeklySummary.data.trends.days.filter(d => d.totalSodiumMg !== null);
        return daysWithSodium.length > 0
          ? Math.round(daysWithSodium.reduce((sum, d) => sum + (d.totalSodiumMg || 0), 0) / daysWithSodium.length)
          : null;
      })()
    : null;
  
  const redDaysCount = weeklySummary?.data?.summary?.overeatDays ?? 0;

  // 카테고리 TOP 3 (API 데이터만 사용)
  const topCategoriesData = weeklySummary?.data?.categoryTop3?.slice(0, 3) || [];
  
  // 주간 트렌드 데이터 (API 데이터만 사용)
  const weeklyTrendData = weeklySummary?.data?.trends?.days?.map((day) => {
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const date = new Date(day.date);
    return {
      day: dayNames[date.getDay()],
      calories: day.totalKcal ? Math.round(day.totalKcal) : 0,
      sodium: day.totalSodiumMg ? Math.round(day.totalSodiumMg) : 0,
    };
  }) || [];
  
  // 인사이트 메시지 생성 (실제 데이터 기반)
  const getInsightMessages = () => {
    if (!weeklySummary?.data?.trends?.days || weeklyTrendData.length === 0) {
      return null;
    }
    
    const messages = [];
    
    // 가장 칼로리가 높은 날 찾기
    const maxCalorieDay = weeklyTrendData.reduce((max, day) => 
      day.calories > max.calories ? day : max, weeklyTrendData[0]
    );
    
    if (maxCalorieDay && maxCalorieDay.calories > 0) {
      messages.push({
        type: "warning",
        icon: TrendingUp,
        title: `${maxCalorieDay.day}요일에 칼로리가 가장 높았어요!`,
        description: `다음 주 ${maxCalorieDay.day}요일엔 조금 가볍게 먹어보는 건 어떨까요? 😊`,
      });
    }
    
    // 가장 칼로리가 낮은 날 찾기
    const minCalorieDay = weeklyTrendData.reduce((min, day) => 
      day.calories < min.calories && day.calories > 0 ? day : min, weeklyTrendData[0]
    );
    
    if (minCalorieDay && minCalorieDay.calories > 0 && minCalorieDay.calories < maxCalorieDay.calories) {
      messages.push({
        type: "success",
        icon: TrendingDown,
        title: `${minCalorieDay.day}요일 식단이 가장 좋았어요!`,
        description: `이런 식으로 계속 유지해보세요 💚`,
      });
    }
    
    return messages.length > 0 ? messages : null;
  };
  
  const insightMessages = getInsightMessages();

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
              <h1 className="text-4xl mb-4">나의 식습관 인사이트</h1>
              <p className="text-lg text-muted-foreground">
                매일의 식습관을 한눈에 확인하고 건강한 습관을 만들어가요 📅
              </p>
            </div>

            {error && (
              <p className="mb-4 text-center text-sm text-red-500">{error}</p>
            )}

            {/* 탭 메뉴 */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "calendar" | "report")} className="mb-8">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                <TabsTrigger value="calendar">캘린더</TabsTrigger>
                <TabsTrigger value="report">리포트</TabsTrigger>
              </TabsList>

              {/* 캘린더 탭 */}
              <TabsContent value="calendar">
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
                          setCurrentYear((y) => y - 1);
                        } else {
                          setCurrentMonth((m) => m - 1);
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
                          setCurrentYear((y) => y + 1);
                        } else {
                          setCurrentMonth((m) => m + 1);
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
                    <div
                      key={day}
                      className="text-center text-sm text-muted-foreground py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* 날짜 그리드 */}
                <div className="grid grid-cols-7 gap-2">
                  {/* 빈 칸 (해당 월 1일의 요일만큼) */}
                  {[...Array(firstDayOfWeek)].map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square"></div>
                  ))}

                  {/* 실제 날짜 */}
                  {isLoadingCalendar && (
                    <div className="col-span-7 text-center text-sm text-muted-foreground py-8">
                      캘린더를 불러오는 중입니다...
                    </div>
                  )}

                  {!isLoadingCalendar &&
                    Array.from({ length: daysInMonth }, (_, i) => {
                      const dayNumber = i + 1;
                      const dateStr = `${currentYear}-${String(
                        currentMonth
                      ).padStart(2, "0")}-${String(dayNumber).padStart(
                        2,
                        "0"
                      )}`;

                      const dayInfo = calendarData.find(
                        (d) => d.date === dateStr
                      );

                      const level = dayInfo?.level ?? "none";

                      return (
                        <motion.button
                          key={dateStr}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-colors ${getDateColor(
                            level
                          )} cursor-pointer`}
                          onClick={() => {
                            if (dayInfo) {
                              handleDateClick(dayInfo);
                            }
                          }}
                          disabled={!dayInfo}
                        >
                          <span className="text-sm mb-1">{dayNumber}</span>
                          {dayInfo && (
                            <div
                              className={`w-2 h-2 rounded-full ${
                                level === "green"
                                  ? "bg-green-500"
                                  : level === "yellow"
                                    ? "bg-yellow-500"
                                    : level === "red"
                                      ? "bg-red-500"
                                      : "bg-gray-300"
                              }`}
                            ></div>
                          )}
                        </motion.button>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
              </TabsContent>

              {/* 리포트 탭 */}
              <TabsContent value="report">
                <Card className="mb-8">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>식습관 리포트</CardTitle>
                      <Select value={reportRange} onValueChange={(value: ReportRange) => setReportRange(value)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WEEKLY">주간 리포트</SelectItem>
                          <SelectItem value="MONTHLY">월간 리포트</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <CardDescription>
                      {reportRange === "WEEKLY" ? "이번 주" : "이번 달"} 식습관을 분석한 리포트예요
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingReport ? (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">리포트를 불러오는 중입니다...</p>
                      </div>
                    ) : reportData ? (
                      <div className="space-y-6">
                        {/* 요약 정보 */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <UtensilsCrossed className="w-5 h-5 text-orange-600" />
                              <span className="text-sm text-muted-foreground">총 식사 횟수</span>
                            </div>
                            <p className="text-2xl font-semibold text-orange-600">
                              {reportData.data.summary.totalMeals}
                              <span className="text-sm ml-1">회</span>
                            </p>
                          </div>

                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Award className="w-5 h-5 text-green-600" />
                              <span className="text-sm text-muted-foreground">좋은 날</span>
                            </div>
                            <p className="text-2xl font-semibold text-green-600">
                              {reportData.data.summary.goodDays}
                              <span className="text-sm ml-1">일</span>
                            </p>
                          </div>

                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="w-5 h-5 text-red-600" />
                              <span className="text-sm text-muted-foreground">과식한 날</span>
                            </div>
                            <p className="text-2xl font-semibold text-red-600">
                              {reportData.data.summary.overeatDays}
                              <span className="text-sm ml-1">일</span>
                            </p>
                          </div>

                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Droplets className="w-5 h-5 text-blue-600" />
                              <span className="text-sm text-muted-foreground">저나트륨 날</span>
                            </div>
                            <p className="text-2xl font-semibold text-blue-600">
                              {reportData.data.summary.lowSodiumDays}
                              <span className="text-sm ml-1">일</span>
                            </p>
                          </div>
                        </div>

                        {/* 평균 점수 */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">평균 점수</p>
                              <p className="text-4xl font-bold text-purple-600">
                                {reportData.data.summary.avgScore.toFixed(1)}
                                <span className="text-lg ml-1">/ 100</span>
                              </p>
                            </div>
                            <TrendingUp className="w-12 h-12 text-purple-400" />
                          </div>
                        </div>

                        {/* 패턴 분석 */}
                        {reportData.data.patterns.lateSnack.lateSnackDays > 0 && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="w-5 h-5 text-amber-600" />
                              <span className="font-semibold text-amber-900">패턴 분석</span>
                            </div>
                            <p className="text-sm text-amber-800">
                              늦은 밤 간식을 {reportData.data.patterns.lateSnack.lateSnackDays}일 동안 드셨어요.
                              규칙적인 식사 시간을 유지하는 것이 건강에 도움이 돼요!
                            </p>
                          </div>
                        )}

                        {/* 기간 정보 */}
                        <div className="text-sm text-muted-foreground text-center">
                          리포트 기간: {reportData.data.startDate} ~ {reportData.data.endDate}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">리포트 데이터가 없어요</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          식사 기록을 시작하면 리포트가 생성돼요
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* 주간 보고서 (기존 유지) */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* 이번 주 요약 */}
              <Card>
                <CardHeader>
                  <CardTitle>이번 주 요약</CardTitle>
                  <CardDescription>이번 주 식습관 요약 정보</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 평균 칼로리 */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-600" />
                        <span className="text-sm text-muted-foreground">
                          평균 칼로리
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-orange-600 border-orange-300"
                      >
                        하루 평균
                      </Badge>
                    </div>
                    <p className="text-3xl text-orange-600">
                      {weeklyAvgCalories !== null ? (
                        <>
                          {weeklyAvgCalories}
                          <span className="text-sm ml-1">kcal</span>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">데이터 없음</span>
                      )}
                    </p>
                  </div>

                  {/* 평균 나트륨 */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-muted-foreground">
                          평균 나트륨
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-blue-600 border-blue-300"
                      >
                        하루 평균
                      </Badge>
                    </div>
                    <p className="text-3xl text-blue-600">
                      {weeklyAvgSodium !== null ? (
                        <>
                          {weeklyAvgSodium}
                          <span className="text-sm ml-1">mg</span>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">데이터 없음</span>
                      )}
                    </p>
                  </div>

                  {/* 빨간 날 카운트 */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span className="text-sm text-muted-foreground">
                          이번 주 &apos;빨간 날&apos;
                        </span>
                      </div>
                    </div>
                    <p className="text-3xl text-red-600">
                      {redDaysCount}
                      <span className="text-sm ml-1">일</span>
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
                    {isLoadingWeeklySummary ? (
                      <div className="text-center py-4 text-muted-foreground">
                        <p className="text-sm">로딩 중...</p>
                      </div>
                    ) : topCategoriesData.length > 0 ? (
                      <div className="space-y-2">
                        {topCategoriesData.map((category, index) => {
                          // API 데이터인지 하드코딩 데이터인지 확인
                          let categoryName = typeof category === 'object' && 'category' in category 
                            ? category.category 
                            : (category as any).name;
                          // UNCATEGORIZED를 "기타"로 표시
                          if (categoryName === "UNCATEGORIZED") {
                            categoryName = "기타";
                          }
                          const categoryCount = typeof category === 'object' && 'count' in category 
                            ? category.count 
                            : (category as any).count;
                          const totalMeals = weeklySummary?.data?.summary?.totalMeals || 0;
                          const percentage = totalMeals > 0 
                            ? Math.round((categoryCount / totalMeals) * 100) 
                            : (category as any).percentage || 0;
                          
                          return (
                            <div key={index} className="flex items-center gap-3">
                              <Badge
                                variant="outline"
                                className="w-8 h-8 rounded-full flex items-center justify-center"
                              >
                                {index + 1}
                              </Badge>
                              <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm">{categoryName}</span>
                                  <span className="text-sm text-muted-foreground">
                                    {categoryCount}회 ({percentage}%)
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-purple-500 h-2 rounded-full"
                                    style={{
                                      width: `${percentage}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <p className="text-sm">데이터가 없어요</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 주간 트렌드 차트 */}
              <Card>
                <CardHeader>
                  <CardTitle>주간 트렌드</CardTitle>
                  <CardDescription>요일별 칼로리 & 나트륨 변화</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingWeeklySummary ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>차트 데이터를 불러오는 중입니다...</p>
                    </div>
                  ) : weeklyTrendData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={weeklyTrendData}>
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
                      
                      {/* 인사이트 메시지 (실제 데이터 기반) */}
                      {insightMessages && insightMessages.length > 0 && (
                        <div className="mt-6 space-y-3">
                          {insightMessages.map((message, index) => {
                            const IconComponent = message.icon;
                            return (
                              <div
                                key={index}
                                className={`border rounded-lg p-3 ${
                                  message.type === "warning"
                                    ? "bg-yellow-50 border-yellow-200"
                                    : "bg-green-50 border-green-200"
                                }`}
                              >
                                <div className="flex gap-2">
                                  <IconComponent
                                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                                      message.type === "warning"
                                        ? "text-yellow-600"
                                        : "text-green-600"
                                    }`}
                                  />
                                  <div
                                    className={`text-sm ${
                                      message.type === "warning"
                                        ? "text-yellow-900"
                                        : "text-green-900"
                                    }`}
                                  >
                                    <p className="mb-1">{message.title}</p>
                                    <p
                                      className={`text-xs ${
                                        message.type === "warning"
                                          ? "text-yellow-700"
                                          : "text-green-700"
                                      }`}
                                    >
                                      {message.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>차트 데이터가 없어요</p>
                      <p className="text-sm mt-2">
                        식사 기록을 시작하면 차트가 표시돼요
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 안내 메시지 */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-lg mb-4">
                    이번 주 &apos;빨간 날&apos;이 {redDaysCount}일이었어요
                  </p>
                  <p className="text-muted-foreground mb-6">
                    다음 주에는 빨간 날을 조금 줄여보는 건 어떨까요?
                    챌린지에 도전해보세요! 🎯
                  </p>
                  <Button
                    size="lg"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
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
                    {selectedDate.date}
                  </span>
                </div>

                {/* 총 칼로리/나트륨 요약 (DayMealsData 기반) */}
                {dayMeals && (
                  <>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Flame className="w-5 h-5 text-orange-600" />
                          <span className="text-sm text-muted-foreground">
                            총 칼로리
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-orange-600 border-orange-300"
                        >
                          하루 합계
                        </Badge>
                      </div>
                      <p className="text-3xl text-orange-600">
                        {Math.round(dayMeals.totalKcal)}
                        <span className="text-sm ml-1">kcal</span>
                      </p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Droplets className="w-5 h-5 text-blue-600" />
                          <span className="text-sm text-muted-foreground">
                            총 나트륨
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-blue-600 border-blue-300"
                        >
                          하루 합계
                        </Badge>
                      </div>
                      <p className="text-3xl text-blue-600">
                        {Math.round(dayMeals.totalSodiumMg)}
                        <span className="text-sm ml-1">mg</span>
                      </p>
                    </div>
                  </>
                )}

                {/* 식사 목록 */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <UtensilsCrossed className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-muted-foreground">
                        식사 목록
                      </span>
                    </div>
                  </div>

                  {isLoadingMeals && (
                    <p className="text-sm text-muted-foreground">
                      식사 정보를 불러오는 중입니다...
                    </p>
                  )}

                  {!isLoadingMeals && dayMeals && dayMeals.meals.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      등록된 식사 기록이 없습니다.
                    </p>
                  )}

                  {!isLoadingMeals && dayMeals && dayMeals.meals.length > 0 && (
                    <div className="space-y-2">
                      {dayMeals.meals.map((meal, index) => (
                        <div
                          key={meal.mealLogId}
                          className="flex items-center gap-3"
                        >
                          <Badge
                            variant="outline"
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                          >
                            {index + 1}
                          </Badge>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm">
                                {meal.menu || "식사 기록"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {meal.mealTime} ·{" "}
                                {meal.createdAt 
                                  ? new Date(meal.createdAt).toLocaleTimeString(
                                      "ko-KR",
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )
                                  : meal.mealDate || "시간 정보 없음"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
