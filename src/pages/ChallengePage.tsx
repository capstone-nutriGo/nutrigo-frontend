import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Slider } from "../components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../components/ui/dialog";
import { 
  Trophy, 
  Target, 
  Flame, 
  Calendar,
  CheckCircle2,
  Sparkles,
  TrendingDown,
  Star,
  Plus,
  Zap,
  Droplets,
  X
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner@2.0.3";

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "redDays" | "calorie" | "sodium" | "streak" | "protein" | "custom";
  duration: string;
  progress: number;
  status: "active" | "completed" | "available";
  icon: any;
  goal: string;
  currentValue?: number;
  targetValue?: number;
  isCustom?: boolean;
}

// 기본 챌린지 목록
const defaultChallenges: Challenge[] = [
  {
    id: "1",
    title: "이번 주 빨간 날 3일 이하",
    description: "고칼로리 또는 고나트륨으로 기록된 날을 3일 이하로 만들어요",
    type: "redDays",
    duration: "7일",
    progress: 40,
    status: "active",
    icon: Target,
    goal: "2일 / 3일 이하",
    currentValue: 2,
    targetValue: 3,
    isCustom: false
  },
  {
    id: "2",
    title: "주간 평균 칼로리 10% 낮추기",
    description: "지난주 대비 이번 주 평균 칼로리를 10% 낮춰요",
    type: "calorie",
    duration: "7일",
    progress: 65,
    status: "active",
    icon: TrendingDown,
    goal: "1,980kcal → 1,782kcal",
    currentValue: 1850,
    targetValue: 1782,
    isCustom: false
  },
  {
    id: "3",
    title: "나트륨 상위 메뉴 1회 이하",
    description: "고나트륨 메뉴를 이번 주에 1회만 먹도록 도전해요",
    type: "sodium",
    duration: "7일",
    progress: 0,
    status: "available",
    icon: Flame,
    goal: "0회 / 1회 이하",
    currentValue: 0,
    targetValue: 1,
    isCustom: false
  },
  {
    id: "4",
    title: "3일 연속 적정 칼로리",
    description: "3일 동안 연속으로 적정 칼로리를 유지해요",
    type: "streak",
    duration: "3일",
    progress: 0,
    status: "available",
    icon: Calendar,
    goal: "0일 / 3일",
    currentValue: 0,
    targetValue: 3,
    isCustom: false
  },
  {
    id: "5",
    title: "주 5회 녹색 날 만들기",
    description: "이번 주에 5일은 녹색(적정)으로 기록되도록 노력해요",
    type: "redDays",
    duration: "7일",
    progress: 0,
    status: "available",
    icon: Star,
    goal: "0일 / 5일",
    currentValue: 0,
    targetValue: 5,
    isCustom: false
  }
];

const completedChallenges: Challenge[] = [
  {
    id: "c1",
    title: "지난 주 빨간 날 3일 이하",
    description: "고칼로리 또는 고나트륨으로 기록된 날을 3일 이하로 만들었어요",
    type: "redDays",
    duration: "7일",
    progress: 100,
    status: "completed",
    icon: Trophy,
    goal: "2일 / 3일 이하",
    currentValue: 2,
    targetValue: 3,
    isCustom: false
  },
  {
    id: "c2",
    title: "2일 연속 적정 칼로리",
    description: "2일 동안 연속으로 적정 칼로리를 유지했어요",
    type: "streak",
    duration: "2일",
    progress: 100,
    status: "completed",
    icon: CheckCircle2,
    goal: "2일 / 2일",
    currentValue: 2,
    targetValue: 2,
    isCustom: false
  }
];

