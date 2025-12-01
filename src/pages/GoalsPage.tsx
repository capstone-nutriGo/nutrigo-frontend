import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Slider } from "../components/ui/slider";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../components/ui/dialog";
import { Progress } from "../components/ui/progress";
import { Target, Zap, Droplets, Plus, Trophy, Calendar, TrendingUp, Check, X, Flame } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { motion } from "motion/react";

interface Challenge {
  id: string;
  name: string;
  type: "calories" | "sodium" | "protein" | "custom";
  goal: number;
  current: number;
  unit: string;
  duration: number; // days
  startDate: string;
  endDate: string;
  daysLeft: number;
  color: string;
}

export function GoalsPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: "1",
      name: "하루 1800kcal 지키기",
      type: "calories",
      goal: 1800,
      current: 1200,
      unit: "kcal",
      duration: 7,
      startDate: "2025-11-21",
      endDate: "2025-11-28",
      daysLeft: 1,
      color: "orange"
    },
    {
      id: "2",
      name: "나트륨 줄이기 프로젝트",
      type: "sodium",
      goal: 2000,
      current: 1400,
      unit: "mg",
      duration: 14,
      startDate: "2025-11-14",
      endDate: "2025-11-28",
      daysLeft: 1,
      color: "stone"
    }
  ]);

  // 새 챌린지 생성 다이얼로그 상태
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newChallengeName, setNewChallengeName] = useState("");
  const [newChallengeType, setNewChallengeType] = useState<"calories" | "sodium" | "protein" | "custom">("calories");
  const [newChallengeGoal, setNewChallengeGoal] = useState([1800]);
  const [newChallengeDuration, setNewChallengeDuration] = useState("7");

  const getTypeInfo = (type: string) => {
    switch (type) {
      case "calories":
        return { label: "칼로리", icon: Zap, color: "orange", min: 1200, max: 3000, step: 100, defaultGoal: 1800 };
      case "sodium":
        return { label: "나트륨", icon: Droplets, color: "stone", min: 1000, max: 3000, step: 100, defaultGoal: 2000 };
      case "protein":
        return { label: "단백질", icon: Flame, color: "green", min: 50, max: 200, step: 10, defaultGoal: 100 };
      default:
        return { label: "커스텀", icon: Target, color: "accent", min: 0, max: 1000, step: 10, defaultGoal: 100 };
    }
  };

  const handleCreateChallenge = () => {
    if (!newChallengeName.trim()) {
      toast.error("챌린지 이름을 입력해주세요!");
      return;
    }

    const typeInfo = getTypeInfo(newChallengeType);
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(newChallengeDuration));

    const newChallenge: Challenge = {
      id: Date.now().toString(),
      name: newChallengeName,
      type: newChallengeType,
      goal: newChallengeGoal[0],
      current: 0,
      unit: newChallengeType === "calories" ? "kcal" : newChallengeType === "protein" ? "g" : "mg",
      duration: parseInt(newChallengeDuration),
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      daysLeft: parseInt(newChallengeDuration),
      color: typeInfo.color
    };

    setChallenges([newChallenge, ...challenges]);
    toast.success(`"${newChallengeName}" 챌린지가 생성되었어요! 🎉`);

    // 초기화
    setNewChallengeName("");
    setNewChallengeType("calories");
    setNewChallengeGoal([1800]);
    setNewChallengeDuration("7");
    setIsDialogOpen(false);
  };

  const handleDeleteChallenge = (id: string) => {
    setChallenges(challenges.filter(c => c.id !== id));
    toast.success("챌린지가 삭제되었어요");
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 70) return "bg-accent";
    return "bg-primary";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-stone-50 to-lime-50/30">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* 헤더 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl mb-4">나의 챌린지</h1>
            <p className="text-lg text-muted-foreground">
              영양 목표를 챌린지로 만들어서 즐겁게 달성해보세요! 🎯
            </p>
          </motion.div>

          {/* 챌린지 생성 버튼 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full md:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  새 챌린지 만들기
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>새 챌린지 만들기</DialogTitle>
                  <DialogDescription>
                    달성하고 싶은 영양 목표를 챌린지로 만들어보세요
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  {/* 챌린지 이름 */}
                  <div className="space-y-2">
                    <Label htmlFor="challenge-name">챌린지 이름</Label>
                    <Input
                      id="challenge-name"
                      placeholder="예: 하루 1800kcal 지키기"
                      value={newChallengeName}
                      onChange={(e) => setNewChallengeName(e.target.value)}
                    />
                  </div>

                  {/* 챌린지 유형 */}
                  <div className="space-y-2">
                    <Label>챌린지 유형</Label>
                    <Select value={newChallengeType} onValueChange={(value: any) => {
                      setNewChallengeType(value);
                      const typeInfo = getTypeInfo(value);
                      setNewChallengeGoal([typeInfo.defaultGoal]);
                    }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="calories">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-primary" />
                            칼로리 목표
                          </div>
                        </SelectItem>
                        <SelectItem value="sodium">
                          <div className="flex items-center gap-2">
                            <Droplets className="w-4 h-4 text-stone-600" />
                            나트륨 제한
                          </div>
                        </SelectItem>
                        <SelectItem value="protein">
                          <div className="flex items-center gap-2">
                            <Flame className="w-4 h-4 text-secondary" />
                            단백질 섭취
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 목표값 설정 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>목표값</Label>
                      <Badge variant="secondary">
                        {newChallengeGoal[0]} {newChallengeType === "calories" ? "kcal" : newChallengeType === "protein" ? "g" : "mg"}
                      </Badge>
                    </div>
                    <Slider
                      value={newChallengeGoal}
                      onValueChange={setNewChallengeGoal}
                      min={getTypeInfo(newChallengeType).min}
                      max={getTypeInfo(newChallengeType).max}
                      step={getTypeInfo(newChallengeType).step}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{getTypeInfo(newChallengeType).min}</span>
                      <span>{getTypeInfo(newChallengeType).max}</span>
                    </div>
                  </div>

                  {/* 기간 설정 */}
                  <div className="space-y-2">
                    <Label>챌린지 기간</Label>
                    <Select value={newChallengeDuration} onValueChange={setNewChallengeDuration}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7일 (1주)</SelectItem>
                        <SelectItem value="14">14일 (2주)</SelectItem>
                        <SelectItem value="21">21일 (3주)</SelectItem>
                        <SelectItem value="30">30일 (1개월)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    취소
                  </Button>
                  <Button onClick={handleCreateChallenge}>
                    <Trophy className="w-4 h-4 mr-2" />
                    챌린지 시작하기
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* 챌린지 목록 */}
          {challenges.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-dashed border-2 bg-green-50/30">
                <CardContent className="py-16 text-center">
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl mb-2">아직 챌린지가 없어요</h3>
                  <p className="text-muted-foreground mb-6">
                    첫 번째 챌린지를 만들어서 영양 목표를 달성해보세요!
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    첫 챌린지 만들기
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="grid gap-6">
              {challenges.map((challenge, index) => {
                const progress = Math.min((challenge.current / challenge.goal) * 100, 100);
                const TypeIcon = getTypeInfo(challenge.type).icon;
                
                return (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * (index + 2) }}
                  >
                    <Card className={`hover:shadow-lg transition-shadow border-l-4 ${
                      challenge.color === "orange" ? "border-l-primary" :
                      challenge.color === "green" ? "border-l-secondary" :
                      "border-l-accent"
                    }`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`p-3 rounded-lg ${
                              challenge.color === "orange" ? "bg-orange-100" :
                              challenge.color === "green" ? "bg-green-100" :
                              "bg-amber-100"
                            }`}>
                              <TypeIcon className={`w-6 h-6 ${
                                challenge.color === "orange" ? "text-primary" :
                                challenge.color === "green" ? "text-secondary" :
                                "text-accent"
                              }`} />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="mb-2">{challenge.name}</CardTitle>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="text-xs">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  D-{challenge.daysLeft}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {challenge.duration}일 챌린지
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {getTypeInfo(challenge.type).label}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteChallenge(challenge.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* 진행률 */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">진행률</span>
                            <span className="font-medium">
                              {challenge.current.toLocaleString()} / {challenge.goal.toLocaleString()} {challenge.unit}
                            </span>
                          </div>
                          <Progress value={progress} className={getProgressColor(progress)} />
                          <p className="text-sm text-muted-foreground text-right">
                            {progress.toFixed(0)}% 달성
                          </p>
                        </div>

                        {/* 기간 정보 */}
                        <div className="bg-muted/50 rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground mb-1">시작일</p>
                              <p className="font-medium">{challenge.startDate}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1">종료일</p>
                              <p className="font-medium">{challenge.endDate}</p>
                            </div>
                          </div>
                        </div>

                        {/* 완료 여부 */}
                        {progress >= 100 && (
                          <div className="bg-green-50 border border-green-300 rounded-lg p-3 flex items-center gap-2">
                            <Check className="w-5 h-5 text-green-600" />
                            <span className="text-sm text-green-800">
                              오늘의 목표를 달성했어요! 🎉
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* 안내 메시지 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Card className="bg-green-50/50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-900">
                    <p className="mb-2">
                      💡 <strong>팁:</strong> 사진 기록을 통해 식사를 기록하면 자동으로 챌린지 진행률이 업데이트돼요!
                    </p>
                    <p>
                      작은 목표부터 시작해서 점진적으로 건강한 식습관을 만들어가세요 😊
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
