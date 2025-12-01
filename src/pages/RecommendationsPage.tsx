import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Star, Clock, MapPin, Zap, Droplets, TrendingUp, Filter, Search, Settings, Sparkles } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useNavigate } from "react-router-dom";
import { MenuDetailDialog } from "../components/MenuDetailDialog";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";

const mockMenus = [
  {
    id: 1,
    name: "연어 아보카도 덮밥",
    restaurant: "프레시 보울",
    image: "https://images.unsplash.com/photo-1670698783848-5cf695a1b308?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxudXRyaXRpb24lMjBmYWN0cyUyMGZvb2QlMjBhbmFseXNpc3xlbnwxfHx8fDE3NTkzODU4MDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    calories: { min: 520, max: 580, confidence: 92 },
    sodium: { min: 680, max: 750, confidence: 88 },
    protein: 28,
    carbs: 45,
    fat: 18,
    price: 13500,
    rating: 4.8,
    deliveryTime: 25,
    distance: "1.2km",
    nutritionScore: 95,
    tags: ["고단백", "오메가3", "저나트륨"],
    category: "건강식"
  },
  {
    id: 2,
    name: "닭가슴살 샐러드 (드레싱 별도)",
    restaurant: "헬시 키친",
    image: "https://images.unsplash.com/photo-1730817403162-83d5094480ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBwaG9uZSUyMGZvb2QlMjBkZWxpdmVyeSUyMGFwcHxlbnwxfHx8fDE3NTkzODU4MDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    calories: { min: 320, max: 380, confidence: 95 },
    sodium: { min: 480, max: 520, confidence: 91 },
    protein: 35,
    carbs: 12,
    fat: 8,
    price: 11000,
    rating: 4.6,
    deliveryTime: 20,
    distance: "0.8km",
    nutritionScore: 98,
    tags: ["고단백", "저칼로리", "저나트륨"],
    category: "샐러드"
  },
  {
    id: 3,
    name: "현미 비빔밥 (고추장 적게)",
    restaurant: "건강한 집밥",
    image: "https://images.unsplash.com/photo-1728396554779-845627e53861?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwa29yZWFuJTIwZm9vZCUyMGRlbGl2ZXJ5fGVufDF8fHx8MTc1OTM4NTgwM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    calories: { min: 450, max: 510, confidence: 89 },
    sodium: { min: 920, max: 1050, confidence: 85 },
    protein: 15,
    carbs: 72,
    fat: 12,
    price: 9500,
    rating: 4.4,
    deliveryTime: 30,
    distance: "1.5km",
    nutritionScore: 82,
    tags: ["현미", "채식", "전통"],
    category: "한식"
  },
  {
    id: 4,
    name: "그릭 요거트 볼 (견과류 토핑)",
    restaurant: "요거트 팩토리",
    image: "https://images.unsplash.com/photo-1670698783848-5cf695a1b308?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxudXRyaXRpb24lMjBmYWN0cyUyMGZvb2QlMjBhbmFseXNpc3xlbnwxfHx8fDE3NTkzODU4MDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    calories: { min: 280, max: 340, confidence: 90 },
    sodium: { min: 120, max: 180, confidence: 93 },
    protein: 20,
    carbs: 25,
    fat: 12,
    price: 8500,
    rating: 4.7,
    deliveryTime: 15,
    distance: "0.5km",
    nutritionScore: 88,
    tags: ["저칼로리", "프로바이오틱", "단백질"],
    category: "디저트"
  },
  {
    id: 5,
    name: "퀴노아 푸드볼 (아보카도)",
    restaurant: "슈퍼푸드 키친",
    image: "https://images.unsplash.com/photo-1730817403162-83d5094480ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBwaG9uZSUyMGZvb2QlMjBkZWxpdmVyeSUyMGFwcHxlbnwxfHx8fDE3NTkzODU4MDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    calories: { min: 490, max: 550, confidence: 87 },
    sodium: { min: 420, max: 480, confidence: 89 },
    protein: 18,
    carbs: 55,
    fat: 20,
    price: 15000,
    rating: 4.5,
    deliveryTime: 35,
    distance: "2.1km",
    nutritionScore: 90,
    tags: ["슈퍼푸드", "글루텐프리", "비건"],
    category: "건강식"
  },
  {
    id: 6,
    name: "연어 포케볼 (현미밥)",
    restaurant: "포케 하우스",
    image: "https://images.unsplash.com/photo-1728396554779-845627e53861?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwa29yZWFuJTIwZm9vZCUyMGRlbGl2ZXJ5fGVufDF8fHx8MTc1OTM4NTgwM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    calories: { min: 580, max: 640, confidence: 91 },
    sodium: { min: 750, max: 850, confidence: 86 },
    protein: 32,
    carbs: 48,
    fat: 22,
    price: 16500,
    rating: 4.9,
    deliveryTime: 28,
    distance: "1.8km",
    nutritionScore: 93,
    tags: ["고단백", "오메가3", "현미"],
    category: "건강식"
  }
];

