import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Info, ChevronDown, ChevronUp, Zap, Droplets, TrendingUp } from "lucide-react";

interface MenuOptionsSwapperProps {
  menu: any;
  menuId: number;
  onOptionsChange?: (menuId: number, options: any, changes: any) => void;
}

export function MenuOptionsSwapper({ menu, menuId, onOptionsChange }: MenuOptionsSwapperProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({});

  // 나트륨 레벨 계산
  const getSodiumLevel = (avgSodium: number) => {
    if (avgSodium < 800) return { label: "저나트륨", color: "text-green-600 bg-green-50 border-green-200" };
    if (avgSodium < 1500) return { label: "적정", color: "text-blue-600 bg-blue-50 border-blue-200" };
    return { label: "고나트륨", color: "text-red-600 bg-red-50 border-red-200" };
  };

  // 옵션 변경사항 계산
  const calculateChanges = (options: any) => {
    const changes = { calories: 0, sodium: 0, protein: 0 };
    
    if (options.broth === "less") {
      changes.sodium -= 200;
      changes.calories -= 30;
    } else if (options.broth === "none") {
      changes.sodium -= 400;
      changes.calories -= 50;
    }
    
    if (options.sauce === "no") {
      changes.sodium -= 300;
      changes.calories -= 80;
    } else if (options.sauce === "less") {
      changes.sodium -= 150;
      changes.calories -= 40;
    }
    
    if (options.cheese === "add") {
      changes.calories += 120;
      changes.sodium += 180;
      changes.protein += 8;
    }
    
    if (options.size === "large") {
      changes.calories += 200;
      changes.sodium += 250;
      changes.protein += 10;
    }
    
    return changes;
  };

  const updateOption = (optionType: string, value: any) => {
    const newOptions = {
      ...selectedOptions,
      [optionType]: value
    };
    setSelectedOptions(newOptions);
    
    const changes = calculateChanges(newOptions);
    if (onOptionsChange) {
      onOptionsChange(menuId, newOptions, changes);
    }
  };

  const optionChanges = calculateChanges(selectedOptions);
  const hasOptionsChanged = Object.keys(selectedOptions).length > 0;
  
  // 최종 영양소 계산
  const finalCalories = Math.round((menu.calories.min + menu.calories.max) / 2) + optionChanges.calories;
  const finalSodium = ((menu.sodium.min + menu.sodium.max) / 2) + optionChanges.sodium;
  const finalProtein = menu.protein + optionChanges.protein;

  return (
    <div className="border-t pt-4 mt-4">
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="flex items-center gap-2">
          <Info className="w-4 h-4" />
          <span>옵션 변경하여 영양소 조정하기</span>
          {hasOptionsChanged && (
            <Badge variant="secondary" className="ml-2">
              변경됨
            </Badge>
          )}
        </span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </Button>
      
      {expanded && (
        <div className="mt-4 space-y-4 bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-blue-900 font-medium mb-3">
            💡 옵션을 선택하면 실시간으로 Δ점수와 Δ영양소가 조정됩니다
          </div>
          
          {/* 현재 vs 변경 후 영양소 비교 */}
          {hasOptionsChanged && (
            <div className="bg-white p-4 rounded-lg border-2 border-blue-200 mb-4">
              <h4 className="font-semibold text-blue-900 mb-3">영양소 변화 미리보기</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">칼로리</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold">{finalCalories} kcal</span>
                    {optionChanges.calories !== 0 && (
                      <Badge className={optionChanges.calories > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                        {optionChanges.calories > 0 ? '+' : ''}{optionChanges.calories}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-muted-foreground mb-1">나트륨</div>
                  <div className="flex items-baseline gap-2">
                    <Badge className={getSodiumLevel(finalSodium).color}>
                      {getSodiumLevel(finalSodium).label}
                    </Badge>
                    {optionChanges.sodium !== 0 && (
                      <Badge className={optionChanges.sodium > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                        {optionChanges.sodium > 0 ? '+' : ''}{optionChanges.sodium}mg
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-muted-foreground mb-1">단백질</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold">{finalProtein}g</span>
                    {optionChanges.protein !== 0 && (
                      <Badge className={optionChanges.protein > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {optionChanges.protein > 0 ? '+' : ''}{optionChanges.protein}g
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* 옵션 선택 UI */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium block mb-2">국물/소스 조절</label>
              <div className="flex gap-2">
                <Button
                  variant={selectedOptions.broth === "less" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateOption("broth", selectedOptions.broth === "less" ? null : "less")}
                  className="flex-1"
                >
                  {selectedOptions.broth === "less" && "✓ "}
                  적게 (-200mg 나트륨)
                </Button>
                <Button
                  variant={selectedOptions.broth === "none" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateOption("broth", selectedOptions.broth === "none" ? null : "none")}
                  className="flex-1"
                >
                  {selectedOptions.broth === "none" && "✓ "}
                  빼기 (-400mg 나트륨)
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-2">소스</label>
              <div className="flex gap-2">
                <Button
                  variant={selectedOptions.sauce === "less" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateOption("sauce", selectedOptions.sauce === "less" ? null : "less")}
                  className="flex-1"
                >
                  {selectedOptions.sauce === "less" && "✓ "}
                  적게 (-150mg 나트륨)
                </Button>
                <Button
                  variant={selectedOptions.sauce === "no" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateOption("sauce", selectedOptions.sauce === "no" ? null : "no")}
                  className="flex-1"
                >
                  {selectedOptions.sauce === "no" && "✓ "}
                  빼기 (-300mg 나트륨)
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-2">추가 옵션</label>
              <Button
                variant={selectedOptions.cheese === "add" ? "default" : "outline"}
                size="sm"
                onClick={() => updateOption("cheese", selectedOptions.cheese === "add" ? null : "add")}
                className="w-full mb-2"
              >
                {selectedOptions.cheese === "add" && "✓ "}
                치즈 추가 (+8g 단백질, +120kcal)
              </Button>
              <Button
                variant={selectedOptions.size === "large" ? "default" : "outline"}
                size="sm"
                onClick={() => updateOption("size", selectedOptions.size === "large" ? null : "large")}
                className="w-full"
              >
                {selectedOptions.size === "large" && "✓ "}
                곱빼기 (+10g 단백질, +200kcal)
              </Button>
            </div>
          </div>
          
          {hasOptionsChanged && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-800">
                <span className="font-semibold">💡 최적화 팁:</span> 
                {optionChanges.sodium < 0 && " 나트륨을 줄여 건강한 선택을 하셨어요!"}
                {optionChanges.protein > 0 && " 단백질을 늘려 영양가를 높였어요!"}
                {optionChanges.calories < 0 && " 칼로리를 줄여 다이어트에 도움이 돼요!"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
