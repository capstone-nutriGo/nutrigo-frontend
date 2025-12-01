import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Search, MapPin, Link } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function HeroSection() {
  return (
    <section className="relative py-20 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                배달 음식도
                <br />
                <span className="text-primary">영양 관리</span>하며
                <br />
                똑똑하게 주문하세요
              </h1>
              <p className="text-lg text-muted-foreground">
                AI가 분석한 메뉴별 영양 정보로 개인 맞춤 건강 목표에 맞는 배달 음식을 추천받으세요
              </p>
            </div>
            
            <Card className="p-6 space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <MapPin className="w-4 h-4 mr-2" />
                  지역으로 찾기
                </Button>
                <Button variant="outline" className="flex-1">
                  <Link className="w-4 h-4 mr-2" />
                  링크 분석
                </Button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="지역명 입력 (예: 강남역, 신촌) 또는 배달앱 링크 붙여넣기"
                  className="pl-10"
                />
              </div>
              
              <Button className="w-full">
                영양 분석 시작하기
              </Button>
            </Card>
            
            <div className="flex gap-8 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">10,000+</div>
                <div className="text-sm text-muted-foreground">분석된 메뉴</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">95%</div>
                <div className="text-sm text-muted-foreground">추정 정확도</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">5,000+</div>
                <div className="text-sm text-muted-foreground">활성 사용자</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1728396554779-845627e53861?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwa29yZWFuJTIwZm9vZCUyMGRlbGl2ZXJ5fGVufDF8fHx8MTc1OTM4NTgwM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="건강한 배달 음식"
              className="rounded-2xl shadow-2xl w-full h-96 object-cover"
            />
            
            <Card className="absolute -bottom-6 -left-6 p-4 bg-white shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">AI</span>
                </div>
                <div>
                  <div className="font-semibold">실시간 영양 분석</div>
                  <div className="text-sm text-muted-foreground">칼로리 · 나트륨 · 영양소</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}