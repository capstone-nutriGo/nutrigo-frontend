import { useState, useEffect } from "react";
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
  X,
  Loader2
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner@2.0.3";
import { 
  getChallenges, 
  joinChallenge, 
  getProgress, 
  createCustomChallenge,
  type ChallengeSummary,
  type ChallengeCategory,
  type ChallengeType,
  type ChallengeStatus,
  type InProgressChallenge,
  type CompletedChallenge
} from "../api/challenge";
import { handleApiError } from "../api/errorHandler";

interface Challenge {
  challengeId: number;
  title: string;
  description: string;
  type: ChallengeType;
  category: ChallengeCategory;
  durationDays: number;
  progress: number;
  status: ChallengeStatus;
  icon: any;
  goal: string;
  currentValue?: number;
  targetValue?: number;
  isCustom?: boolean;
  progressValue?: number | null;
  startedAt?: string | null;
  endedAt?: string | null;
}

// 타입별 아이콘 매핑
const getTypeIcon = (type: ChallengeType) => {
  switch (type) {
    case "kcal":
      return Zap;
    case "sodium":
      return Droplets;
    case "frequency":
      return Target;
    case "day_color":
      return Star;
    case "delivery_count":
      return Calendar;
    case "custom":
      return Trophy;
    default:
      return Target;
  }
};

// 상태를 프론트엔드 형식으로 변환
const mapStatus = (status: ChallengeStatus): "active" | "completed" | "available" => {
  // 백엔드에서 반환하는 실제 값: "available", "in-progress", "done"
  const statusLower = status?.toLowerCase();
  if (statusLower === "in-progress" || statusLower === "in_progress" || status === "IN_PROGRESS") {
    return "active";
  }
  if (statusLower === "done" || statusLower === "completed" || status === "COMPLETED" || status === "FAILED") {
    return "completed";
  }
  return "available";
};

// 백엔드 데이터를 프론트엔드 형식으로 변환
const mapChallenge = (summary: ChallengeSummary): Challenge => {
  const status = mapStatus(summary.status);
  const progress = summary.progressValue ? Math.round(summary.progressValue) : 0;
  
  return {
    challengeId: summary.challengeId,
    title: summary.title,
    description: summary.description || "",
    type: summary.type,
    category: summary.category,
    durationDays: summary.durationDays,
    progress,
    status,
    icon: getTypeIcon(summary.type),
    goal: `${progress}%`,
    progressValue: summary.progressValue,
    startedAt: summary.startedAt,
    endedAt: summary.endedAt,
    isCustom: summary.type === "custom"
  };
};

