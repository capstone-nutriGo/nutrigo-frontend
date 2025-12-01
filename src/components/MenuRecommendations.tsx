import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Star, Clock, MapPin, Zap, Droplets, TrendingUp } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

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
    tags: ["고단백", "오메가3", "저나트륨"]
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
    tags: ["고단백", "저칼로리", "저나트륨"]
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
    tags: ["현미", "채식", "전통"]
  }
];

export function MenuRecommendations() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            당신을 위한 맞춤 추천 메뉴
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            설정한 영양 목표에 가장 적합한 메뉴들을 영양 점수 순으로 추천해드립니다
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {mockMenus.map((menu, index) => (
            <Card key={menu.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
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
                    #{index + 1} 추천
                  </Badge>
                </div>
              </div>
              
              <CardHeader>
                <div className="space-y-2">
                  <CardTitle className="line-clamp-1">{menu.name}</CardTitle>
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
                {/* 영양 정보 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-orange-500" />
                      <span className="text-sm">칼로리</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">{menu.calories.min}-{menu.calories.max}</span>
                      <span className="text-muted-foreground ml-1">kcal</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {menu.calories.confidence}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">나트륨</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">{menu.sodium.min}-{menu.sodium.max}</span>
                      <span className="text-muted-foreground ml-1">mg</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {menu.sodium.confidence}%
                      </Badge>
                    </div>
                  </div>
                  
                  {/* 영양소 바 */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>단백질</span>
                        <span>{menu.protein}g</span>
                      </div>
                      <Progress value={menu.protein * 2} className="h-1" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>탄수화물</span>
                        <span>{menu.carbs}g</span>
                      </div>
                      <Progress value={menu.carbs} className="h-1" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>지방</span>
                        <span>{menu.fat}g</span>
                      </div>
                      <Progress value={menu.fat * 3} className="h-1" />
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
                
                <Button className="w-full">
                  배달앱에서 주문하기
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            더 많은 메뉴 보기
          </Button>
        </div>
      </div>
    </section>
  );
}