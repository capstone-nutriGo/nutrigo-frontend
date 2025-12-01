import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Camera, Link as LinkIcon, Loader2, Sparkles, TrendingDown, AlertCircle, Upload } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { motion } from "motion/react";

interface MenuItem {
  name: string;
  restaurant: string;
  calories: number;
  protein: number;
  sodiumLevel: "저나트륨" | "적정" | "고나트륨";
  description: string;
}

interface AnalysisResult {
  mainItem: MenuItem;
  alternatives: MenuItem[];
}

export function PreOrderAnalyzePage() {
  const [linkUrl, setLinkUrl] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!linkUrl && !screenshot) {
      toast.error("배달앱 링크를 입력하거나 스크린샷을 업로드해주세요");
      return;
    }

    setAnalyzing(true);

    // AI 분석 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 모의 분석 결과
    const mockResult: AnalysisResult = {
      mainItem: {
        name: "까르보나라 파스타",
        restaurant: "파스타 하우스",
        calories: 850,
        protein: 28,
        sodiumLevel: "고나트륨",
        description: "크림 베이스의 진한 까르보나라 파스타"
      },
      alternatives: [
        {
          name: "토마토 파스타",
          restaurant: "파스타 하우스",
          calories: 520,
          protein: 22,
          sodiumLevel: "적정",
          description: "토마토 소스 기반의 가벼운 파스타. 칼로리 39% 절감!"
        },
        {
          name: "까르보나라 파스타 (단품)",
          restaurant: "파스타 하우스",
          calories: 650,
          protein: 25,
          sodiumLevel: "고나트륨",
          description: "음료와 샐러드 제외. 칼로리 24% 절감!"
        }
      ]
    };

    setResult(mockResult);
    setAnalyzing(false);
    toast.success("메뉴 분석이 완료되었어요!");
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-stone-50 to-lime-50/30">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl mb-4">주문 전 메뉴 분석</h1>
              <p className="text-muted-foreground text-lg">
                주문하기 전에 영양 정보를 확인하고 더 나은 선택을 해보세요 ✨
              </p>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>메뉴 정보 입력</CardTitle>
                <CardDescription>
                  배달앱 링크를 입력하거나 메뉴 스크린샷을 업로드해주세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 링크 입력 */}
                <div className="space-y-2">
                  <Label htmlFor="link">배달앱 링크</Label>
                  <Input
                    id="link"
                    type="url"
                    placeholder="https://..."
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    배달의민족, 요기요, 쿠팡이츠 등의 메뉴 링크를 붙여넣어주세요
                  </p>
                </div>

                {/* 구분선 */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-muted-foreground">또는</span>
                  </div>
                </div>

                {/* 스크린샷 업로드 */}
                <div className="space-y-2">
                  <Label htmlFor="screenshot">메뉴 스크린샷</Label>
                  <div className="border-2 border-dashed border-green-300 rounded-lg p-8 text-center bg-green-50/30 hover:border-secondary transition-colors">
                    <input
                      id="screenshot"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="screenshot" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-secondary to-emerald-600 rounded-full flex items-center justify-center">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                        {screenshot ? (
                          <p className="text-sm">{screenshot.name}</p>
                        ) : (
                          <>
                            <p className="mb-1">클릭하여 이미지를 선택하세요</p>
                            <p className="text-sm text-muted-foreground">
                              JPG, PNG 파일을 업로드할 수 있어요
                            </p>
                            <Button type="button" variant="outline" size="sm">
                              <Upload className="w-4 h-4 mr-2" />
                              파일 선택
                            </Button>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      분석 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      영양 정보 분석하기
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* 분석 결과 */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* 선택한 메뉴 */}
                <Card>
                  <CardHeader>
                    <CardTitle>선택하신 메뉴</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl mb-1">{result.mainItem.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {result.mainItem.restaurant}
                        </p>
                      </div>
                      <div className="flex gap-3 flex-wrap">
                        <Badge variant="outline" className="text-sm py-1 px-3">
                          칼로리: {result.mainItem.calories}kcal
                        </Badge>
                        <Badge variant="outline" className="text-sm py-1 px-3">
                          단백질: {result.mainItem.protein}g
                        </Badge>
                        <Badge className={getSodiumColor(result.mainItem.sodiumLevel)}>
                          {result.mainItem.sodiumLevel}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {result.mainItem.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* 추천 대안 */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingDown className="w-5 h-5 text-green-600" />
                    <h2 className="text-2xl">이런 선택은 어떠세요?</h2>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    비슷하지만 조금 더 가벼운 선택지를 추천해드려요 🌿
                  </p>
                  <div className="grid gap-4">
                    {result.alternatives.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="border-green-200 hover:shadow-lg transition-shadow">
                          <CardContent className="pt-6">
                            <div className="space-y-4">
                              <div>
                                <h3 className="text-lg mb-1">{item.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {item.restaurant}
                                </p>
                              </div>
                              <div className="flex gap-3 flex-wrap">
                                <Badge variant="outline" className="text-sm py-1 px-3">
                                  칼로리: {item.calories}kcal
                                </Badge>
                                <Badge variant="outline" className="text-sm py-1 px-3">
                                  단백질: {item.protein}g
                                </Badge>
                                <Badge className={getSodiumColor(item.sodiumLevel)}>
                                  {item.sodiumLevel}
                                </Badge>
                              </div>
                              <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                                💡 {item.description}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* 안내 메시지 */}
                <Card className="bg-green-50 border-green-300">
                  <CardContent className="pt-6">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-green-900">
                        <p className="mb-2">
                          이 분석은 AI 모델을 기반으로 한 예측이에요. 실제 영양 정보와 차이가 있을 수 있어요.
                        </p>
                        <p>
                          더 정확한 정보는 음식점에서 제공하는 영양 정보를 확인해주세요 😊
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