export function ChallengePage() {
  const [inProgressChallenges, setInProgressChallenges] = useState<Challenge[]>([]);
  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 챌린지 생성 다이얼로그 상태
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newChallengeName, setNewChallengeName] = useState("");
  const [newChallengeDescription, setNewChallengeDescription] = useState("");
  const [newChallengeCategory, setNewChallengeCategory] = useState<ChallengeCategory>("HEALTH");
  const [newChallengeType, setNewChallengeType] = useState<ChallengeType>("kcal");
  const [newChallengeGoal, setNewChallengeGoal] = useState([1800]);
  const [newChallengeDuration, setNewChallengeDuration] = useState("7");
  const [creating, setCreating] = useState(false);

  // 챌린지 목록 로드
  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      
      // 전체 챌린지 목록 조회
      const [allChallengesRes, progressRes] = await Promise.all([
        getChallenges().catch((error) => {
          console.error("챌린지 목록 조회 실패:", error);
          // 에러가 발생해도 빈 배열 반환하여 화면이 뜨도록 함
          return { success: true, data: { challenges: [] } };
        }),
        getProgress().catch(() => null) // 진행 상황은 선택사항
      ]);

      const allChallenges = allChallengesRes.data.challenges.map(mapChallenge);
      
      // 진행 상황 데이터가 있으면 병합
      if (progressRes) {
        const inProgressIds = new Set(progressRes.data.inProgress.map(c => c.challengeId));
        const completedIds = new Set(progressRes.data.done.map(c => c.challengeId));
        
        // 진행 중인 챌린지에 진행률 업데이트
        progressRes.data.inProgress.forEach(progress => {
          const challenge = allChallenges.find(c => c.challengeId === progress.challengeId);
          if (challenge) {
            challenge.progress = progress.progressRate;
            // mapStatus를 사용하여 변환된 상태로 설정
            challenge.status = mapStatus("in-progress" as ChallengeStatus);
          }
        });
        
        // 완료된 챌린지 업데이트
        progressRes.data.done.forEach(completed => {
          const challenge = allChallenges.find(c => c.challengeId === completed.challengeId);
          if (challenge) {
            // mapStatus를 사용하여 변환된 상태로 설정
            challenge.status = mapStatus("done" as ChallengeStatus);
            challenge.progress = 100;
          }
        });
      }
      
      // 진행 중인 챌린지, 추천 챌린지, 완료된 챌린지 분리
      const inProgress = allChallenges.filter(c => c.status === "active");
      const available = allChallenges.filter(c => c.status === "available");
      const completed = allChallenges.filter(c => c.status === "completed");
      
      setInProgressChallenges(inProgress);
      setAvailableChallenges(available);
      setCompletedChallenges(completed);
    } catch (error) {
      console.error("챌린지 로드 실패:", error);
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeInfo = (type: ChallengeType) => {
    switch (type) {
      case "kcal":
        return { label: "칼로리", icon: Zap, color: "orange", min: 1200, max: 3000, step: 100, defaultGoal: 1800, unit: "kcal" };
      case "sodium":
        return { label: "나트륨", icon: Droplets, color: "stone", min: 1000, max: 3000, step: 100, defaultGoal: 2000, unit: "mg" };
      case "frequency":
        return { label: "횟수", icon: Target, color: "green", min: 1, max: 30, step: 1, defaultGoal: 5, unit: "회" };
      case "day_color":
        return { label: "날 색상", icon: Star, color: "blue", min: 1, max: 30, step: 1, defaultGoal: 5, unit: "일" };
      case "delivery_count":
        return { label: "배달 횟수", icon: Calendar, color: "purple", min: 1, max: 30, step: 1, defaultGoal: 3, unit: "회" };
      case "custom":
        return { label: "커스텀", icon: Target, color: "accent", min: 0, max: 1000, step: 10, defaultGoal: 100, unit: "" };
      default:
        return { label: "커스텀", icon: Target, color: "accent", min: 0, max: 1000, step: 10, defaultGoal: 100, unit: "" };
    }
  };

  const handleCreateChallenge = async () => {
    if (!newChallengeName.trim()) {
      toast.error("챌린지 이름을 입력해주세요!");
      return;
    }

    try {
      setCreating(true);
      const typeInfo = getTypeInfo(newChallengeType);
      
      const request = {
        title: newChallengeName,
        description: newChallengeDescription || `${typeInfo.label} 목표를 달성하기 위한 나만의 챌린지예요`,
        category: newChallengeCategory,
        type: newChallengeType,
        durationDays: parseInt(newChallengeDuration),
        goal: {
          ...(newChallengeType === "kcal" && { maxKcalPerMeal: newChallengeGoal[0] }),
          ...(newChallengeType === "sodium" && { maxSodiumMgPerMeal: newChallengeGoal[0] }),
          ...(newChallengeType === "frequency" && { targetCount: newChallengeGoal[0] }),
          ...(newChallengeType === "custom" && { customDescription: `목표: ${newChallengeGoal[0]} ${typeInfo.unit}` })
        }
      };

      const response = await createCustomChallenge(request);
      toast.success(`"${newChallengeName}" 챌린지가 생성되었어요! 🎉`);
      
      // 챌린지 목록 다시 로드
      await loadChallenges();

      // 초기화
      setNewChallengeName("");
      setNewChallengeDescription("");
      setNewChallengeCategory("HEALTH");
      setNewChallengeType("kcal");
      const defaultTypeInfo = getTypeInfo("kcal");
      setNewChallengeGoal([defaultTypeInfo.defaultGoal]);
      setNewChallengeDuration("7");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("챌린지 생성 실패:", error);
      handleApiError(error);
    } finally {
      setCreating(false);
    }
  };

  const handleStartChallenge = async (challengeId: number) => {
    try {
      const response = await joinChallenge(challengeId);
      toast.success("챌린지를 시작했어요! 화이팅 💪");
      
      // 챌린지 목록 다시 로드
      await loadChallenges();
    } catch (error) {
      console.error("챌린지 시작 실패:", error);
      handleApiError(error);
    }
  };

  const handleDeleteChallenge = (challengeId: number) => {
    // TODO: 백엔드에 삭제 API가 있으면 구현
    toast.info("챌린지 삭제 기능은 준비 중이에요");
  };

  const getDifficultyBadge = (type: ChallengeType, category: ChallengeCategory) => {
    if (category === "FUN") {
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">재미</Badge>;
    }
    
    if (type === "day_color" || type === "frequency") {
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">중간</Badge>;
    } else if (type === "kcal") {
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

                    {/* 챌린지 설명 */}
                    <div className="space-y-2">
                      <Label htmlFor="challenge-description">챌린지 설명 (선택)</Label>
                      <Input
                        id="challenge-description"
                        placeholder="챌린지에 대한 설명을 입력해주세요"
                        value={newChallengeDescription}
                        onChange={(e) => setNewChallengeDescription(e.target.value)}
                      />
                    </div>

                    {/* 챌린지 카테고리 */}
                    <div className="space-y-2">
                      <Label>챌린지 카테고리</Label>
                      <Select value={newChallengeCategory} onValueChange={(value: ChallengeCategory) => {
                        setNewChallengeCategory(value);
                      }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HEALTH">건강</SelectItem>
                          <SelectItem value="FUN">재미</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 챌린지 유형 */}
                    <div className="space-y-2">
                      <Label>챌린지 유형</Label>
                      <Select value={newChallengeType} onValueChange={(value: ChallengeType) => {
                        setNewChallengeType(value);
                        const typeInfo = getTypeInfo(value);
                        setNewChallengeGoal([typeInfo.defaultGoal]);
                      }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kcal">
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
                          <SelectItem value="frequency">
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-green-600" />
                              횟수 목표
                            </div>
                          </SelectItem>
                          <SelectItem value="day_color">
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-blue-600" />
                              날 색상 목표
                            </div>
                          </SelectItem>
                          <SelectItem value="delivery_count">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-purple-600" />
                              배달 횟수 제한
                            </div>
                          </SelectItem>
                          <SelectItem value="custom">
                            <div className="flex items-center gap-2">
                              <Trophy className="w-4 h-4 text-amber-600" />
                              커스텀
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
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={creating}>
                      취소
                    </Button>
                    <Button onClick={handleCreateChallenge} disabled={creating}>
                      {creating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          생성 중...
                        </>
                      ) : (
                        <>
                          <Trophy className="w-4 h-4 mr-2" />
                          챌린지 시작하기
                        </>
                      )}
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
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* 진행 중인 챌린지 */}
                    {inProgressChallenges.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                          <Target className="w-6 h-6 text-green-600" />
                          진행 중인 챌린지
                        </h2>
                        <div className="grid gap-6">
                          {inProgressChallenges.map((challenge, index) => (
                            <motion.div
                              key={challenge.challengeId}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <Card className="border-green-300 bg-green-50/30 hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="p-3 rounded-lg bg-green-100">
                                  <challenge.icon className="w-6 h-6 text-secondary" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="mb-2">{challenge.title}</CardTitle>
                                    {challenge.isCustom && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteChallenge(challenge.challengeId)}
                                        className="text-muted-foreground hover:text-destructive -mt-1"
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                  <CardDescription>{challenge.description}</CardDescription>
                                </div>
                              </div>
                              {!challenge.isCustom && getDifficultyBadge(challenge.type, challenge.category)}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* 목표 */}
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">기간: {challenge.durationDays}일</span>
                              </div>
                              <span className="text-muted-foreground">진행률: {challenge.progress}%</span>
                            </div>

                            {/* 진행도 */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>진행률</span>
                                <span className="text-secondary">{challenge.progress}%</span>
                              </div>
                              <Progress value={challenge.progress} className="h-2 bg-green-100" />
                            </div>

                            {/* 진행 중 메시지 */}
                            <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-center">
                              <p className="text-sm text-green-900">
                                진행 중이에요! 계속 화이팅! 💪
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                        </div>
                      </div>
                    )}

                    {/* 추천 챌린지 */}
                    {availableChallenges.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                          <Sparkles className="w-6 h-6 text-amber-600" />
                          추천 챌린지
                        </h2>
                        <div className="grid gap-6">
                          {availableChallenges.map((challenge, index) => (
                            <motion.div
                              key={challenge.challengeId}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <Card className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                      <div className="p-3 rounded-lg bg-amber-50">
                                        <challenge.icon className="w-6 h-6 text-accent" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                          <CardTitle className="mb-2">{challenge.title}</CardTitle>
                                        </div>
                                        <CardDescription>{challenge.description}</CardDescription>
                                      </div>
                                    </div>
                                    {!challenge.isCustom && getDifficultyBadge(challenge.type, challenge.category)}
                                  </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  {/* 목표 */}
                                  <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-muted-foreground">기간: {challenge.durationDays}일</span>
                                    </div>
                                  </div>

                                  {/* 액션 버튼 */}
                                  <Button 
                                    className="w-full"
                                    onClick={() => handleStartChallenge(challenge.challengeId)}
                                  >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    챌린지 시작하기
                                  </Button>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 빈 상태 */}
                    {inProgressChallenges.length === 0 && availableChallenges.length === 0 && (
                      <Card>
                        <CardContent className="pt-12 pb-12 text-center">
                          <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                          <p className="text-muted-foreground mb-2">진행 중인 챌린지가 없어요</p>
                          <p className="text-sm text-muted-foreground">
                            지금 바로 챌린지를 시작해보세요!
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

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
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : completedChallenges.length > 0 ? (
                  <div className="grid gap-6">
                    {completedChallenges.map((challenge, index) => (
                      <motion.div
                        key={challenge.challengeId}
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
                              <span className="text-muted-foreground">기간: {challenge.durationDays}일</span>
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