export function ChallengePage() {
  const [activeChallenges, setActiveChallenges] = useState(defaultChallenges);
  
  // 챌린지 생성 다이얼로그 상태
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newChallengeName, setNewChallengeName] = useState("");
  const [newChallengeType, setNewChallengeType] = useState<"calorie" | "sodium" | "protein">("calorie");
  const [newChallengeGoal, setNewChallengeGoal] = useState([1800]);
  const [newChallengeDuration, setNewChallengeDuration] = useState("7");

  const getTypeInfo = (type: string) => {
    switch (type) {
      case "calorie":
        return { label: "칼로리", icon: Zap, color: "orange", min: 1200, max: 3000, step: 100, defaultGoal: 1800, unit: "kcal" };
      case "sodium":
        return { label: "나트륨", icon: Droplets, color: "stone", min: 1000, max: 3000, step: 100, defaultGoal: 2000, unit: "mg" };
      case "protein":
        return { label: "단백질", icon: Flame, color: "green", min: 50, max: 200, step: 10, defaultGoal: 100, unit: "g" };
      default:
        return { label: "커스텀", icon: Target, color: "accent", min: 0, max: 1000, step: 10, defaultGoal: 100, unit: "" };
    }
  };

  const handleCreateChallenge = () => {
    if (!newChallengeName.trim()) {
      toast.error("챌린지 이름을 입력해주세요!");
      return;
    }

    const typeInfo = getTypeInfo(newChallengeType);
    const newChallenge: Challenge = {
      id: Date.now().toString(),
      title: newChallengeName,
      description: `${typeInfo.label} 목표를 달성하기 위한 나만의 챌린지예요`,
      type: newChallengeType,
      duration: `${newChallengeDuration}일`,
      progress: 0,
      status: "active",
      icon: typeInfo.icon,
      goal: `0 / ${newChallengeGoal[0]} ${typeInfo.unit}`,
      currentValue: 0,
      targetValue: newChallengeGoal[0],
      isCustom: true
    };

    setActiveChallenges([newChallenge, ...activeChallenges]);
    toast.success(`"${newChallengeName}" 챌린지가 생성되었어요! 🎉`);

    // 초기화
    setNewChallengeName("");
    setNewChallengeType("calorie");
    setNewChallengeGoal([1800]);
    setNewChallengeDuration("7");
    setIsDialogOpen(false);
  };

  const handleStartChallenge = (challengeId: string) => {
    setActiveChallenges(prevChallenges =>
      prevChallenges.map(challenge =>
        challenge.id === challengeId
          ? { ...challenge, status: "active" as const }
          : challenge
      )
    );
    toast.success("챌린지를 시작했어요! 화이팅 💪");
  };

  const handleDeleteChallenge = (challengeId: string) => {
    setActiveChallenges(prevChallenges =>
      prevChallenges.filter(challenge => challenge.id !== challengeId)
    );
    toast.success("챌린지가 삭제되었어요");
  };

  const getDifficultyBadge = (type: string) => {
    if (type === "redDays" || type === "streak") {
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">중간</Badge>;
    } else if (type === "calorie") {
      return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">도전</Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">쉬움</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-stone-50 to-lime-50/30">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-5xl mx-auto">
            {/* 헤더 */}
            <div className="text-center mb-12">
              <h1 className="text-4xl mb-4">나의 챌린지</h1>
              <p className="text-lg text-muted-foreground">
                작은 목표부터 차근차근 달성해보세요 🎯
              </p>
            </div>

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
                    나만의 챌린지 만들기
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
                          <SelectItem value="calorie">
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
                          {newChallengeGoal[0]} {getTypeInfo(newChallengeType).unit}
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

            <Tabs defaultValue="active" className="mb-8">
              <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
                <TabsTrigger value="active">진행 중 & 추천</TabsTrigger>
                <TabsTrigger value="completed">완료한 챌린지</TabsTrigger>
              </TabsList>

              {/* 진행 중 & 추천 챌린지 */}
              <TabsContent value="active">
                <div className="grid gap-6">
                  {activeChallenges.map((challenge, index) => (
                    <motion.div
                      key={challenge.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={
                        challenge.status === "active" 
                          ? "border-green-300 bg-green-50/30 hover:shadow-lg transition-shadow" 
                          : "hover:shadow-lg transition-shadow"
                      }>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className={`p-3 rounded-lg ${
                                challenge.status === "active" 
                                  ? "bg-green-100" 
                                  : "bg-amber-50"
                              }`}>
                                <challenge.icon className={`w-6 h-6 ${
                                  challenge.status === "active" 
                                    ? "text-secondary" 
                                    : "text-accent"
                                }`} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <CardTitle className="mb-2">{challenge.title}</CardTitle>
                                  {challenge.isCustom && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteChallenge(challenge.id)}
                                      className="text-muted-foreground hover:text-destructive -mt-1"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                                <CardDescription>{challenge.description}</CardDescription>
                              </div>
                            </div>
                            {!challenge.isCustom && getDifficultyBadge(challenge.type)}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* 목표 */}
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">기간: {challenge.duration}</span>
                            </div>
                            <span className="text-muted-foreground">목표: {challenge.goal}</span>
                          </div>

                          {/* 진행도 */}
                          {challenge.status === "active" && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>진행률</span>
                                <span className="text-secondary">{challenge.progress}%</span>
                              </div>
                              <Progress value={challenge.progress} className="h-2 bg-green-100" />
                            </div>
                          )}

                          {/* 액션 버튼 */}
                          {challenge.status === "available" && (
                            <Button 
                              className="w-full"
                              onClick={() => handleStartChallenge(challenge.id)}
                            >
                              <Sparkles className="w-4 h-4 mr-2" />
                              챌린지 시작하기
                            </Button>
                          )}

                          {challenge.status === "active" && (
                            <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-center">
                              <p className="text-sm text-green-900">
                                진행 중이에요! 계속 화이팅! 💪
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* 안내 메시지 */}
                <Card className="mt-8 bg-green-50/50 border-green-200">
                  <CardContent className="pt-6">
                    <div className="flex gap-3">
                      <Sparkles className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-green-900">
                        <p className="mb-2">
                          챌린지는 여러분이 사진으로 기록한 식습관 데이터를 바탕으로 자동 판정돼요.
                        </p>
                        <p>
                          억지로 하지 않아도 괜찮아요. 작은 변화부터 시작해보세요! 😊
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 완료한 챌린지 */}
              <TabsContent value="completed">
                {completedChallenges.length > 0 ? (
                  <div className="grid gap-6">
                    {completedChallenges.map((challenge, index) => (
                      <motion.div
                        key={challenge.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="border-green-300 bg-green-50/30">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="p-3 rounded-lg bg-green-100">
                                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                  <CardTitle className="mb-2 flex items-center gap-2">
                                    {challenge.title}
                                    <Badge className="bg-green-600">완료</Badge>
                                  </CardTitle>
                                  <CardDescription>{challenge.description}</CardDescription>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">달성: {challenge.goal}</span>
                              <span className="text-green-600">100% 완료</span>
                            </div>

                            {/* 완료 메시지 */}
                            <div className="bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded-lg p-4 text-center">
                              <p className="text-2xl mb-2">🎉</p>
                              <p className="text-sm text-green-900">축하합니다! 챌린지를 완료했어요</p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                      <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-muted-foreground mb-2">아직 완료한 챌린지가 없어요</p>
                      <p className="text-sm text-muted-foreground">
                        지금 바로 챌린지를 시작해보세요!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </div>
  );
}