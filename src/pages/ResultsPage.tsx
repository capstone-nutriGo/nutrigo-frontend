import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Star, Clock, MapPin, Zap, Droplets, TrendingUp, ExternalLink, ArrowLeft, Filter, ArrowUpDown, AlertCircle, Info, ChevronDown, ChevronUp } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { MenuDetailDialog } from "../components/MenuDetailDialog";
import { Checkbox } from "../components/ui/checkbox";

const mockLocationResults = {
  location: "강남역",
  totalRestaurants: 248,
  totalMenus: 1847,
  results: [
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
      isRecommended: true
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
      isRecommended: true
    }
  ]
};

const mockUrlResults = {
  restaurantName: "프레시 보울",
  totalMenus: 18,
  bestChoice: "연어 아보카도 덮밥",
  results: [
    {
      id: 1,
      name: "연어 아보카도 덮밥",
      calories: { min: 520, max: 580, confidence: 92 },
      sodium: { min: 680, max: 750, confidence: 88 },
      protein: 28,
      carbs: 45,
      fat: 18,
      price: 13500,
      nutritionScore: 95,
      tags: ["고단백", "오메가3", "저나트륨"],
      isBest: true
    },
    {
      id: 2,
      name: "참치 마요 덮밥",
      calories: { min: 480, max: 540, confidence: 89 },
      sodium: { min: 920, max: 1050, confidence: 86 },
      protein: 25,
      carbs: 52,
      fat: 15,
      price: 12000,
      nutritionScore: 78,
      tags: ["고단백"],
      isBest: false
    },
    {
      id: 3,
      name: "치킨 테리야키 덮밥",
      calories: { min: 650, max: 720, confidence: 88 },
      sodium: { min: 1200, max: 1380, confidence: 84 },
      protein: 30,
      carbs: 68,
      fat: 22,
      price: 14000,
      nutritionScore: 65,
      tags: ["고단백"],
      isBest: false
    },
    {
      id: 4,
      name: "새우 아보카도 샐러드 덮밥",
      calories: { min: 420, max: 480, confidence: 90 },
      sodium: { min: 590, max: 650, confidence: 89 },
      protein: 24,
      carbs: 38,
      fat: 14,
      price: 13000,
      nutritionScore: 92,
      tags: ["고단백", "저칼로리", "저나트륨"],
      isBest: false
    },
    {
      id: 5,
      name: "두부 스테이크 덮밥",
      calories: { min: 380, max: 440, confidence: 91 },
      sodium: { min: 520, max: 580, confidence: 92 },
      protein: 18,
      carbs: 42,
      fat: 12,
      price: 11500,
      nutritionScore: 89,
      tags: ["저칼로리", "저나트륨", "비건"],
      isBest: false
    },
    {
      id: 6,
      name: "불고기 덮밥",
      calories: { min: 720, max: 800, confidence: 85 },
      sodium: { min: 1400, max: 1600, confidence: 82 },
      protein: 32,
      carbs: 78,
      fat: 28,
      price: 13000,
      nutritionScore: 58,
      tags: ["고단백"],
      isBest: false
    },
    {
      id: 7,
      name: "연어 포케 덮밥",
      calories: { min: 540, max: 600, confidence: 91 },
      sodium: { min: 720, max: 800, confidence: 87 },
      protein: 30,
      carbs: 48,
      fat: 19,
      price: 14500,
      nutritionScore: 88,
      tags: ["고단백", "오메가3"],
      isBest: false
    },
    {
      id: 8,
      name: "닭가슴살 야채 덮밥",
      calories: { min: 450, max: 510, confidence: 93 },
      sodium: { min: 620, max: 680, confidence: 90 },
      protein: 35,
      carbs: 42,
      fat: 10,
      price: 12500,
      nutritionScore: 93,
      tags: ["고단백", "저칼로리", "저나트륨"],
      isBest: false
    },
    {
      id: 9,
      name: "매콤 돼지고기 덮밥",
      calories: { min: 780, max: 860, confidence: 84 },
      sodium: { min: 1550, max: 1750, confidence: 80 },
      protein: 28,
      carbs: 82,
      fat: 35,
      price: 12000,
      nutritionScore: 52,
      tags: ["고단백"],
      isBest: false
    },
    {
      id: 10,
      name: "새우 튀김 덮밥",
      calories: { min: 680, max: 750, confidence: 86 },
      sodium: { min: 1150, max: 1280, confidence: 83 },
      protein: 22,
      carbs: 72,
      fat: 26,
      price: 13500,
      nutritionScore: 61,
      tags: [],
      isBest: false
    },
    {
      id: 11,
      name: "장어 덮밥",
      calories: { min: 620, max: 690, confidence: 87 },
      sodium: { min: 980, max: 1100, confidence: 85 },
      protein: 26,
      carbs: 58,
      fat: 24,
      price: 16000,
      nutritionScore: 70,
      tags: ["고단백"],
      isBest: false
    },
    {
      id: 12,
      name: "버섯 야채 비빔밥",
      calories: { min: 420, max: 480, confidence: 90 },
      sodium: { min: 850, max: 950, confidence: 86 },
      protein: 14,
      carbs: 62,
      fat: 10,
      price: 10500,
      nutritionScore: 76,
      tags: ["저칼로리", "비건"],
      isBest: false
    },
    {
      id: 13,
      name: "소고기 야채 덮밥",
      calories: { min: 640, max: 710, confidence: 88 },
      sodium: { min: 1080, max: 1200, confidence: 84 },
      protein: 28,
      carbs: 55,
      fat: 24,
      price: 15000,
      nutritionScore: 68,
      tags: ["고단백"],
      isBest: false
    },
    {
      id: 14,
      name: "퀴노아 샐러드 보울",
      calories: { min: 380, max: 440, confidence: 92 },
      sodium: { min: 480, max: 540, confidence: 91 },
      protein: 16,
      carbs: 48,
      fat: 12,
      price: 12500,
      nutritionScore: 91,
      tags: ["저칼로리", "저나트륨", "슈퍼푸드"],
      isBest: false
    },
    {
      id: 15,
      name: "훈제 오리 덮밥",
      calories: { min: 580, max: 650, confidence: 87 },
      sodium: { min: 1250, max: 1400, confidence: 83 },
      protein: 32,
      carbs: 52,
      fat: 22,
      price: 14000,
      nutritionScore: 66,
      tags: ["고단백"],
      isBest: false
    },
    {
      id: 16,
      name: "두부 김치 덮밥",
      calories: { min: 460, max: 520, confidence: 89 },
      sodium: { min: 1100, max: 1250, confidence: 85 },
      protein: 20,
      carbs: 54,
      fat: 14,
      price: 10000,
      nutritionScore: 72,
      tags: ["저칼로리"],
      isBest: false
    },
    {
      id: 17,
      name: "아보카도 에그 샌드 세트",
      calories: { min: 520, max: 580, confidence: 90 },
      sodium: { min: 780, max: 860, confidence: 88 },
      protein: 22,
      carbs: 44,
      fat: 22,
      price: 11500,
      nutritionScore: 80,
      tags: ["고단백"],
      isBest: false
    },
    {
      id: 18,
      name: "그릴드 치킨 시저 샐러드",
      calories: { min: 490, max: 550, confidence: 91 },
      sodium: { min: 920, max: 1020, confidence: 87 },
      protein: 36,
      carbs: 28,
      fat: 18,
      price: 13000,
      nutritionScore: 85,
      tags: ["고단백", "저탄수화물"],
      isBest: false
    }
  ]
};

