import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Camera, Upload, X, Loader2, Calendar, CheckCircle, AlertCircle, Sparkles, Type, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { motion } from "motion/react";
import { Textarea } from "../components/ui/textarea";
import { Slider } from "../components/ui/slider";
import { getPresignedUrl, uploadToS3 } from "../api/storage";
import { analyzeOrderImage } from "../api/nutrition";
import { useAuth } from "../contexts/AuthContext";
import { fetchDayMeals, DayMealsResponse, createInsightLog } from "../api/insight";
import axios from "axios";

interface MealRecord {
  id: string;
  date: string;
  time: string;
  mealTime: "아침" | "점심" | "저녁" | "야식";
  items: {
    name: string;
    restaurant: string;
    consumption: number; // 0-100, 섭취량 (%)
    topping?: string; // 토핑/추가재료 정보
    baseKcal?: number; // 원본 칼로리 (100% 기준)
    baseProtein?: number; // 원본 단백질 (100% 기준)
    baseCarbs?: number; // 원본 탄수화물 (100% 기준)
    baseSodium?: number; // 원본 나트륨 (100% 기준)
    // 텍스트 입력 모드용 추정값 (UI 표시용)
    estimatedKcal?: number;
    estimatedProtein?: number;
    estimatedCarbs?: number;
    estimatedSodium?: number;
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
  const { tokenData } = useAuth();
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MealRecord | null>(null);
  const [s3Key, setS3Key] = useState<string | null>(null); // S3 키 저장
  const [mealDate, setMealDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [mealTime, setMealTime] = useState<"아침" | "점심" | "저녁" | "야식">("점심");
  const [inputMode, setInputMode] = useState<"photo" | "text">("photo");
  const [textMealItems, setTextMealItems] = useState<Array<{ name: string; restaurant: string; topping: string }>>([
    { name: "", restaurant: "", topping: "" }
  ]);
  const [recentRecords, setRecentRecords] = useState<MealRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);

  // 최근 기록 가져오기 함수 (재사용 가능하도록 분리)
  const loadRecentRecords = async () => {
    setIsLoadingRecords(true);
    try {
      const records: MealRecord[] = [];
      const today = new Date();
      
      // 현재로부터 일주일 전까지의 데이터 가져오기 (오늘 포함 최근 7일)
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        try {
          const response: DayMealsResponse = await fetchDayMeals(dateStr);
          console.log(`[AnalyzePage] fetchDayMeals for ${dateStr}:`, response);
          if (response.success && response.data.meals && response.data.meals.length > 0) {
            // 같은 날짜의 식사들을 그룹화
            const mealsByTime: { [key: string]: any[] } = {};
            response.data.meals.forEach((meal: any) => {
              const mealTimeKey = meal.mealTime || "SNACK";
              if (!mealsByTime[mealTimeKey]) {
                mealsByTime[mealTimeKey] = [];
              }
              mealsByTime[mealTimeKey].push(meal);
            });
            
            // 각 시간대별로 MealRecord 생성
            Object.entries(mealsByTime).forEach(([mealTimeKey, meals]) => {
              const mealTimeMap: { [key: string]: "아침" | "점심" | "저녁" | "야식" } = {
                "BREAKFAST": "아침",
                "LUNCH": "점심",
                "DINNER": "저녁",
                "SNACK": "야식",
                "NIGHT": "야식"
              };
              
              const mealTime = mealTimeMap[mealTimeKey] || "점심";
              const firstMeal = meals[0];
              const createdAt = firstMeal.createdAt ? new Date(firstMeal.createdAt) : new Date(dateStr + "T12:00:00");
              const timeStr = `${createdAt.getHours().toString().padStart(2, '0')}:${createdAt.getMinutes().toString().padStart(2, '0')}`;
              
              // 영양소 합계 계산
              const totalKcal = meals.reduce((sum, m) => sum + (m.kcal ?? 0), 0);
              const totalProtein = meals.reduce((sum, m) => sum + (m.proteinG ?? 0), 0);
              const totalCarbs = meals.reduce((sum, m) => sum + (m.carbG ?? 0), 0);
              const totalSodium = meals.reduce((sum, m) => sum + (m.sodiumMg ?? 0), 0);
              
              // 나트륨 레벨 판단
              let sodiumLevel: "저나트륨" | "적정" | "고나트륨" = "적정";
              if (totalSodium > 2000) {
                sodiumLevel = "고나트륨";
              } else if (totalSodium < 1000) {
                sodiumLevel = "저나트륨";
              }
              
              // 칼로리 레벨 판단
              let calorieLevel: "적정" | "과식" = "적정";
              if (totalKcal > 800) {
                calorieLevel = "과식";
              }
              
              records.push({
                id: `meal-${firstMeal.mealLogId}`,
                date: dateStr,
                time: timeStr,
                mealTime: mealTime,
                items: meals.map((meal) => ({
                  name: meal.menu || "알 수 없음",
                  restaurant: meal.category || "", // 카테고리가 없으면 빈 문자열
                  consumption: 100
                })),
                nutrition: {
                  calories: Math.round(totalKcal),
                  protein: Math.round(totalProtein),
                  carbs: Math.round(totalCarbs),
                  sodium: Math.round(totalSodium)
                },
                sodiumLevel: sodiumLevel,
                calorieLevel: calorieLevel,
                imageName: ""
              });
            });
          }
        } catch (error) {
          // 특정 날짜의 데이터가 없으면 무시하고 다음 날짜로 진행
          console.warn(`[AnalyzePage] 날짜 ${dateStr}의 데이터를 가져오지 못했습니다:`, error);
          if (error instanceof Error) {
            console.warn(`[AnalyzePage] error message:`, error.message);
          }
        }
      }
      
      // 날짜와 시간 순으로 정렬 (최신순)
      records.sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);
        if (dateCompare !== 0) return dateCompare;
        return b.time.localeCompare(a.time);
      });
      
      // 일주일 전까지의 데이터만 표시 (모든 데이터 표시)
      console.log(`[AnalyzePage] 최근 기록 로드 완료: ${records.length}개 발견`);
      setRecentRecords(records);
    } catch (error) {
      console.error("[AnalyzePage] 최근 기록을 가져오는 중 오류:", error);
      if (error instanceof Error) {
        console.error("[AnalyzePage] error message:", error.message);
        console.error("[AnalyzePage] error stack:", error.stack);
      }
      toast.error("최근 기록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoadingRecords(false);
    }
  };

  // 최근 기록 가져오기 (컴포넌트 마운트 시)
  useEffect(() => {
    loadRecentRecords();
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
      setAnalysisResult(null);
    }
  };

  const getTimeByMealTime = (mealTime: "아침" | "점심" | "저녁" | "야식"): string => {
    const now = new Date();
    switch (mealTime) {
      case "아침":
        return "08:00";
      case "점심":
        return "12:30";
      case "저녁":
        return "19:00";
      case "야식":
        return "22:00";
      default:
        return now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    }
  };

  const handleAnalyze = async () => {
    if (inputMode === "photo" && !screenshot) {
      toast.error("먼저 사진을 업로드해주세요!");
      return;
    }

    if (inputMode === "text") {
      const validItems = textMealItems.filter(item => item.name.trim() !== "");
      if (validItems.length === 0) {
        toast.error("먼저 음식 이름을 입력해주세요!");
        return;
      }
    }

    setIsAnalyzing(true);
    setIsUploading(false);

    try {
      let s3Key: string | undefined;

      // 사진 모드인 경우: 옵션 A(권장) - 한 번의 버튼 클릭으로 자동 처리되는 3단계 시퀀스
      if (inputMode === "photo" && screenshot) {
        setIsUploading(true);
        toast.info("이미지 업로드 중...");

        // 파일 확장자와 MIME 타입 추출
        const fileExtension = screenshot.name.split('.').pop()?.toLowerCase() || 'jpg';
        const contentType = screenshot.type || `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;

        // === 단계 1: 백엔드에서 presigned URL 요청 ===
        const presignedData = await getPresignedUrl({
          fileExtension,
          contentType,
        });

        // === 단계 2: 프론트엔드에서 S3에 직접 PUT 업로드 ===
        await uploadToS3(presignedData.presignedUrl, screenshot, contentType);
        s3Key = presignedData.key;

        setIsUploading(false);
        toast.success("이미지 업로드 완료! 분석 중...");
      }

      // === 단계 3: 업로드 성공 시 바로 분석 API 호출 (S3 key 전달) ===
      if (inputMode === "photo" && s3Key) {
        // mealTime을 백엔드 형식으로 변환
        const mealTimeMap: Record<"아침" | "점심" | "저녁" | "야식", "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK"> = {
          "아침": "BREAKFAST",
          "점심": "LUNCH",
          "저녁": "DINNER",
          "야식": "SNACK",
        };

        const analysisResponse = await analyzeOrderImage({
          s3_key: s3Key,
          order_date: mealDate,
          meal_time: mealTimeMap[mealTime],
          capture_id: `capture_${Date.now()}`,
        });

        // 사진 입력 모드에서는 백엔드에서 이미 저장하므로, 
        // 분석 결과만 표시하고 저장 버튼을 누르면 추가 저장하지 않도록 플래그 설정
        setS3Key(s3Key); // S3 키 저장 (이미 저장된 것을 표시하기 위해)

        // 분석 결과를 MealRecord 형식으로 변환
        if (analysisResponse.data && analysisResponse.data.items) {
          const items = analysisResponse.data.items.map((item) => {
            // 카테고리가 비어있거나 null이면 메뉴명에서 추론 시도
            let category = item.category;
            if (!category || category.trim() === "" || category === "알 수 없음" || category === "UNCATEGORIZED") {
              // 메뉴명에서 카테고리 추론 (간단한 휴리스틱)
              // 순서가 중요: 더 구체적인 패턴을 먼저 체크해야 함
              const menuName = item.menu.toLowerCase();
              if (menuName.includes("비빔밥") || menuName.includes("한우") || menuName.includes("생육회") || menuName.includes("김치") || menuName.includes("된장") || menuName.includes("국밥") || menuName.includes("불고기") || menuName.includes("갈비") || menuName.includes("삼겹살")) {
                category = "한식";
              } else if (menuName.includes("초밥") || menuName.includes("스시") || menuName.includes("연어") || menuName.includes("담다") || (menuName.includes("회") && !menuName.includes("생육회"))) {
                category = "일식";
              } else if (menuName.includes("짜장") || menuName.includes("짬뽕") || menuName.includes("볶음밥") || menuName.includes("탕수육") || menuName.includes("깐풍") || menuName.includes("마파두부")) {
                category = "중식";
              } else if (menuName.includes("치킨") || menuName.includes("윙")) {
                category = "치킨";
              } else {
                category = "기타";
              }
            }
            
            return {
              name: item.menu,
              restaurant: category, // 카테고리를 restaurant에 저장
              consumption: 100,
              // 원본 영양소 데이터 저장 (섭취량 계산용)
              // null이나 undefined가 아닌 경우에만 값 사용, 0도 유효한 값이므로 그대로 사용
              baseKcal: item.kcal != null ? item.kcal : 0,
              baseProtein: item.protein_g != null ? item.protein_g : 0,
              baseCarbs: item.carb_g != null ? item.carb_g : 0,
              baseSodium: item.sodium_mg != null ? item.sodium_mg : 0,
            };
          });

          // 초기 영양소 합계 계산 (100% 기준)
          const totalNutrition = items.reduce(
            (acc, item) => ({
              calories: acc.calories + (item.baseKcal || 0),
              protein: acc.protein + (item.baseProtein || 0),
              carbs: acc.carbs + (item.baseCarbs || 0),
              sodium: acc.sodium + (item.baseSodium || 0),
            }),
            { calories: 0, protein: 0, carbs: 0, sodium: 0 }
          );

          const result: MealRecord = {
            id: analysisResponse.data.capture_id,
            date: mealDate,
            time: getTimeByMealTime(mealTime),
            mealTime: mealTime,
            items: items,
            nutrition: totalNutrition,
            sodiumLevel: totalNutrition.sodium > 2000 ? "고나트륨" : totalNutrition.sodium < 1000 ? "저나트륨" : "적정",
            calorieLevel: totalNutrition.calories > 2000 ? "과식" : "적정",
            imageName: screenshot?.name || "",
          };

          setAnalysisResult(result);
          toast.success("분석이 완료되었어요! 🎉");
        } else {
          throw new Error("분석 결과가 없습니다.");
        }
      } else if (inputMode === "text") {
        // 텍스트 입력 모드인 경우
        const validItems = textMealItems.filter(item => item.name.trim() !== "");
        
        // 메뉴명에서 영양소를 추정하는 함수
        const estimateNutrition = (menuName: string): { kcal: number; protein: number; carbs: number; sodium: number } => {
          const name = menuName.toLowerCase();
          
          // 간단한 휴리스틱으로 영양소 추정
          if (name.includes("짜장") || name.includes("짬뽕")) {
            return { kcal: 650, protein: 20, carbs: 100, sodium: 1800 };
          } else if (name.includes("볶음밥")) {
            return { kcal: 550, protein: 15, carbs: 90, sodium: 1200 };
          } else if (name.includes("비빔밥")) {
            return { kcal: 600, protein: 18, carbs: 85, sodium: 1500 };
          } else if (name.includes("초밥") || name.includes("회")) {
            return { kcal: 500, protein: 25, carbs: 80, sodium: 1000 };
          } else if (name.includes("치킨")) {
            return { kcal: 800, protein: 35, carbs: 50, sodium: 2000 };
          } else if (name.includes("라면")) {
            return { kcal: 500, protein: 12, carbs: 70, sodium: 2500 };
          } else if (name.includes("김밥")) {
            return { kcal: 400, protein: 10, carbs: 60, sodium: 1200 };
          } else if (name.includes("국밥") || name.includes("국수")) {
            return { kcal: 450, protein: 15, carbs: 65, sodium: 1800 };
          } else if (name.includes("떡볶이")) {
            return { kcal: 350, protein: 8, carbs: 70, sodium: 1500 };
          } else if (name.includes("탕수육")) {
            return { kcal: 700, protein: 25, carbs: 80, sodium: 1500 };
          } else {
            // 기본값 (한식 기준)
            return { kcal: 500, protein: 15, carbs: 75, sodium: 1500 };
          }
        };
        
        // 각 아이템에 대해 카테고리 및 영양소 추론
        const items = validItems.map(item => {
          // 카테고리가 비어있거나 null이면 메뉴명에서 추론 시도
          let category = item.restaurant;
          if (!category || category.trim() === "" || category === "알 수 없음") {
            // 순서가 중요: 더 구체적인 패턴을 먼저 체크해야 함
            const menuName = item.name.toLowerCase();
            if (menuName.includes("비빔밥") || menuName.includes("한우") || menuName.includes("생육회") || menuName.includes("김치") || menuName.includes("된장") || menuName.includes("국밥") || menuName.includes("불고기") || menuName.includes("갈비") || menuName.includes("삼겹살")) {
              category = "한식";
            } else if (menuName.includes("초밥") || menuName.includes("스시") || menuName.includes("연어") || menuName.includes("담다") || (menuName.includes("회") && !menuName.includes("생육회"))) {
              category = "일식";
            } else if (menuName.includes("짜장") || menuName.includes("짬뽕") || menuName.includes("볶음밥") || menuName.includes("탕수육") || menuName.includes("깐풍") || menuName.includes("마파두부")) {
              category = "중식";
            } else if (menuName.includes("치킨") || menuName.includes("윙")) {
              category = "치킨";
            } else {
              category = "기타";
            }
          }
          
          // 메뉴명에서 영양소 추정
          const estimated = estimateNutrition(item.name);
          
          return {
            name: item.name,
            restaurant: category, // 카테고리를 restaurant에 저장
            consumption: 100,
            // 토핑 정보 저장 (foodDescription에 사용)
            topping: item.topping || "",
            // UI 표시용 추정 영양소를 baseKcal로도 저장 (섭취량 조절 시 사용)
            baseKcal: estimated.kcal, // 텍스트 입력 시에도 baseKcal 설정
            baseProtein: estimated.protein,
            baseCarbs: estimated.carbs,
            baseSodium: estimated.sodium,
            // UI 표시용 추정값 (별도 필드로 저장)
            estimatedKcal: estimated.kcal,
            estimatedProtein: estimated.protein,
            estimatedCarbs: estimated.carbs,
            estimatedSodium: estimated.sodium,
          };
        });

        // 전체 영양소 합계 계산 (추정값 사용)
        const totalNutrition = items.reduce(
          (acc, item) => ({
            calories: acc.calories + (item.baseKcal || item.estimatedKcal || 0),
            protein: acc.protein + (item.baseProtein || item.estimatedProtein || 0),
            carbs: acc.carbs + (item.baseCarbs || item.estimatedCarbs || 0),
            sodium: acc.sodium + (item.baseSodium || item.estimatedSodium || 0),
          }),
          { calories: 0, protein: 0, carbs: 0, sodium: 0 }
        );

        // 나트륨 레벨 판단
        let sodiumLevel: "저나트륨" | "적정" | "고나트륨" = "적정";
        if (totalNutrition.sodium > 2000) {
          sodiumLevel = "고나트륨";
        } else if (totalNutrition.sodium < 1000) {
          sodiumLevel = "저나트륨";
        }

        // 칼로리 레벨 판단
        let calorieLevel: "적정" | "과식" = "적정";
        if (totalNutrition.calories > 800) {
          calorieLevel = "과식";
        }

        const mockResult: MealRecord = {
          id: Date.now().toString(),
          date: mealDate,
          time: getTimeByMealTime(mealTime),
          mealTime: mealTime,
          items: items,
          nutrition: totalNutrition,
          sodiumLevel: sodiumLevel,
          calorieLevel: calorieLevel,
          imageName: "text_input"
        };

        setAnalysisResult(mockResult);
        toast.success("분석이 완료되었어요! 🎉");
      }
    } catch (error: any) {
      console.error("분석 중 오류:", error);
      toast.error(error.message || "분석 중 오류가 발생했습니다.");
    } finally {
      setIsAnalyzing(false);
      setIsUploading(false);
    }
  };

  const handleSaveRecord = async () => {
    if (!analysisResult) return;

    try {
      // 사진 입력 모드와 텍스트 입력 모드 모두 동일하게 저장 처리

      // mealTime을 백엔드 형식으로 변환
      const mealTimeMap: Record<"아침" | "점심" | "저녁" | "야식", "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK"> = {
        "아침": "BREAKFAST",
        "점심": "LUNCH",
        "저녁": "DINNER",
        "야식": "SNACK",
      };

      const mealTimeEnum = mealTimeMap[analysisResult.mealTime];
      
      // S3 키가 있으면 presigned GET URL 생성
      let foodImageUrl: string | undefined = undefined;
      if (s3Key) {
        try {
          // 백엔드에서 presigned GET URL 요청
          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
          const presignedGetData = await axios.post<{ success: boolean; data: { presignedUrl: string } }>(
            `${API_BASE_URL}/api/v1/storage/presigned-get-url`,
            { key: s3Key },
            { withCredentials: true }
          );
          foodImageUrl = presignedGetData.data.data.presignedUrl;
        } catch (error) {
          console.warn("Presigned GET URL 생성 실패, 이미지 없이 저장합니다:", error);
        }
      }

      // 각 메뉴 항목에 대해 순차적으로 저장 (Deadlock 방지)
      for (const item of analysisResult.items) {
        // 섭취량을 serving으로 변환 (consumption이 100이면 1.0, 50이면 0.5)
        const serving = (item.consumption ?? 100) / 100;

        // 영양소 정보가 있으면 사용, 없으면 백엔드에서 추론하도록 undefined 전달
        let adjustedKcal: number | undefined = undefined;
        let adjustedSodium: number | undefined = undefined;
        let adjustedProtein: number | undefined = undefined;
        let adjustedCarbs: number | undefined = undefined;

        // baseKcal 또는 estimatedKcal이 있으면 사용 (텍스트 입력 시 estimatedKcal 사용)
        const baseKcal = item.baseKcal ?? item.estimatedKcal ?? 0;
        const baseSodium = item.baseSodium ?? item.estimatedSodium ?? 0;
        const baseProtein = item.baseProtein ?? item.estimatedProtein ?? 0;
        const baseCarbs = item.baseCarbs ?? item.estimatedCarbs ?? 0;

        // 영양소 값이 0보다 크면 사용
        if (baseKcal > 0) {
          adjustedKcal = baseKcal * serving;
        }
        if (baseSodium > 0) {
          adjustedSodium = baseSodium * serving;
        }
        if (baseProtein > 0) {
          adjustedProtein = baseProtein * serving;
        }
        if (baseCarbs > 0) {
          adjustedCarbs = baseCarbs * serving;
        }

        // foodDescription 생성 (메뉴명, 식당명, 토핑 정보 포함)
        let foodDescription = item.name;
        if (item.restaurant && item.restaurant.trim() !== "" && item.restaurant !== "알 수 없음" && item.restaurant !== "분석 결과" && item.restaurant !== "기타") {
          foodDescription += ` (${item.restaurant})`;
        }
        if (item.topping && item.topping.trim() !== "") {
          foodDescription += ` - ${item.topping}`;
        }

        // createInsightLog 호출 (백엔드 API 구조에 맞게, 영양소 정보 직접 전달)
        await createInsightLog({
          menu: item.name,
          foodImageUrl: foodImageUrl,
          foodDescription: foodDescription,
          serving: serving,
          mealtime: mealTimeEnum,
          mealDate: analysisResult.date, // "YYYY-MM-DD" 형식
          // 이미 분석된 영양소 정보가 있으면 전달, 없으면 백엔드에서 추론
          kcal: adjustedKcal,
          sodiumMg: adjustedSodium,
          proteinG: adjustedProtein,
          carbG: adjustedCarbs,
          // 카테고리 정보 전달 (기타가 아닌 경우만)
          // 텍스트 입력 모드에서도 카테고리가 제대로 전달되도록 수정
          category: item.restaurant && item.restaurant.trim() !== "" && item.restaurant !== "알 수 없음" && item.restaurant !== "분석 결과" && item.restaurant !== "기타"
            ? item.restaurant 
            : undefined,
        });
      }
      
      toast.success("캘린더에 기록되었어요!");
      
      // 최근 기록 다시 불러오기
      await loadRecentRecords();
      
      // 초기화
      setScreenshot(null);
      setScreenshotPreview(null);
      setAnalysisResult(null);
      setS3Key(null);
      setMealDate(new Date().toISOString().split('T')[0]);
      setMealTime("점심");
      setTextMealItems([{ name: "", restaurant: "", topping: "" }]);
    } catch (error: any) {
      console.error("기록 저장 중 오류:", error);
      toast.error(error.message || "기록 저장 중 오류가 발생했습니다.");
    }
  };

  const addMealItem = () => {
    setTextMealItems([...textMealItems, { name: "", restaurant: "", topping: "" }]);
  };

  const removeMealItem = (index: number) => {
    if (textMealItems.length > 1) {
      setTextMealItems(textMealItems.filter((_, i) => i !== index));
    }
  };

  const updateMealItem = (index: number, field: "name" | "restaurant" | "topping", value: string) => {
    const updated = [...textMealItems];
    updated[index] = { ...updated[index], [field]: value };
    
    // 메뉴명이 변경되면 자동으로 카테고리 추정
    if (field === "name" && value.trim() !== "") {
      const menuName = value.toLowerCase();
      let category = "";
      
      // 순서가 중요: 더 구체적인 패턴을 먼저 체크해야 함
      if (menuName.includes("비빔밥") || menuName.includes("한우") || menuName.includes("생육회") || 
          menuName.includes("김치") || menuName.includes("된장") || menuName.includes("국밥") || 
          menuName.includes("불고기") || menuName.includes("갈비") || menuName.includes("삼겹살") ||
          menuName.includes("김밥") || menuName.includes("떡볶이") || menuName.includes("순두부") ||
          menuName.includes("된장찌개") || menuName.includes("김치찌개") || menuName.includes("부대찌개") ||
          menuName.includes("제육볶음") || menuName.includes("닭볶음탕") || menuName.includes("해물파전")) {
        category = "한식";
      } else if (menuName.includes("초밥") || menuName.includes("스시") || menuName.includes("연어") || 
                 menuName.includes("담다") || (menuName.includes("회") && !menuName.includes("생육회")) ||
                 menuName.includes("우동") || menuName.includes("라멘") || menuName.includes("돈까스") ||
                 menuName.includes("규동") || menuName.includes("오므라이스")) {
        category = "일식";
      } else if (menuName.includes("짜장") || menuName.includes("짬뽕") || menuName.includes("볶음밥") || 
                 menuName.includes("탕수육") || menuName.includes("깐풍") || menuName.includes("마파두부") ||
                 menuName.includes("양장피") || menuName.includes("유산슬") || menuName.includes("깐쇼새우")) {
        category = "중식";
      } else if (menuName.includes("치킨") || menuName.includes("윙") || menuName.includes("닭강정")) {
        category = "치킨";
      } else if (menuName.includes("파스타") || menuName.includes("스테이크") || menuName.includes("피자") ||
                 menuName.includes("햄버거") || menuName.includes("샐러드") || menuName.includes("리조또")) {
        category = "양식";
      } else if (menuName.includes("쌀국수") || menuName.includes("팟타이") || menuName.includes("똠양꿍") ||
                 menuName.includes("월남쌈") || menuName.includes("분짜")) {
        category = "아시안";
      } else if (menuName.includes("타코") || menuName.includes("부리또") || menuName.includes("퀘사디아")) {
        category = "멕시칸";
      } else {
        category = "기타";
      }
      
      // 식당 이름이 비어있거나 기타가 아닌 경우에만 자동으로 카테고리 설정
      if (!updated[index].restaurant || updated[index].restaurant.trim() === "" || updated[index].restaurant === "기타") {
        updated[index].restaurant = category;
      }
    }
    
    setTextMealItems(updated);
  };

  const updateAnalysisItemConsumption = (index: number, consumption: number) => {
    if (!analysisResult) return;
    
    const updatedItems = [...analysisResult.items];
    updatedItems[index] = {
      ...updatedItems[index],
      consumption: consumption ?? 100 
    };
    
    // 섭취량에 따라 영양소 재계산 (baseKcal이 있으면 사용, 없으면 estimatedKcal 사용)
    const recalculatedNutrition = updatedItems.reduce(
      (acc, item) => {
        const consumptionRatio = (item.consumption ?? 100) / 100;
        const baseKcal = item.baseKcal ?? item.estimatedKcal ?? 0;
        const baseProtein = item.baseProtein ?? item.estimatedProtein ?? 0;
        const baseCarbs = item.baseCarbs ?? item.estimatedCarbs ?? 0;
        const baseSodium = item.baseSodium ?? item.estimatedSodium ?? 0;
        
        return {
          calories: acc.calories + Math.round(baseKcal * consumptionRatio),
          protein: acc.protein + Math.round(baseProtein * consumptionRatio),
          carbs: acc.carbs + Math.round(baseCarbs * consumptionRatio),
          sodium: acc.sodium + Math.round(baseSodium * consumptionRatio)
        };
      },
      { calories: 0, protein: 0, carbs: 0, sodium: 0 }
    );

    // 상태 업데이트
    setAnalysisResult({
      ...analysisResult,
      items: updatedItems,
      nutrition: recalculatedNutrition,
      sodiumLevel: recalculatedNutrition.sodium > 2000 ? "고나트륨" : recalculatedNutrition.sodium < 1000 ? "저나트륨" : "적정",
      calorieLevel: recalculatedNutrition.calories > 2000 ? "과식" : "적정",
    });
    
    // 나트륨 레벨 재계산
    let sodiumLevel: "저나트륨" | "적정" | "고나트륨" = "적정";
    if (recalculatedNutrition.sodium > 2000) {
      sodiumLevel = "고나트륨";
    } else if (recalculatedNutrition.sodium < 1000) {
      sodiumLevel = "저나트륨";
    }
    
    // 칼로리 레벨 재계산
    let calorieLevel: "적정" | "과식" = "적정";
    if (recalculatedNutrition.calories > 800) {
      calorieLevel = "과식";
    }
    
    setAnalysisResult({
      ...analysisResult,
      items: updatedItems,
      nutrition: recalculatedNutrition,
      sodiumLevel: sodiumLevel,
      calorieLevel: calorieLevel
    });
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
                <CardTitle>식사 기록하기</CardTitle>
                <CardDescription>
                  사진을 업로드하거나 텍스트로 직접 입력할 수 있어요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 입력 모드 선택 */}
                <div className="flex gap-2 border-b pb-4">
                  <Button
                    type="button"
                    variant={inputMode === "photo" ? "default" : "outline"}
                    onClick={() => {
                      setInputMode("photo");
                      setTextMealItems([{ name: "", restaurant: "", topping: "" }]);
                    }}
                    className="flex-1"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    사진 업로드
                  </Button>
                  <Button
                    type="button"
                    variant={inputMode === "text" ? "default" : "outline"}
                    onClick={() => {
                      setInputMode("text");
                      setScreenshot(null);
                      setScreenshotPreview(null);
                    }}
                    className="flex-1"
                  >
                    <Type className="w-4 h-4 mr-2" />
                    텍스트 입력
                  </Button>
                </div>
                {/* 사진 업로드 모드 */}
                {inputMode === "photo" && (
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
                )}

                {/* 텍스트 입력 모드 */}
                {inputMode === "text" && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <Type className="w-4 h-4 inline mr-2" />
                        먹은 음식을 텍스트로 입력해주세요
                      </p>
                    </div>
                    <div className="space-y-3">
                      {textMealItems.map((item, index) => (
                        <div key={index} className="flex gap-2 items-start border rounded-lg p-4">
                          <div className="flex-1 space-y-3">
                            <div>
                              <Label htmlFor={`meal-name-${index}`}>음식 이름 *</Label>
                              <Input
                                id={`meal-name-${index}`}
                                placeholder="예: 치킨, 비빔밥, 파스타"
                                value={item.name}
                                onChange={(e) => updateMealItem(index, "name", e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`restaurant-${index}`}>카테고리 (자동 추정)</Label>
                              <Input
                                id={`restaurant-${index}`}
                                placeholder="예: 한식, 일식, 중식, 치킨"
                                value={item.restaurant}
                                onChange={(e) => updateMealItem(index, "restaurant", e.target.value)}
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                메뉴명을 입력하면 자동으로 추정됩니다. 수정 가능합니다.
                              </p>
                            </div>
                            <div>
                              <Label htmlFor={`topping-${index}`}>토핑/추가재료 (선택)</Label>
                              <Input
                                id={`topping-${index}`}
                                placeholder="예: 치즈 추가, 계란 추가, 양파 빼기"
                                value={item.topping}
                                onChange={(e) => updateMealItem(index, "topping", e.target.value)}
                              />
                            </div>
                          </div>
                          {textMealItems.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeMealItem(index)}
                              className="mt-2"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addMealItem}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        음식 추가하기
                      </Button>
                    </div>
                  </div>
                )}

                {/* 미리보기 (사진 모드일 때만) */}
                {inputMode === "photo" && screenshotPreview && (
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

                {/* 날짜 및 시간대 입력 - 사진 업로드 또는 텍스트 입력 후에만 표시 */}
                {((inputMode === "photo" && screenshotPreview) || (inputMode === "text" && textMealItems.some(item => item.name.trim() !== ""))) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-t pt-6 mt-6"
                  >
                    <h3 className="text-lg font-semibold mb-4">식사 정보 입력</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="meal-date">식사 날짜</Label>
                        <Input
                          id="meal-date"
                          type="date"
                          value={mealDate}
                          onChange={(e) => setMealDate(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="meal-time">식사 시간대</Label>
                        <Select value={mealTime} onValueChange={(value: "아침" | "점심" | "저녁" | "야식") => setMealTime(value)}>
                          <SelectTrigger id="meal-time" className="w-full">
                            <SelectValue placeholder="시간대를 선택하세요" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="아침">아침</SelectItem>
                            <SelectItem value="점심">점심</SelectItem>
                            <SelectItem value="저녁">저녁</SelectItem>
                            <SelectItem value="야식">야식</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 분석 버튼 */}
                <Button
                  onClick={handleAnalyze}
                  disabled={
                    (inputMode === "photo" && !screenshot) ||
                    (inputMode === "text" && !textMealItems.some(item => item.name.trim() !== "")) ||
                    isAnalyzing
                  }
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
                      {inputMode === "photo" ? "영양소 자동 분석하기" : "영양소 분석하기"}
                    </>
                  )}
                </Button>
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
                    {/* 날짜 및 시간대 정보 */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">날짜: </span>
                          <span className="font-medium">{analysisResult.date}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">시간대: </span>
                          <Badge variant="outline" className="font-medium">{analysisResult.mealTime}</Badge>
                        </div>
                      </div>
                    </div>

                    {/* 메뉴 정보 */}
                    <div>
                      <h3 className="mb-3">인식된 메뉴</h3>
                      <div className="space-y-4">
                        {analysisResult.items.map((item, index) => {
                          const consumption = item.consumption !== undefined ? item.consumption : 100;
                          return (
                            <div key={index} className="border rounded-lg p-4 space-y-3">
                              <div className="flex items-center gap-2 text-sm">
                                <Badge variant="outline">{item.restaurant}</Badge>
                                <span className="font-medium">{item.name}</span>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <Label>섭취량: {consumption}%</Label>
                                </div>
                                <div className="px-1">
                                  <Slider
                                    value={[consumption]}
                                    onValueChange={(values) => updateAnalysisItemConsumption(index, values[0])}
                                    min={0}
                                    max={100}
                                    step={1}
                                    className="w-full"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
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
            {isLoadingRecords ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">최근 기록을 불러오는 중...</p>
              </div>
            ) : recentRecords.length > 0 ? (
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
                              {record.date} {record.time} <Badge variant="outline" className="ml-2">{record.mealTime}</Badge>
                            </p>
                            <div className="space-y-1">
                              {record.items.map((item, index) => (
                                <p key={index} className="text-sm">
                                  {item.name}
                                  {item.restaurant && item.restaurant.trim() !== "" && (
                                    <span className="text-muted-foreground"> ({item.restaurant})</span>
                                  )}
                                  {item.consumption !== 100 && (
                                    <span className="text-muted-foreground ml-2">- {item.consumption}%</span>
                                  )}
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
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>아직 기록된 식사가 없어요. 첫 식사를 기록해보세요! 🍽️</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}