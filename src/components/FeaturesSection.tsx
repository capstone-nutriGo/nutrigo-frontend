import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Brain, Target, Link, MapPin, Filter, RotateCcw } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI 영양소 추정",
    description: "메뉴명과 옵션을 분석하여 칼로리, 나트륨, 영양소를 정확하게 추정합니다",
    badge: "신뢰도 95%",
    details: ["카테고리별 표준 레시피 기반", "옵션/토핑 보정 알고리즘", "범위와 신뢰도 점수 제공"]
  },
  {
    icon: Target,
    title: "개인 맞춤 추천",
    description: "사용자의 건강 목표에 맞는 메뉴를 우선 추천하고 정렬합니다",
    badge: "맞춤형",
    details: ["칼로리/나트륨 목표 설정", "고단백/저염 옵션", "영양 적합도 점수"]
  },
  {
    icon: Link,
    title: "링크 분석",
    description: "배민/요기요 링크를 붙여넣으면 해당 가게의 모든 메뉴를 즉시 분석합니다",
    badge: "원클릭",
    details: ["배달앱 링크 자동 분석", "가게별 베스트 선택 하이라이트", "실시간 메뉴 크롤링"]
  },
  {
    icon: MapPin,
    title: "지역 기반 검색",
    description: "지역명만 입력해도 해당 지역의 인기 식당과 건강 메뉴를 추천받을 수 있습니다",
    badge: "자동 인덱싱",
    details: ["지역별 인기 식당 사전 분석", "교차 식당 추천", "실시간 배달 가능 여부"]
  },
  {
    icon: Filter,
    title: "스마트 필터",
    description: "다양한 영양 조건으로 메뉴를 필터링하고 정렬할 수 있습니다",
    badge: "다양한 옵션",
    details: ["칼로리/나트륨 범위 설정", "알레르기 식품 제외", "채식/비건 옵션"]
  },
  {
    icon: RotateCcw,
    title: "피드백 루프",
    description: "사용자 피드백으로 지속적으로 정확도를 개선합니다",
    badge: "지속 개선",
    details: ["영양성분표 OCR 업로드", "옵션 선택 학습", "실제 섭취 데이터 반영"]
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            왜 nutriGo를 선택해야 할까요?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            기존 배달앱과 헬스앱의 한계를 뛰어넘는 혁신적인 기능들로 건강한 배달 음식 선택을 도와드립니다
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="relative group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg w-fit">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant="secondary">{feature.badge}</Badge>
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
                
                <div className="space-y-2">
                  {feature.details.map((detail, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}