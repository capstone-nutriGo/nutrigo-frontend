import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Zap, Droplets, TrendingUp, Plus, Minus, ExternalLink } from "lucide-react";

interface MenuOption {
  id: string;
  name: string;
  type: "radio" | "checkbox";
  required: boolean;
  options: {
    id: string;
    name: string;
    calories: number;
    sodium: number;
    price: number;
  }[];
}

interface MenuDetailDialogProps {
  menu: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock 데이터: 메뉴별 옵션
const menuOptions: Record<string, MenuOption[]> = {
  default: [
    {
      id: "size",
      name: "사이즈 선택",
      type: "radio",
      required: true,
      options: [
        { id: "regular", name: "보통", calories: 0, sodium: 0, price: 0 },
        { id: "large", name: "곱빼기 (+30%)", calories: 150, sodium: 200, price: 2000 },
      ],
    },
    {
      id: "rice",
      name: "밥 종류",
      type: "radio",
      required: true,
      options: [
        { id: "white", name: "백미", calories: 0, sodium: 0, price: 0 },
        { id: "brown", name: "현미 (건강)", calories: -20, sodium: -50, price: 500 },
        { id: "half", name: "밥 반공기", calories: -100, sodium: 0, price: 0 },
      ],
    },
    {
      id: "toppings",
      name: "추가 토핑",
      type: "checkbox",
      required: false,
      options: [
        { id: "egg", name: "계란 추가", calories: 80, sodium: 70, price: 1000 },
        { id: "cheese", name: "치즈 추가", calories: 120, sodium: 180, price: 1500 },
        { id: "avocado", name: "아보카도 추가", calories: 160, sodium: 10, price: 2000 },
        { id: "mushroom", name: "버섯 추가", calories: 30, sodium: 5, price: 1000 },
      ],
    },
    {
      id: "sauce",
      name: "소스",
      type: "checkbox",
      required: false,
      options: [
        { id: "soysauce", name: "간장 소스", calories: 40, sodium: 350, price: 0 },
        { id: "hot", name: "매운 소스", calories: 50, sodium: 280, price: 0 },
        { id: "mayo", name: "마요네즈", calories: 90, sodium: 150, price: 500 },
      ],
    },
  ],
};

export function MenuDetailDialog({ menu, open, onOpenChange }: MenuDetailDialogProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({
    size: ["regular"],
    rice: ["white"],
    toppings: [],
    sauce: [],
  });
  const [quantity, setQuantity] = useState(1);

  const options = menuOptions.default;

  // 선택된 옵션들의 칼로리/나트륨 합계 계산
  const calculateNutrition = () => {
    let additionalCalories = 0;
    let additionalSodium = 0;
    let additionalPrice = 0;

    options.forEach((optionGroup) => {
      const selected = selectedOptions[optionGroup.id] || [];
      optionGroup.options.forEach((option) => {
        if (selected.includes(option.id)) {
          additionalCalories += option.calories;
          additionalSodium += option.sodium;
          additionalPrice += option.price;
        }
      });
    });

    const baseCaloriesMin = menu.calories.min;
    const baseCaloriesMax = menu.calories.max;
    const baseSodiumMin = menu.sodium.min;
    const baseSodiumMax = menu.sodium.max;
    const basePrice = menu.price;

    return {
      caloriesMin: (baseCaloriesMin + additionalCalories) * quantity,
      caloriesMax: (baseCaloriesMax + additionalCalories) * quantity,
      sodiumMin: (baseSodiumMin + additionalSodium) * quantity,
      sodiumMax: (baseSodiumMax + additionalSodium) * quantity,
      totalPrice: (basePrice + additionalPrice) * quantity,
      additionalCalories,
      additionalSodium,
      additionalPrice,
    };
  };

  const handleRadioChange = (groupId: string, optionId: string) => {
    setSelectedOptions({
      ...selectedOptions,
      [groupId]: [optionId],
    });
  };

  const handleCheckboxChange = (groupId: string, optionId: string, checked: boolean) => {
    const current = selectedOptions[groupId] || [];
    if (checked) {
      setSelectedOptions({
        ...selectedOptions,
        [groupId]: [...current, optionId],
      });
    } else {
      setSelectedOptions({
        ...selectedOptions,
        [groupId]: current.filter((id) => id !== optionId),
      });
    }
  };

  const nutrition = calculateNutrition();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {menu.name}
            <Badge variant="outline">
              <TrendingUp className="w-3 h-3 mr-1" />
              {menu.nutritionScore}점
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {menu.restaurant && `${menu.restaurant} · `}
            옵션을 선택하여 정확한 영양 정보를 확인하세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 메뉴 이미지 */}
          {menu.image && (
            <div className="relative rounded-lg overflow-hidden">
              <ImageWithFallback
                src={menu.image}
                alt={menu.name}
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* 기본 영양 정보 */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold">기본 영양 정보</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-500" />
                  <span>칼로리</span>
                </div>
                <span className="font-medium">
                  {menu.calories.min}-{menu.calories.max} kcal
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span>나트륨</span>
                </div>
                <span className="font-medium">
                  {menu.sodium.min}-{menu.sodium.max} mg
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {menu.tags?.map((tag: string, idx: number) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* 옵션 선택 */}
          <div className="space-y-6">
            {options.map((optionGroup) => (
              <div key={optionGroup.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{optionGroup.name}</h3>
                  {optionGroup.required && (
                    <Badge variant="destructive" className="text-xs">
                      필수
                    </Badge>
                  )}
                </div>

                {optionGroup.type === "radio" ? (
                  <RadioGroup
                    value={selectedOptions[optionGroup.id]?.[0] || ""}
                    onValueChange={(value) => handleRadioChange(optionGroup.id, value)}
                  >
                    <div className="space-y-2">
                      {optionGroup.options.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value={option.id} id={option.id} />
                            <Label htmlFor={option.id} className="cursor-pointer">
                              {option.name}
                              {option.price > 0 && (
                                <span className="text-muted-foreground ml-2">
                                  +{option.price.toLocaleString()}원
                                </span>
                              )}
                            </Label>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {option.calories !== 0 && (
                              <span className={option.calories > 0 ? "text-orange-500" : "text-green-600"}>
                                {option.calories > 0 ? "+" : ""}
                                {option.calories} kcal
                              </span>
                            )}
                            {option.sodium !== 0 && (
                              <span className={`ml-2 ${option.sodium > 0 ? "text-blue-500" : "text-green-600"}`}>
                                {option.sodium > 0 ? "+" : ""}
                                {option.sodium} mg
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                ) : (
                  <div className="space-y-2">
                    {optionGroup.options.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={option.id}
                            checked={selectedOptions[optionGroup.id]?.includes(option.id)}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(optionGroup.id, option.id, checked as boolean)
                            }
                          />
                          <Label htmlFor={option.id} className="cursor-pointer">
                            {option.name}
                            {option.price > 0 && (
                              <span className="text-muted-foreground ml-2">
                                +{option.price.toLocaleString()}원
                              </span>
                            )}
                          </Label>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {option.calories !== 0 && (
                            <span className={option.calories > 0 ? "text-orange-500" : "text-green-600"}>
                              {option.calories > 0 ? "+" : ""}
                              {option.calories} kcal
                            </span>
                          )}
                          {option.sodium !== 0 && (
                            <span className={`ml-2 ${option.sodium > 0 ? "text-blue-500" : "text-green-600"}`}>
                              {option.sodium > 0 ? "+" : ""}
                              {option.sodium} mg
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <Separator />

          {/* 수량 선택 */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">수량</h3>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* 최종 영양 정보 */}
          <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              선택한 옵션 기준 영양 정보
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-sm text-muted-foreground mb-1">총 칼로리</div>
                <div className="text-xl font-bold text-orange-500">
                  {nutrition.caloriesMin}-{nutrition.caloriesMax}
                  <span className="text-sm ml-1">kcal</span>
                </div>
                {nutrition.additionalCalories !== 0 && (
                  <div className="text-xs text-muted-foreground">
                    기본 {menu.calories.min}-{menu.calories.max} 
                    {nutrition.additionalCalories > 0 ? " +" : " "}
                    {nutrition.additionalCalories} × {quantity}
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">총 나트륨</div>
                <div className="text-xl font-bold text-blue-500">
                  {nutrition.sodiumMin}-{nutrition.sodiumMax}
                  <span className="text-sm ml-1">mg</span>
                </div>
                {nutrition.additionalSodium !== 0 && (
                  <div className="text-xs text-muted-foreground">
                    기본 {menu.sodium.min}-{menu.sodium.max}
                    {nutrition.additionalSodium > 0 ? " +" : " "}
                    {nutrition.additionalSodium} × {quantity}
                  </div>
                )}
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="font-semibold">총 가격</span>
              <span className="text-2xl font-bold text-primary">
                {nutrition.totalPrice.toLocaleString()}원
              </span>
            </div>
            {nutrition.additionalPrice > 0 && (
              <div className="text-xs text-muted-foreground text-right">
                기본 {menu.price.toLocaleString()}원 + 옵션 {nutrition.additionalPrice.toLocaleString()}원 × {quantity}
              </div>
            )}
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-3">
            <Button className="flex-1" size="lg">
              <ExternalLink className="w-4 h-4 mr-2" />
              배달앱에서 주문하기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