const mockCartResults = {
  totalMenus: 3,
  totalCalories: { min: 1420, max: 1580 },
  totalSodium: { min: 2150, max: 2380 },
  totalPrice: 38500,
  recognizedMenus: [
    {
      id: 1,
      name: "불고기 버거 세트",
      restaurant: "맘스터치",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      calories: { min: 720, max: 800, confidence: 88 },
      sodium: { min: 1150, max: 1280, confidence: 85 },
      protein: 32,
      carbs: 68,
      fat: 35,
      price: 8900,
      nutritionScore: 62,
      tags: ["고단백"],
      quantity: 1
    },
    {
      id: 2,
      name: "치즈 돈까스",
      restaurant: "김가네 분식",
      image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      calories: { min: 580, max: 660, confidence: 86 },
      sodium: { min: 850, max: 950, confidence: 84 },
      protein: 28,
      carbs: 52,
      fat: 28,
      price: 9500,
      nutritionScore: 58,
      tags: ["고단백"],
      quantity: 1
    },
    {
      id: 3,
      name: "콜라 (500ml)",
      restaurant: "음료",
      image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      calories: { min: 120, max: 120, confidence: 99 },
      sodium: { min: 150, max: 150, confidence: 99 },
      protein: 0,
      carbs: 30,
      fat: 0,
      price: 2000,
      nutritionScore: 35,
      tags: ["고당류"],
      quantity: 2
    }
  ]
};

