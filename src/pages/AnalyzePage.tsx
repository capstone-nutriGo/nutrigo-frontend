import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Camera, Upload, X, Loader2, Calendar, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { motion } from "motion/react";

interface MealRecord {
  id: string;
  date: string;
  time: string;
  items: {
    name: string;
    restaurant: string;
  }[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    sodium: number;
  };
  sodiumLevel: "저나트륨" | "적정" | "고나트륨";
  calorieLevel: "적정" | "과식";
  imageName: string;
}

export function AnalyzePage() {
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MealRecord | null>(null);
  const [recentRecords, setRecentRecords] = useState<MealRecord[]>([
    {
      id: "1",
      date: "2025-11-27",
      time: "19:30",
      items: [
        { name: "치킨", restaurant: "치킨플러스" },
        { name: "라 1.5L", restaurant: "치킨플러스" }
      ],
      nutrition: {
        calories: 1850,
        protein: 85,
        carbs: 120,
        sodium: 3200
      },
      sodiumLevel: "고나트륨",
      calorieLevel: "과식",
      imageName: "chicken_order.png"
    },
    {
      id: "2",
      date: "2025-11-26",
      time: "12:20",
      items: [
        { name: "비빔밥", restaurant: "한식당" }
      ],
      nutrition: {
        calories: 650,
        protein: 28,
        carbs: 95,
        sodium: 1400
      },
      sodiumLevel: "적정",
      calorieLevel: "적정",
      imageName: "bibimbap_order.png"
    }
  ]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!screenshot) {
      toast.error("먼저 사진을 업로드해주세요!");
      return;
    }

    setIsAnalyzing(true);

    // AI 분석 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // 모의 분석 결과
    const mockResult: MealRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      items: [
        { name: "까르보나라 파스타", restaurant: "파스타 하우스" },
        { name: "콜라", restaurant: "파스타 하우스" }
      ],
      nutrition: {
        calories: 980,
        protein: 32,
        carbs: 115,
        sodium: 2100
      },
      sodiumLevel: "고나트륨",
      calorieLevel: "과식",
      imageName: screenshot.name
    };

    setAnalysisResult(mockResult);
    setIsAnalyzing(false);
    toast.success("분석이 완료되었어요! 🎉");
  };

  const handleSaveRecord = () => {
    if (!analysisResult) return;

    setRecentRecords([analysisResult, ...recentRecords]);
    toast.success("캘린더에 기록되었어요!");
    
    // 초기화
    setScreenshot(null);
    setScreenshotPreview(null);
    setAnalysisResult(null);
  };

  const getSodiumColor = (level: string) => {
    switch (level) {
      case "저나트륨":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "적정":
        return "bg-green-100 text-green-700 border-green-200";
      case "고나트륨":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/40 via-stone-50 to-lime-50/30">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-4xl mx-auto">
            {/* 헤더 */}
            <div className="text-center mb-12">
              <h1 className="text-4xl mb-4">사진 기반 영양 기록</h1>
              <p className="text-lg text-muted-foreground">
                배달앱 주문내역 스크린샷만 찍으면 끝! 📸
              </p>
              <p className="text-muted-foreground mt-2">
                AI가 자동으로 영양소를 분석해서 캘린더에 기록해드려요
              </p>
            </div>

            {/* 업로드 카드 */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>스크린샷 업로드</CardTitle>
                <CardDescription>
                  배달앱 주문 완료 화면을 찍어서 올려주세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 업로드 영역 */}
                <div className="border-2 border-dashed border-green-300 rounded-lg p-8 text-center hover:border-secondary transition-colors cursor-pointer bg-green-50/30">
                  <label htmlFor="screenshot-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-secondary to-emerald-600 rounded-full flex items-center justify-center">
                        <Camera className="w-10 h-10 text-white" />
                      </div>
                      <div>
                        <p className="mb-2">클릭하여 사진을 선택하세요</p>
                        <p className="text-sm text-muted-foreground">
                          JPG, PNG 파일을 업로드할 수 있어요
                        </p>
                      </div>
                      {!screenshotPreview && (
                        <Button type="button" variant="outline">
                          <Upload className="w-4 h-4 mr-2" />
                          파일 선택
                        </Button>
                      )}
                    </div>
                  </label>
                  <input
                    id="screenshot-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* 미리보기 */}
                {screenshotPreview && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative border rounded-lg overflow-hidden"
                  >
                    <img
                      src={screenshotPreview}
                      alt="업로드한 스크린샷"
                      className="w-full h-auto max-h-96 object-contain bg-gray-50"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setScreenshot(null);
                        setScreenshotPreview(null);
                        setAnalysisResult(null);
                        toast.info("사진이 제거되었어요");
                      }}
                    >
                      <X className="w-4 h-4 mr-1" />
                      제거
                    </Button>
                  </motion.div>
                )}

                {/* 분석 버튼 */}
                <Button
                  onClick={handleAnalyze}
                  disabled={!screenshot || isAnalyzing}
                  className="w-full"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      AI가 영양소를 분석하는 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      영양소 자동 분석하기
                    </>
                  )}
                </Button>

                {/* 안내 */}
                <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-green-900">
                      <p className="mb-2">
                        배달의민족, 요기요, 쿠팡이츠 등 모든 배달앱을 지원해요!
                      </p>
                      <p>
                        메뉴명이 잘 보이도록 스크린샷을 찍어주시면 더 정확하게 분석할 수 있어요 😊
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 분석 결과 */}
            {analysisResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="mb-8 border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      분석 완료!
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 메뉴 정보 */}
                    <div>
                      <h3 className="mb-3">인식된 메뉴</h3>
                      <div className="space-y-2">
                        {analysisResult.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Badge variant="outline">{item.restaurant}</Badge>
                            <span>{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 영양 정보 */}
                    <div>
                      <h3 className="mb-3">예상 영양소</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-orange-100 border border-orange-300 rounded-lg p-4">
                          <p className="text-sm text-muted-foreground mb-1">칼로리</p>
                          <p className="text-2xl text-orange-700">
                            {analysisResult.nutrition.calories}
                            <span className="text-sm ml-1">kcal</span>
                          </p>
                        </div>
                        <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                          <p className="text-sm text-muted-foreground mb-1">단백질</p>
                          <p className="text-2xl text-green-700">
                            {analysisResult.nutrition.protein}
                            <span className="text-sm ml-1">g</span>
                          </p>
                        </div>
                        <div className="bg-amber-100 border border-amber-300 rounded-lg p-4">
                          <p className="text-sm text-muted-foreground mb-1">탄수화물</p>
                          <p className="text-2xl text-amber-700">
                            {analysisResult.nutrition.carbs}
                            <span className="text-sm ml-1">g</span>
                          </p>
                        </div>
                        <div className="bg-stone-100 border border-stone-300 rounded-lg p-4">
                          <p className="text-sm text-muted-foreground mb-1">나트륨</p>
                          <p className="text-2xl text-stone-700">
                            {analysisResult.nutrition.sodium}
                            <span className="text-sm ml-1">mg</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 레벨 */}
                    <div className="flex gap-3 flex-wrap">
                      <Badge className={getSodiumColor(analysisResult.sodiumLevel)}>
                        {analysisResult.sodiumLevel}
                      </Badge>
                      {analysisResult.calorieLevel === "과식" && (
                        <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                          고칼로리
                        </Badge>
                      )}
                    </div>

                    {/* 저장 버튼 */}
                    <Button onClick={handleSaveRecord} className="w-full" size="lg">
                      <Calendar className="w-4 h-4 mr-2" />
                      캘린더에 기록하기
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* 최근 기록 */}
            {recentRecords.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl mb-6">최근 기록</h2>
                <div className="space-y-4">
                  {recentRecords.map((record) => (
                    <Card key={record.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {record.date} {record.time}
                            </p>
                            <div className="space-y-1">
                              {record.items.map((item, index) => (
                                <p key={index} className="text-sm">
                                  {item.name} <span className="text-muted-foreground">({item.restaurant})</span>
                                </p>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline">
                              {record.nutrition.calories}kcal
                            </Badge>
                            <Badge className={getSodiumColor(record.sodiumLevel)}>
                              {record.sodiumLevel}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}