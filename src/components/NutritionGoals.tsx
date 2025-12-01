import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import { Target, Zap, Droplets, Shield } from "lucide-react";
import { useState } from "react";

export function NutritionGoals() {
  const [calories, setCalories] = useState([1800]);
  const [sodium, setSodium] = useState([2000]);
  const [lowSodium, setLowSodium] = useState(false);
  const [highProtein, setHighProtein] = useState(false);
  const [vegetarian, setVegetarian] = useState(false);

  return (
    <section className="py-20 bg-gradient-to-br from-green-50/40 via-stone-50 to-lime-50/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            나만의 영양 목표 설정하기
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            개인의 건강 목표에 맞춰 칼로리, 나트륨, 영양소 조건을 설정하고 맞춤 추천을 받아보세요
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-2">
                <Target className="w-6 h-6 text-primary" />
                영양 목표 설정
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* 칼로리 설정 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-500" />
                    <Label>일일 칼로리 목표</Label>
                    <Badge variant="secondary">{calories[0]} kcal</Badge>
                  </div>
                  <Slider
                    value={calories}
                    onValueChange={setCalories}
                    max={3000}
                    min={1200}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>1,200 kcal</span>
                    <span>3,000 kcal</span>
                  </div>
                </div>

                {/* 나트륨 설정 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    <Label>일일 나트륨 제한</Label>
                    <Badge variant="secondary">{sodium[0]} mg</Badge>
                  </div>
                  <Slider
                    value={sodium}
                    onValueChange={setSodium}
                    max={3000}
                    min={1000}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>1,000 mg</span>
                    <span>3,000 mg</span>
                  </div>
                </div>
              </div>

              {/* 특별 옵션 */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  <Label>건강 옵션</Label>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">저염식</div>
                      <div className="text-sm text-muted-foreground">나트륨 1,500mg 미만</div>
                    </div>
                    <Switch checked={lowSodium} onCheckedChange={setLowSodium} />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">고단백</div>
                      <div className="text-sm text-muted-foreground">단백질 25g 이상</div>
                    </div>
                    <Switch checked={highProtein} onCheckedChange={setHighProtein} />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">채식</div>
                      <div className="text-sm text-muted-foreground">채식 메뉴만 표시</div>
                    </div>
                    <Switch checked={vegetarian} onCheckedChange={setVegetarian} />
                  </div>
                </div>
              </div>

              {/* 저장 버튼 */}
              <div className="flex gap-4 pt-6">
                <Button className="flex-1">
                  목표 저장하고 추천받기
                </Button>
                <Button variant="outline">
                  기본값으로 재설정
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}