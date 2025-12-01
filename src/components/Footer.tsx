import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { Mail, Github, Twitter, Instagram } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* 브랜드 */}
          <div className="space-y-4">
            <Logo size="md" showText={true} />
            <p className="text-muted-foreground">
              AI-powered nutrition analysis and personalized recommendations for healthier delivery food choices.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                <Github className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Instagram className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* 제품 */}
          <div className="space-y-4">
            <h3 className="font-semibold">제품</h3>
            <div className="space-y-2 text-sm">
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">AI 영양 분석</a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">맞춤 추천</a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">링크 분석</a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">지역 검색</a>
            </div>
          </div>
          
          {/* 회사 */}
          <div className="space-y-4">
            <h3 className="font-semibold">회사</h3>
            <div className="space-y-2 text-sm">
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">소개</a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">팀</a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">채용</a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">문의</a>
            </div>
          </div>
          
          {/* 뉴스레터 */}
          <div className="space-y-4">
            <h3 className="font-semibold">뉴스레터</h3>
            <p className="text-sm text-muted-foreground">
              새로운 기능과 건강한 배달 팁을 받아보세요
            </p>
            <div className="flex gap-2">
              <Input 
                placeholder="이메일 주소" 
                className="flex-1"
              />
              <Button size="sm">
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <Separator className="mb-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © 2024 nutriGo. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              개인정보처리방침
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              이용약관
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              쿠키 정책
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}