export function RecommendationsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("mbti-score");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filteredMenus, setFilteredMenus] = useState(mockMenus);
  const [userGoals, setUserGoals] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [showAllergies, setShowAllergies] = useState(false);
  const [mbtiMode, setMbtiMode] = useState(true);
  const [deliveryAddress, setDeliveryAddress] = useState("현재 위치");
  const [addressInput, setAddressInput] = useState("");
  
  const mbtiType = localStorage.getItem("nutrigo_mbti") || "healthy";
  
  // 주소 검색 핸들러
  const handleAddressSearch = () => {
    if (addressInput.trim()) {
      setDeliveryAddress(addressInput);
      setAddressInput("");
    }
  };
  
  // M.B.T.I. 기반 점수 계산
  const calculateMBTIScore = (menu) => {
    let mbtiScore = menu.nutritionScore;
    let penalty = 0;
    let warnings = [];
    let bonuses = [];
    
    const avgSodium = (menu.sodium.min + menu.sodium.max) / 2;
    const avgCalories = (menu.calories.min + menu.calories.max) / 2;
    
    if (mbtiType === "saltSeeker") {
      // 염분 추구형: 나트륨에 엄격
      if (avgSodium > 1500) {
        penalty = Math.round((avgSodium - 1500) / 50);
        warnings.push(`나트륨 ${Math.round(avgSodium)}mg (권장 1500mg 이하)`);
      } else if (avgSodium < 800) {
        bonuses.push(`✓ 저나트륨 메뉴 (+5점)`);
        mbtiScore += 5;
      }
    } else if (mbtiType === "nightEater") {
      // 야식 선호형: 칼로리에 민감
      if (avgCalories > 600) {
        penalty = Math.round((avgCalories - 600) / 50);
        warnings.push(`칼로리 ${Math.round(avgCalories)}kcal (야식은 600kcal 이하 권장)`);
      } else {
        bonuses.push(`✓ 야식 적합 (+5점)`);
        mbtiScore += 5;
      }
    } else if (mbtiType === "binger") {
      // 간헐적 폭주형: 고칼로리 경고
      if (avgCalories > 700) {
        penalty = Math.round((avgCalories - 700) / 40);
        warnings.push(`고칼로리 ${Math.round(avgCalories)}kcal`);
      } else {
        bonuses.push(`✓ 적정 칼로리 (+3점)`);
        mbtiScore += 3;
      }
      if (menu.protein > 25) {
        bonuses.push(`✓ 고단백 (+5점)`);
        mbtiScore += 5;
      }
    } else if (mbtiType === "deliveryLover") {
      // 배달 애호형: 균형 중요
      if (avgSodium > 1200 && avgCalories > 650) {
        penalty = 10;
        warnings.push(`고나트륨 & 고칼로리 조합`);
      } else if (avgSodium < 1000 && avgCalories < 600) {
        bonuses.push(`✓ 균형 잡힌 메뉴 (+8점)`);
        mbtiScore += 8;
      }
    } else if (mbtiType === "yoyo") {
      // 요요 경험형: 지속 가능성
      if (avgCalories < 650 && menu.protein > 20) {
        bonuses.push(`✓ 지속 가능한 식단 (+7점)`);
        mbtiScore += 7;
      }
    } else if (mbtiType === "irregular") {
      // 불규칙 식사형: 영양 밀도
      if (menu.protein > 25 && avgCalories < 700) {
        bonuses.push(`✓ 영양 밀도 높음 (+6점)`);
        mbtiScore += 6;
      }
    }
    
    mbtiScore = Math.max(0, mbtiScore - penalty);
    
    return {
      ...menu,
      mbtiScore,
      warnings,
      bonuses,
      isVillain: penalty > 15
    };
  };

  useEffect(() => {
    // 저장된 영양 목표 불러오기
    const saved = localStorage.getItem('nutritionGoals');
    if (saved) {
      setUserGoals(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // 메뉴에 M.B.T.I. 점수 추가
    const menusWithMBTI = mockMenus.map(calculateMBTIScore);
    let filtered = [...menusWithMBTI];
    
    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(menu => 
        menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        menu.restaurant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        menu.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // 카테고리 필터
    if (filterCategory !== "all") {
      filtered = filtered.filter(menu => menu.category === filterCategory);
    }
    
    // 정렬
    switch (sortBy) {
      case "mbti-score":
        filtered.sort((a, b) => b.mbtiScore - a.mbtiScore);
        break;
      case "nutrition-score":
        filtered.sort((a, b) => b.nutritionScore - a.nutritionScore);
        break;
      case "calories":
        filtered.sort((a, b) => a.calories.min - b.calories.min);
        break;
      case "price":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "delivery-time":
        filtered.sort((a, b) => a.deliveryTime - b.deliveryTime);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }
    
    setFilteredMenus(filtered);
  }, [searchTerm, sortBy, filterCategory, mbtiType]);

  const getMBTIInfo = () => {
    const types = {
      saltSeeker: { name: "염분 추구형", emoji: "🧂", color: "bg-blue-500" },
      nightEater: { name: "야식 선호형", emoji: "🌙", color: "bg-indigo-500" },
      binger: { name: "간헐적 폭주형", emoji: "🍔", color: "bg-orange-500" },
      deliveryLover: { name: "배달 애호형", emoji: "📦", color: "bg-purple-500" },
      yoyo: { name: "요요 경험형", emoji: "🎢", color: "bg-pink-500" },
      irregular: { name: "불규칙 식사형", emoji: "⏰", color: "bg-yellow-500" },
      healthy: { name: "균형 유지형", emoji: "✨", color: "bg-green-500" },
      regular: { name: "규칙 실천형", emoji: "💪", color: "bg-teal-500" },
    };
    return types[mbtiType] || types.healthy;
  };

  const currentMBTI = getMBTIInfo();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* M.B.T.I. 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">맞춤 메뉴 추천</h1>
              <p className="text-muted-foreground">
                {mbtiType && mbtiType !== "healthy" ? (
                  <>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded ${currentMBTI.color} text-white mr-2`}>
                      <span>{currentMBTI.emoji}</span>
                      <span className="text-sm">{currentMBTI.name}</span>
                    </span>
                    기준으로 개인화된 추천입니다
                  </>
                ) : (
                  "영양 점수가 높은 건강한 메뉴들을 추천해드립니다."
                )}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/mbti-survey")}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {mbtiType ? "재진단" : "M.B.T.I. 진단"}
            </Button>
          </div>
          
          {/* 오늘 남은 목표 요약 */}
          {userGoals && (
            <Card className="mb-4 border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      오늘 남은 목표 ({new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })})
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-orange-700 mb-1">칼로리</div>
                        <div className="text-lg font-bold text-orange-900">
                          {Math.max(0, userGoals.calories - 800)} kcal
                        </div>
                        <div className="text-xs text-orange-600">/ {userGoals.calories}kcal</div>
                      </div>
                      <div>
                        <div className="text-xs text-orange-700 mb-1">단백질</div>
                        <div className="text-lg font-bold text-orange-900">
                          {Math.max(0, userGoals.protein - 30)}g
                        </div>
                        <div className="text-xs text-orange-600">/ {userGoals.protein}g</div>
                      </div>
                      <div>
                        <div className="text-xs text-orange-700 mb-1">나트륨</div>
                        <div className="text-lg font-bold text-orange-900">
                          {Math.max(0, userGoals.sodium - 1200)}mg
                        </div>
                        <div className="text-xs text-orange-600">/ {userGoals.sodium}mg</div>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/goals")}
                    className="text-orange-700 hover:text-orange-900 hover:bg-orange-100"
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    수정
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* M.B.T.I. 모드 토글 */}
          {mbtiType && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-semibold">
                        M.B.T.I. 맞춤 모드 {mbtiMode ? "(엄격 모드)" : "(자유 모드)"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {mbtiMode 
                          ? `${currentMBTI.name} 목표 100% 우선 - 최적화된 메뉴만 표시`
                          : `취향 50% + 목표 50% - 다양한 선택지 제공`
                        }
                      </div>
                    </div>
                  </div>
                  <Switch checked={mbtiMode} onCheckedChange={setMbtiMode} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 필터 및 검색 */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* 배달 주소 입력 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span className="font-medium">배달 주소</span>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="주소를 입력하세요 (예: 서울시 강남구 역삼동)"
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddressSearch()}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={handleAddressSearch} disabled={!addressInput.trim()}>
                    <Search className="w-4 h-4 mr-2" />
                    검색
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    <MapPin className="w-3 h-3 mr-1" />
                    {deliveryAddress}
                  </Badge>
                  {deliveryAddress !== "현재 위치" && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setDeliveryAddress("현재 위치")}
                      className="h-7 text-xs"
                    >
                      현재 위치로 초기화
                    </Button>
                  )}
                </div>
              </div>
              
              {/* 검색 및 정렬 */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="메뉴명, 식당명, 태그로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mbti-score">M.B.T.I. 점수순</SelectItem>
                    <SelectItem value="nutrition-score">영양 점수순</SelectItem>
                    <SelectItem value="calories">칼로리순</SelectItem>
                    <SelectItem value="price">가격순</SelectItem>
                    <SelectItem value="delivery-time">배달시간순</SelectItem>
                    <SelectItem value="rating">평점순</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 카테고리</SelectItem>
                    <SelectItem value="건강식">건강식</SelectItem>
                    <SelectItem value="샐러드">샐러드</SelectItem>
                    <SelectItem value="한식">한식</SelectItem>
                    <SelectItem value="디저트">디저트</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 메뉴 리스트 */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMenus.map((menu, index) => (
            <Card key={menu.id} className={`group hover:shadow-xl transition-all duration-300 overflow-hidden ${
              menu.isVillain && mbtiMode ? "border-red-300 border-2" : ""
            }`}>
              <div className="relative">
                <ImageWithFallback
                  src={menu.image}
                  alt={menu.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  {mbtiMode && menu.mbtiScore !== menu.nutritionScore ? (
                    <>
                      <Badge className={`${
                        menu.isVillain ? "bg-red-600" :
                        (menu.bonuses?.length || 0) > 0 ? "bg-green-600" :
                        "bg-primary/90"
                      } text-white`}>
                        <Sparkles className="w-3 h-3 mr-1" />
                        M.B.T.I. {menu.mbtiScore}점
                      </Badge>
                      <Badge variant="secondary" className="bg-white/90">
                        기본 {menu.nutritionScore}점
                      </Badge>
                    </>
                  ) : (
                    <Badge className="bg-primary/90 text-white">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {menu.nutritionScore}점
                    </Badge>
                  )}
                </div>
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="bg-white/90">
                    #{index + 1}
                  </Badge>
                </div>
                {menu.isVillain && mbtiMode && (
                  <div className="absolute bottom-0 left-0 right-0 bg-red-600 text-white text-center py-1.5 text-xs font-semibold">
                    ⚠️ 당신의 M.B.T.I.에 적합하지 않은 메뉴
                  </div>
                )}
              </div>
              
              <CardHeader>
                <div className="space-y-2">
                  <CardTitle className="line-clamp-2 h-12">{menu.name}</CardTitle>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{menu.restaurant}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{menu.rating}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* M.B.T.I. 경고/보너스 */}
                {mbtiMode && ((menu.warnings?.length || 0) > 0 || (menu.bonuses?.length || 0) > 0) && (
                  <div className="space-y-2">
                    {(menu.warnings || []).map((warning, idx) => (
                      <div key={idx} className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-800">
                        ⚠️ {warning}
                      </div>
                    ))}
                    {(menu.bonuses || []).map((bonus, idx) => (
                      <div key={idx} className="bg-green-50 border border-green-200 rounded p-2 text-xs text-green-800">
                        {bonus}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* 영양 정보 */}
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-1 mb-1">
                        <Zap className="w-3 h-3 text-orange-500" />
                        <span className="text-xs text-muted-foreground">칼로리</span>
                      </div>
                      <div className="font-semibold text-sm">
                        {Math.round((menu.calories.min + menu.calories.max) / 2)} kcal
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-1 mb-1">
                        <Droplets className="w-3 h-3 text-blue-500" />
                        <span className="text-xs text-muted-foreground">나트륨</span>
                      </div>
                      <Badge className={`text-xs ${
                        ((menu.sodium.min + menu.sodium.max) / 2) < 800 ? 'text-green-600 bg-green-50 border-green-200' :
                        ((menu.sodium.min + menu.sodium.max) / 2) < 1500 ? 'text-blue-600 bg-blue-50 border-blue-200' :
                        'text-red-600 bg-red-50 border-red-200'
                      }`}>
                        {((menu.sodium.min + menu.sodium.max) / 2) < 800 ? '저나트륨' :
                         ((menu.sodium.min + menu.sodium.max) / 2) < 1500 ? '적정' : '고나트륨'}
                      </Badge>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-1 mb-1">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-muted-foreground">단백질</span>
                      </div>
                      <div className="font-semibold text-sm">{menu.protein}g</div>
                    </div>
                  </div>
                </div>
                
                {/* 태그 */}
                <div className="flex flex-wrap gap-1">
                  {menu.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                {/* 배달 정보 */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{menu.deliveryTime}분</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{menu.distance}</span>
                    </div>
                  </div>
                  <div className="font-semibold">
                    {menu.price.toLocaleString()}원
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  variant={menu.isVillain && mbtiMode ? "outline" : "default"}
                  onClick={() => {setShowDetail(true); setSelectedMenu(menu);}}
                >
                  배달앱에서 주문하기
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMenus.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">검색 결과가 없습니다.</p>
            <Button variant="outline" onClick={() => {setSearchTerm(""); setFilterCategory("all");}}>
              전체 메뉴 보기
            </Button>
          </div>
        )}
      </div>

      {/* 메뉴 상세 정보 다이얼로그 */}
      {selectedMenu && (
        <MenuDetailDialog
          menu={selectedMenu}
          open={showDetail}
          onOpenChange={setShowDetail}
        />
      )}
    </div>
  );
}