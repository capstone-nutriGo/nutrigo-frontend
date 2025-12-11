import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Camera, Link as LinkIcon, Loader2, Sparkles, AlertCircle, Upload } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { motion } from "motion/react";
import { getProfile } from "../api/user";
import { analyzeStoreLink, analyzeCartImage, NutritionAnalysisResponse } from "../api/nutrition";
import { getPresignedUrl, uploadToS3 } from "../api/storage";
import { useAuth } from "../contexts/AuthContext";

interface MenuItem {
  name: string;
  restaurant: string;
  calories: number;
  protein: number;
  sodiumLevel: "저나트륨" | "적정" | "고나트륨";
  description: string;
}

interface AnalysisResult {
  recommendedMenus: MenuItem[];
}

export function PreOrderAnalyzePage() {
  const { isLoggedIn } = useAuth();
  const [linkUrl, setLinkUrl] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [userInfo, setUserInfo] = useState<{ gender: "male" | "female" | "other"; birthday: string } | null>(null);

  // 사용자 정보 로드
  useEffect(() => {
    const loadUserInfo = async () => {
      if (!isLoggedIn) return;
      
      try {
        const profile = await getProfile();
        if (profile.data && profile.data.gender && profile.data.birthday) {
          setUserInfo({
            gender: profile.data.gender.toLowerCase() as "male" | "female" | "other",
            birthday: profile.data.birthday,
          });
        }
      } catch (error) {
        console.error("사용자 정보 로드 실패:", error);
      }
    };
    
    loadUserInfo();
  }, [isLoggedIn]);

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

    if (!userInfo) {
      toast.error("사용자 정보가 필요합니다. 프로필을 먼저 설정해주세요.");
      return;
    }

    setAnalyzing(true);
    setUploading(false);

    try {
      let analysisResponse: NutritionAnalysisResponse | null = null;

      // 링크 입력 모드
      if (linkUrl) {
        toast.info("메뉴 링크 분석 중...");
        analysisResponse = await analyzeStoreLink({
          store_url: linkUrl,
          user_info: userInfo,
        });
      }
      // 스크린샷 업로드 모드
      // 옵션 A(권장): 한 번의 버튼 클릭으로 자동 처리되는 3단계 시퀀스
      else if (screenshot) {
        setUploading(true);
        toast.info("이미지 업로드 중...");

        // === 단계 1: 백엔드에서 presigned URL 요청 ===
        const fileExtension = screenshot.name.split('.').pop()?.toLowerCase() || 'jpg';
        const contentType = screenshot.type || `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
        
        const presignedData = await getPresignedUrl({
          fileExtension: fileExtension,
          contentType: contentType,
        });

        // === 단계 2: 프론트엔드에서 S3에 직접 PUT 업로드 ===
        await uploadToS3(presignedData.presignedUrl, screenshot, contentType);
        
        setUploading(false);
        toast.info("이미지 업로드 완료! 분석 중...");

        // === 단계 3: 업로드 성공 시 바로 분석 API 호출 (S3 key 전달) ===
        console.log("[PreOrderAnalyze] 분석 API 호출 시작:", {
          s3_key: presignedData.key,
          capture_id: `cart_${Date.now()}`,
          user_info: userInfo,
        });
        analysisResponse = await analyzeCartImage({
          s3_key: presignedData.key,
          capture_id: `cart_${Date.now()}`,
          user_info: userInfo,
        });
        console.log("[PreOrderAnalyze] 분석 API 응답 받음:", analysisResponse);
      }

      if (analysisResponse && analysisResponse.data && analysisResponse.data.analyses.length > 0) {
        // 분석 결과를 UI 형식으로 변환
        const analyses = analysisResponse.data.analyses;
        
        // OCR로 인식된 모든 메뉴를 점수 순으로 정렬하여 추천 목록으로 표시
        const sortedAnalyses = [...analyses].sort((a, b) => b.score - a.score);
        
        const recommendedMenus = sortedAnalyses.map(analysis => ({
          name: analysis.menu.name,
          restaurant: analysis.menu.category_hint || "분석 결과",
          calories: Math.round(analysis.nutrition.kcal),
          protein: Math.round(analysis.nutrition.protein_g),
          sodiumLevel: analysis.nutrition.sodium_mg > 2000 ? "고나트륨" 
                      : analysis.nutrition.sodium_mg < 1000 ? "저나트륨" 
                      : "적정" as "저나트륨" | "적정" | "고나트륨",
          description: analysis.coach_sentence || analysis.menu.description || "",
        }));

        const result: AnalysisResult = {
          recommendedMenus: recommendedMenus,
        };

        setResult(result);
        toast.success("메뉴 분석이 완료되었어요!");
      } else {
        throw new Error("분석 결과가 없습니다.");
      }
    } catch (error: any) {
      console.error("[PreOrderAnalyze] 분석 중 오류:", error);
      console.error("[PreOrderAnalyze] 에러 상세:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack,
      });
      toast.error(error.response?.data?.message || error.message || "분석 중 오류가 발생했습니다.");
    } finally {
      setAnalyzing(false);
      setUploading(false);
    }
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
                  disabled={analyzing || uploading || !userInfo}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      업로드 중...
                    </>
                  ) : analyzing ? (
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
                {!userInfo && (
                  <p className="text-sm text-red-600 text-center mt-2">
                    프로필에서 성별과 생년월일을 먼저 설정해주세요.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* 분석 결과 */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* OCR로 인식된 메뉴 추천 */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-green-600" />
                    <h2 className="text-2xl">인식된 메뉴 추천</h2>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    이미지에서 인식된 메뉴들을 영양 정보와 함께 추천해드려요 🍽️
                  </p>
                  <div className="grid gap-4">
                    {result.recommendedMenus.map((item, index) => (
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
                              {item.description && (
                                <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                                  💡 {item.description}
                                </p>
                              )}
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