export function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState(null);
  
  const queryType = location.state?.type;
  const query = location.state?.query;

  useEffect(() => {
    // 실제로는 API 호출
    const timer = setTimeout(() => {
      if (queryType === 'location') {
        setResults({ type: 'location', data: mockLocationResults });
      } else if (queryType === 'url') {
        setResults({ type: 'url', data: mockUrlResults });
      } else if (queryType === 'cart') {
        setResults({ type: 'cart', data: mockCartResults });
      }
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [queryType]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">영양 정보 분석 중...</h2>
            <p className="text-muted-foreground">AI가 메뉴별 칼로리와 나트륨을 분석하고 있습니다</p>
            <div className="w-48 mx-auto">
              <Progress value={65} className="animate-pulse" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">분석 결과를 불러올 수 없습니다</h2>
          <Button onClick={() => navigate('/analyze')}>다시 시도하기</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {results.type === 'location' ? 
                `${results.data.location} 지역 영양 분석 결과` : 
                results.type === 'url' ?
                `${results.data.restaurantName} 메뉴 분석 결과` :
                `장바구니 영양 분석 결과`
              }
            </h1>
            <p className="text-muted-foreground">
              {results.type === 'location' ? 
                `총 ${results.data.totalRestaurants}개 식당, ${results.data.totalMenus}개 메뉴를 분석했습니다` :
                results.type === 'url' ?
                `총 ${results.data.totalMenus}개 메뉴 중 베스트 선택: ${results.data.bestChoice}` :
                `총 ${results.data.totalMenus}개 메뉴를 인식하고 영양 정보를 분석했습니다`
              }
            </p>
          </div>
        </div>

        {results.type === 'location' && (
          <LocationResults data={results.data} />
        )}
        
        {results.type === 'url' && (
          <UrlResults data={results.data} />
        )}
        
        {results.type === 'cart' && (
          <CartResults data={results.data} />
        )}
      </div>
    </div>
  );
}

function LocationResults({ data }) {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-8">
      {/* 요약 카드 */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary mb-2">{data.totalRestaurants}</div>
            <div className="text-sm text-muted-foreground">분석된 식당</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary mb-2">{data.totalMenus}</div>
            <div className="text-sm text-muted-foreground">분석된 메뉴</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary mb-2">{data.results.filter(r => r.isRecommended).length}</div>
            <div className="text-sm text-muted-foreground">추천 메뉴</div>
          </CardContent>
        </Card>
      </div>

      {/* 추천 메뉴 */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">🏆 TOP 추천 메뉴</h2>
          <Button onClick={() => navigate('/recommendations')}>
            전체 메뉴 보기
          </Button>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-6">
          {data.results.map((menu, index) => (
            <MenuCard key={menu.id} menu={menu} rank={index + 1} showRestaurant />
          ))}
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
        <Button size="lg" onClick={() => navigate('/recommendations')}>
          더 많은 메뉴 보기
        </Button>
        <Button variant="outline" size="lg" onClick={() => navigate('/goals')}>
          목표 수정하기
        </Button>
        <Button variant="outline" size="lg" onClick={() => navigate('/analyze')}>
          다른 지역 분석
        </Button>
      </div>
    </div>
  );
}

function UrlResults({ data }) {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("score");
  const [filterTag, setFilterTag] = useState("all");
  
  // 나트륨 레벨 계산
  const getSodiumLevel = (avgSodium) => {
    if (avgSodium < 800) return { label: "저나트륨", color: "text-green-600 bg-green-50 border-green-200" };
    if (avgSodium < 1500) return { label: "적정", color: "text-blue-600 bg-blue-50 border-blue-200" };
    return { label: "고나트륨", color: "text-red-600 bg-red-50 border-red-200" };
  };
  
  // 모든 고유한 태그 수집
  const allTags = Array.from(new Set(data.results.flatMap(menu => menu.tags)));
  
  // 정렬 및 필터링
  let filteredResults = [...data.results];
  
  // 필터링
  if (filterTag !== "all") {
    filteredResults = filteredResults.filter(menu => menu.tags.includes(filterTag));
  }
  
  // 정렬
  filteredResults.sort((a, b) => {
    switch (sortBy) {
      case "score":
        return b.nutritionScore - a.nutritionScore;
      case "calories-low":
        return a.calories.min - b.calories.min;
      case "calories-high":
        return b.calories.max - a.calories.max;
      case "sodium-low":
        return a.sodium.min - b.sodium.min;
      case "protein-high":
        return b.protein - a.protein;
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      default:
        return 0;
    }
  });
  
  const bestMenu = data.results.find(m => m.isBest);
  
  return (
    <div className="space-y-8">
      {/* 베스트 선택 */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            이 집 베스트 선택
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">{bestMenu?.name}</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">영양 점수</span>
                  <Badge className="bg-primary">{bestMenu?.nutritionScore}점</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">칼로리</span>
                  <span className="font-semibold">{Math.round((bestMenu?.calories.min + bestMenu?.calories.max) / 2)} kcal</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">나트륨</span>
                  <Badge className={getSodiumLevel((bestMenu?.sodium.min + bestMenu?.sodium.max) / 2).color}>
                    {getSodiumLevel((bestMenu?.sodium.min + bestMenu?.sodium.max) / 2).label}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">단백질</span>
                  <span className="font-semibold">{bestMenu?.protein}g</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">가격</span>
                  <span className="font-semibold">{bestMenu?.price.toLocaleString()}원</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {bestMenu?.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary">{tag}</Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                설정하신 영양 목표에 가장 적합한 메뉴입니다. 
                충분한 단백질과 건강한 지방을 제공하면서 나트륨은 적절히 조절되어 있습니다.
              </p>
              <Button className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                배달앱에서 주문하기
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 전체 메뉴 분석 */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold">전체 메뉴 영양 분석 ({filteredResults.length}개)</h2>
          
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* 필터 */}
            <Select value={filterTag} onValueChange={setFilterTag}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="태그 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 메뉴</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* 정렬 */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue placeholder="정렬 기준" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">영양 점수 높은순</SelectItem>
                <SelectItem value="calories-low">칼로리 낮은순</SelectItem>
                <SelectItem value="calories-high">칼로리 높은순</SelectItem>
                <SelectItem value="sodium-low">나트륨 낮은순</SelectItem>
                <SelectItem value="protein-high">단백질 높은순</SelectItem>
                <SelectItem value="price-low">가격 낮은순</SelectItem>
                <SelectItem value="price-high">가격 높은순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-4">
          {filteredResults.map((menu, index) => (
            <Card key={menu.id} className={menu.isBest ? "border-primary/50 bg-primary/5" : ""}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold">{menu.name}</h3>
                      {menu.isBest && (
                        <Badge className="bg-primary">베스트</Badge>
                      )}
                      <Badge variant="outline">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {menu.nutritionScore}점
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-1 mb-1">
                          <Zap className="w-4 h-4 text-orange-500" />
                          <span className="text-xs text-muted-foreground">칼로리</span>
                        </div>
                        <div className="font-semibold">
                          {Math.round((menu.calories.min + menu.calories.max) / 2)} kcal
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-1 mb-1">
                          <Droplets className="w-4 h-4 text-blue-500" />
                          <span className="text-xs text-muted-foreground">나트륨</span>
                        </div>
                        <Badge className={getSodiumLevel((menu.sodium.min + menu.sodium.max) / 2).color}>
                          {getSodiumLevel((menu.sodium.min + menu.sodium.max) / 2).label}
                        </Badge>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-1 mb-1">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-xs text-muted-foreground">단백질</span>
                        </div>
                        <div className="font-semibold">{menu.protein}g</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {menu.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="font-semibold text-lg">{menu.price.toLocaleString()}원</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
        <Button size="lg">
          <ExternalLink className="w-4 h-4 mr-2" />
          배달앱에서 전체 메뉴 보기
        </Button>
        <Button variant="outline" size="lg" onClick={() => navigate('/analyze')}>
          다른 식당 분석하기
        </Button>
      </div>
    </div>
  );
}

function CartResults({ data }) {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("score");
  const [filterTag, setFilterTag] = useState("all");
  const [menuOptions, setMenuOptions] = useState({});
  const [expandedMenus, setExpandedMenus] = useState({});
  
  // M.B.T.I. 기반 악당 메뉴 계산
  const mbtiType = localStorage.getItem("nutrigo_mbti") || "healthy";
  
  const getMBTITypeName = (type) => {
    const types = {
      saltSeeker: "염분 추구형 🧂",
      nightEater: "야식 선호형 🌙",
      binger: "간헐적 폭주형 🍔",
      deliveryLover: "배달 애호형 📦",
      yoyo: "요요 경험형 🎢",
      irregular: "불규칙 식사형 ⏰",
      healthy: "균형 유지형 ✨",
      regular: "규칙 실천형 💪"
    };
    return types[type] || "균형 유지형 ✨";
  };
  
  const getMBTIDescription = (type) => {
    const descriptions = {
      saltSeeker: "나트륨 섭취를 줄이는 것이 중요해요. 국물 적게, 소스 빼기 등의 옵션을 활용해보세요.",
      nightEater: "야식은 칼로리가 낮은 메뉴를 선택하는 것이 좋아요. 600kcal 이하를 목표로 해보세요.",
      binger: "한 끼에 과도한 칼로리를 섭취하지 않도록 주의하세요. 700kcal 이하가 적절해요.",
      deliveryLover: "자주 배달을 시키는 만큼 영양 균형이 중요해요. 고나트륨·고칼로리 조합을 피하세요."
    };
    return descriptions[type] || "균형 잡힌 식습관을 유지하세요.";
  };
  
  // 나트륨 레벨 계산
  const getSodiumLevel = (avgSodium) => {
    if (avgSodium < 800) return { label: "저나트륨", color: "text-green-600 bg-green-50" };
    if (avgSodium < 1500) return { label: "적정", color: "text-blue-600 bg-blue-50" };
    return { label: "고나트륨", color: "text-red-600 bg-red-50" };
  };
  
  // 각 메뉴의 M.B.T.I. 점수 계산
  const menusWithScores = data.recognizedMenus.map(menu => {
    const selectedOptions = menuOptions[menu.id] || {};
    
    // 기본 영양소
    let calories = { min: menu.calories.min, max: menu.calories.max };
    let sodium = { min: menu.sodium.min, max: menu.sodium.max };
    let protein = menu.protein;
    
    // 옵션 적용
    const optionChanges = {
      calories: 0,
      sodium: 0,
      protein: 0
    };
    
    if (selectedOptions.broth === "less") {
      optionChanges.sodium -= 200;
      optionChanges.calories -= 30;
    } else if (selectedOptions.broth === "none") {
      optionChanges.sodium -= 400;
      optionChanges.calories -= 50;
    }
    
    if (selectedOptions.sauce === "no") {
      optionChanges.sodium -= 300;
      optionChanges.calories -= 80;
    } else if (selectedOptions.sauce === "less") {
      optionChanges.sodium -= 150;
      optionChanges.calories -= 40;
    }
    
    if (selectedOptions.cheese === "add") {
      optionChanges.calories += 120;
      optionChanges.sodium += 180;
      optionChanges.protein += 8;
    }
    
    if (selectedOptions.size === "large") {
      optionChanges.calories += 200;
      optionChanges.sodium += 250;
      optionChanges.protein += 10;
    }
    
    // 최종 영양소 계산
    calories.min = Math.max(0, calories.min + optionChanges.calories);
    calories.max = Math.max(0, calories.max + optionChanges.calories);
    sodium.min = Math.max(0, sodium.min + optionChanges.sodium);
    sodium.max = Math.max(0, sodium.max + optionChanges.sodium);
    protein = Math.max(0, protein + optionChanges.protein);
    
    let mbtiScore = menu.nutritionScore;
    let penalty = 0;
    let warnings = [];
    let villainReason = "";
    
    const avgSodium = (sodium.min + sodium.max) / 2;
    const avgCalories = (calories.min + calories.max) / 2;
    
    // M.B.T.I.별 가중치 적용
    if (mbtiType === "saltSeeker") {
      if (avgSodium > 1500) {
        penalty = Math.round((avgSodium - 1500) / 50);
        warnings.push(`나트륨 ${Math.round(avgSodium)}mg (권장 1500mg 이하)`);
        villainReason = "염분 추구형인 당신에게 이 메뉴는 나트륨 함량이 너무 높아요.";
      }
    } else if (mbtiType === "nightEater") {
      if (avgCalories > 600) {
        penalty = Math.round((avgCalories - 600) / 50);
        warnings.push(`칼로리 ${Math.round(avgCalories)}kcal (야식은 600kcal 이하 권장)`);
        villainReason = "야식 선호형인 당신에게 이 메뉴는 칼로리가 너무 높아요.";
      }
    } else if (mbtiType === "binger") {
      if (avgCalories > 700) {
        penalty = Math.round((avgCalories - 700) / 40);
        warnings.push(`고칼로리 ${Math.round(avgCalories)}kcal`);
        villainReason = "간헐적 폭주형인 당신은 한 끼 칼로리 조절이 중요해요.";
      }
    } else if (mbtiType === "deliveryLover") {
      if (avgSodium > 1200 && avgCalories > 650) {
        penalty = 10;
        warnings.push(`고나트륨 & 고칼로리 조합`);
        villainReason = "배달을 자주 시키는 당신에게 이 조합은 건강에 좋지 않아요.";
      }
    }
    
    mbtiScore = Math.max(0, mbtiScore - penalty);
    
    return {
      ...menu,
      calories,
      sodium,
      protein,
      mbtiScore,
      warnings,
      villainReason,
      optionChanges,
      isVillain: penalty > 15,
      hasOptionsChanged: Object.keys(selectedOptions).length > 0
    };
  });
  
  // 악당 메뉴 찾기
  const villainMenus = menusWithScores.filter(m => m.isVillain);
  
  // 모든 고유한 태그 수집
  const allTags = Array.from(new Set(data.recognizedMenus.flatMap(menu => menu.tags)));
  
  // 정렬 및 필터링
  let filteredResults = [...menusWithScores];
  
  if (filterTag !== "all") {
    filteredResults = filteredResults.filter(menu => menu.tags.includes(filterTag));
  }
  
  filteredResults.sort((a, b) => {
    switch (sortBy) {
      case "score":
        return b.nutritionScore - a.nutritionScore;
      case "mbti-score":
        return b.mbtiScore - a.mbtiScore;
      case "calories-low":
        return a.calories.min - b.calories.min;
      case "calories-high":
        return b.calories.max - a.calories.max;
      case "sodium-low":
        return a.sodium.min - b.sodium.min;
      case "protein-high":
        return b.protein - a.protein;
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      default:
        return 0;
    }
  });
  
  const toggleOptions = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };
  
  const updateOption = (menuId, optionType, value) => {
    setMenuOptions(prev => ({
      ...prev,
      [menuId]: {
        ...(prev[menuId] || {}),
        [optionType]: value
      }
    }));
  };
  
  const bestMenu = menusWithScores.find(m => m.isBest);
  
  return (
    <div className="space-y-8">
      {/* M.B.T.I. 경고 카드 */}
      {villainMenus.length > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-2">
                  ⚠️ 악당 메뉴 발견! ({villainMenus.length}개)
                </h3>
                <p className="text-sm text-red-800 mb-3">
                  당신의 M.B.T.I. ({getMBTITypeName(mbtiType)}) 
                  기준으로 목표 적합도를 크게 낮추는 메뉴가 있어요!
                </p>
                <div className="space-y-2">
                  {villainMenus.map(menu => (
                    <div key={menu.id} className="bg-white rounded-lg p-3 border border-red-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-red-900">{menu.name}</span>
                          <div className="text-xs text-red-700 mt-1">
                            {menu.warnings.map((w, i) => (
                              <div key={i}>• {w}</div>
                            ))}
                          </div>
                        </div>
                        <Badge className="bg-red-600">
                          -{Math.round(menu.nutritionScore - menu.mbtiScore)}점
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    💡 <span className="font-semibold">최적화 제안:</span> 악당 메뉴를 제거하면 
                    전체 M.B.T.I. 점수가 <span className="font-bold text-green-900">
                      +{villainMenus.reduce((sum, m) => sum + Math.round(m.nutritionScore - m.mbtiScore), 0)}점
                    </span> 상승해요!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* 요약 카드 */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary mb-2">{data.totalMenus}</div>
            <div className="text-sm text-muted-foreground">분석된 메뉴</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary mb-2">{data.totalCalories.min}-{data.totalCalories.max} kcal</div>
            <div className="text-sm text-muted-foreground">총 칼로리</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary mb-2">{data.totalSodium.min}-{data.totalSodium.max} mg</div>
            <div className="text-sm text-muted-foreground">총 나트륨</div>
          </CardContent>
        </Card>
      </div>

      {/* 전체 메뉴 분석 */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold">전체 메뉴 영양 분석 ({filteredResults.length}개)</h2>
          
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* 필터 */}
            <Select value={filterTag} onValueChange={setFilterTag}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="태그 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 메뉴</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* 정렬 */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue placeholder="정렬 기준" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">영양 점수 높은순</SelectItem>
                <SelectItem value="mbti-score">M.B.T.I. 점수순</SelectItem>
                <SelectItem value="calories-low">칼로리 낮은순</SelectItem>
                <SelectItem value="calories-high">칼로리 높은순</SelectItem>
                <SelectItem value="sodium-low">나트륨 낮은순</SelectItem>
                <SelectItem value="protein-high">단백질 높은순</SelectItem>
                <SelectItem value="price-low">가격 낮은순</SelectItem>
                <SelectItem value="price-high">가격 높은순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-4">
          {filteredResults.map((menu, index) => (
            <Card key={menu.id} className={
              menu.isVillain ? "border-red-300 bg-red-50" : 
              menu.isBest ? "border-primary/50 bg-primary/5" : ""
            }>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold">{menu.name}</h3>
                      {menu.isVillain && (
                        <Badge className="bg-red-600">악당 메뉴</Badge>
                      )}
                      {menu.isBest && (
                        <Badge className="bg-primary">베스트</Badge>
                      )}
                      <Badge variant="outline">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {menu.nutritionScore}점
                      </Badge>
                      {menu.warnings.length > 0 && (
                        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                          M.B.T.I. {menu.mbtiScore}점
                        </Badge>
                      )}
                    </div>
                    
                    {menu.warnings.length > 0 && (
                      <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-orange-900 mb-1">왜 악당 메뉴인가요?</p>
                            <p className="text-xs text-orange-800 mb-2">{menu.villainReason}</p>
                            <div className="text-xs text-orange-700">
                              {menu.warnings.map((w, i) => (
                                <div key={i}>• {w}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* 간소화된 영양소 표시 */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-1 mb-1">
                          <Zap className="w-4 h-4 text-orange-500" />
                          <span className="text-xs text-muted-foreground">칼로리</span>
                        </div>
                        <div>
                          <div className="font-semibold">
                            {Math.round((menu.calories.min + menu.calories.max) / 2)} kcal
                          </div>
                          {menu.hasOptionsChanged && menu.optionChanges.calories !== 0 && (
                            <div className={`text-xs ${menu.optionChanges.calories > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {menu.optionChanges.calories > 0 ? '+' : ''}{menu.optionChanges.calories} kcal
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-1 mb-1">
                          <Droplets className="w-4 h-4 text-blue-500" />
                          <span className="text-xs text-muted-foreground">나트륨</span>
                        </div>
                        <div>
                          <Badge className={getSodiumLevel((menu.sodium.min + menu.sodium.max) / 2).color}>
                            {getSodiumLevel((menu.sodium.min + menu.sodium.max) / 2).label}
                          </Badge>
                          {menu.hasOptionsChanged && menu.optionChanges.sodium !== 0 && (
                            <div className={`text-xs mt-1 ${menu.optionChanges.sodium > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {menu.optionChanges.sodium > 0 ? '+' : ''}{menu.optionChanges.sodium} mg
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-1 mb-1">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-xs text-muted-foreground">단백질</span>
                        </div>
                        <div>
                          <div className="font-semibold">{menu.protein}g</div>
                          {menu.hasOptionsChanged && menu.optionChanges.protein !== 0 && (
                            <div className={`text-xs ${menu.optionChanges.protein > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {menu.optionChanges.protein > 0 ? '+' : ''}{menu.optionChanges.protein}g
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* 옵션 선택 */}
                    <div className="border-t pt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between"
                        onClick={() => toggleOptions(menu.id)}
                      >
                        <span className="flex items-center gap-2">
                          <Info className="w-4 h-4" />
                          옵션 변경하여 영양소 조정하기
                        </span>
                        {expandedMenus[menu.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                      
                      {expandedMenus[menu.id] && (
                        <div className="mt-4 space-y-4 bg-blue-50 p-4 rounded-lg">
                          <div className="text-sm text-blue-900 font-medium mb-3">
                            옵션을 선택하면 실시간으로 영양소가 조정됩니다
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">국물/소스 조절</label>
                            <div className="flex gap-2">
                              <Button
                                variant={menuOptions[menu.id]?.broth === "less" ? "default" : "outline"}
                                size="sm"
                                onClick={() => updateOption(menu.id, "broth", "less")}
                                className="flex-1"
                              >
                                적게 (-200mg 나트륨)
                              </Button>
                              <Button
                                variant={menuOptions[menu.id]?.broth === "none" ? "default" : "outline"}
                                size="sm"
                                onClick={() => updateOption(menu.id, "broth", "none")}
                                className="flex-1"
                              >
                                빼기 (-400mg 나트륨)
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">소스</label>
                            <div className="flex gap-2">
                              <Button
                                variant={menuOptions[menu.id]?.sauce === "less" ? "default" : "outline"}
                                size="sm"
                                onClick={() => updateOption(menu.id, "sauce", "less")}
                                className="flex-1"
                              >
                                적게 (-150mg 나트륨)
                              </Button>
                              <Button
                                variant={menuOptions[menu.id]?.sauce === "no" ? "default" : "outline"}
                                size="sm"
                                onClick={() => updateOption(menu.id, "sauce", "no")}
                                className="flex-1"
                              >
                                빼기 (-300mg 나트륨)
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">치즈 추가</label>
                            <Button
                              variant={menuOptions[menu.id]?.cheese === "add" ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateOption(menu.id, "cheese", menuOptions[menu.id]?.cheese === "add" ? null : "add")}
                              className="w-full"
                            >
                              {menuOptions[menu.id]?.cheese === "add" ? "✓" : ""} 치즈 추가 (+8g 단백질, +120kcal)
                            </Button>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">사이즈</label>
                            <Button
                              variant={menuOptions[menu.id]?.size === "large" ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateOption(menu.id, "size", menuOptions[menu.id]?.size === "large" ? null : "large")}
                              className="w-full"
                            >
                              {menuOptions[menu.id]?.size === "large" ? "✓" : ""} 곱빼기 (+10g 단백질, +200kcal)
                            </Button>
                          </div>
                          
                          {menu.hasOptionsChanged && (
                            <div className="mt-3 p-3 bg-white border border-blue-200 rounded">
                              <p className="text-xs font-semibold text-blue-900 mb-2">영양소 변화 요약</p>
                              <div className="text-xs space-y-1">
                                {menu.optionChanges.calories !== 0 && (
                                  <div className={menu.optionChanges.calories > 0 ? 'text-red-600' : 'text-green-600'}>
                                    칼로리: {menu.optionChanges.calories > 0 ? '+' : ''}{menu.optionChanges.calories} kcal
                                  </div>
                                )}
                                {menu.optionChanges.sodium !== 0 && (
                                  <div className={menu.optionChanges.sodium > 0 ? 'text-red-600' : 'text-green-600'}>
                                    나트륨: {menu.optionChanges.sodium > 0 ? '+' : ''}{menu.optionChanges.sodium} mg
                                  </div>
                                )}
                                {menu.optionChanges.protein !== 0 && (
                                  <div className={menu.optionChanges.protein > 0 ? 'text-green-600' : 'text-red-600'}>
                                    단백질: {menu.optionChanges.protein > 0 ? '+' : ''}{menu.optionChanges.protein}g
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {menu.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {menu.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
        <Button size="lg">
          <ExternalLink className="w-4 h-4 mr-2" />
          배달앱에서 전체 메뉴 보기
        </Button>
        <Button variant="outline" size="lg" onClick={() => navigate('/analyze')}>
          다른 식당 분석하기
        </Button>
      </div>
    </div>
  );
}

function MenuCard({ menu, rank, showRestaurant = false }) {
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  
  // 나트륨 레벨 계산
  const getSodiumLevel = (avgSodium) => {
    if (avgSodium < 800) return { label: "저나트륨", color: "text-green-600 bg-green-50 border-green-200" };
    if (avgSodium < 1500) return { label: "적정", color: "text-blue-600 bg-blue-50 border-blue-200" };
    return { label: "고나트륨", color: "text-red-600 bg-red-50 border-red-200" };
  };
  
  return (
    <>
      <Card 
        className="group hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
        onClick={() => setShowDetailDialog(true)}
      >
        <div className="relative">
          <ImageWithFallback
            src={menu.image}
            alt={menu.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3">
            <Badge className="bg-primary/90 text-white">
              <TrendingUp className="w-3 h-3 mr-1" />
              {menu.nutritionScore}점
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-white/90">
              #{rank}
            </Badge>
          </div>
        </div>
        
        <CardHeader>
          <div className="space-y-2">
            <CardTitle className="line-clamp-1">{menu.name}</CardTitle>
            {showRestaurant && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{menu.restaurant}</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{menu.rating}</span>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
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
              <Badge className={`text-xs ${getSodiumLevel((menu.sodium.min + menu.sodium.max) / 2).color}`}>
                {getSodiumLevel((menu.sodium.min + menu.sodium.max) / 2).label}
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
          
          <div className="flex flex-wrap gap-1">
            {menu.tags.map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          {showRestaurant && (
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
          )}
          
          <Button className="w-full">
            배달앱에서 주문하기
          </Button>
        </CardContent>
      </Card>
      
      <MenuDetailDialog 
        menu={menu} 
        open={showDetailDialog} 
        onOpenChange={setShowDetailDialog}
      />
    </>
  );
}