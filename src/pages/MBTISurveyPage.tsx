import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";
import { ArrowLeft, ArrowRight, Home } from "lucide-react";

const surveyQuestions = [
  {
    id: 1,
    question: "평소 식사 시간이 불규칙한 편인가요?",
    options: [
      { value: "regular", label: "규칙적이다 (하루 3끼를 정해진 시간에)", score: { regular: 3 } },
      { value: "sometimes", label: "가끔 불규칙하다", score: { irregular: 1 } },
      { value: "irregular", label: "매우 불규칙하다 (끼니를 자주 거른다)", score: { irregular: 3 } },
    ],
  },
  {
    id: 2,
    question: "야식이나 늦은 저녁을 먹는 빈도는?",
    options: [
      { value: "never", label: "거의 먹지 않는다", score: { regular: 2 } },
      { value: "sometimes", label: "주 1-2회 정도", score: { nightEater: 1 } },
      { value: "often", label: "주 3회 이상 자주 먹는다", score: { nightEater: 3 } },
    ],
  },
  {
    id: 3,
    question: "짠 음식에 대한 선호도는?",
    options: [
      { value: "low", label: "싱거운 음식을 선호한다", score: { healthy: 2 } },
      { value: "medium", label: "보통이다", score: { saltSeeker: 1 } },
      { value: "high", label: "짠 음식을 매우 좋아한다", score: { saltSeeker: 3 } },
    ],
  },
  {
    id: 4,
    question: "스트레스를 받을 때 식습관은?",
    options: [
      { value: "control", label: "식사량이 줄어든다", score: { regular: 1 } },
      { value: "same", label: "평소와 비슷하다", score: { regular: 2 } },
      { value: "binge", label: "폭식하거나 과식한다", score: { binger: 3 } },
    ],
  },
  {
    id: 5,
    question: "배달 음식 주문 빈도는?",
    options: [
      { value: "rarely", label: "거의 주문하지 않는다 (월 1회 이하)", score: { healthy: 2 } },
      { value: "sometimes", label: "가끔 주문한다 (주 1-2회)", score: { regular: 1 } },
      { value: "often", label: "자주 주문한다 (주 3회 이상)", score: { deliveryLover: 3 } },
    ],
  },
  {
    id: 6,
    question: "식사 후 포만감 조절은?",
    options: [
      { value: "control", label: "적당히 먹고 멈춘다", score: { regular: 3 } },
      { value: "sometimes", label: "가끔 과식한다", score: { binger: 1 } },
      { value: "always", label: "자주 배부르게 먹는다", score: { binger: 2 } },
    ],
  },
  {
    id: 7,
    question: "다이어트나 건강 관리 경험은?",
    options: [
      { value: "consistent", label: "꾸준히 관리하고 있다", score: { healthy: 3 } },
      { value: "yoyo", label: "시도했다가 실패한 적이 많다", score: { yoyo: 3 } },
      { value: "never", label: "거의 시도해본 적 없다", score: { irregular: 1 } },
    ],
  },
];

const mbtiTypes = {
  saltSeeker: {
    name: "염분 추구형",
    emoji: "🧂",
    description: "짠 음식을 선호하며 나트륨 섭취에 주의가 필요해요",
    weakness: "과도한 나트륨 섭취로 인한 부종 및 혈압 상승 위험",
    strategy: "메뉴 선택 시 나트륨 함량을 우선적으로 체크하고, 소스를 절반만 선택하세요",
    color: "bg-blue-500",
  },
  nightEater: {
    name: "야식 선호형",
    emoji: "🌙",
    description: "늦은 시간 식사가 잦아 소화와 수면에 영향을 줄 수 있어요",
    weakness: "늦은 식사로 인한 소화 불량 및 체중 증가 위험",
    strategy: "저녁 식사는 가볍게, 야식은 저칼로리 메뉴로 대체하세요",
    color: "bg-indigo-500",
  },
  binger: {
    name: "간헐적 폭주형",
    emoji: "🍔",
    description: "스트레스나 감정에 따라 폭식하는 경향이 있어요",
    weakness: "불규칙한 과식으로 인한 체중 변동 및 대사 불균형",
    strategy: "작은 목표부터 시작하고, 포만감을 주는 고단백 메뉴를 선택하세요",
    color: "bg-orange-500",
  },
  deliveryLover: {
    name: "배달 애호형",
    emoji: "📦",
    description: "배달 음식을 자주 이용하며 영양 불균형이 우려돼요",
    weakness: "높은 칼로리와 나트륨, 불균형한 영양소 섭취",
    strategy: "건강한 배달 메뉴를 큐레이션하고, 채소 추가 옵션을 활용하세요",
    color: "bg-purple-500",
  },
  yoyo: {
    name: "요요 경험형",
    emoji: "🎢",
    description: "다이어트 시도 후 원래대로 돌아가는 패턴을 반복해요",
    weakness: "급격한 식단 변화 후 리바운드 경향",
    strategy: "극단적인 제한보다 지속 가능한 작은 변화부터 시작하세요",
    color: "bg-pink-500",
  },
  irregular: {
    name: "불규칙 식사형",
    emoji: "⏰",
    description: "식사 시간이 일정하지 않아 신진대사에 영향을 줄 수 있어요",
    weakness: "불규칙한 식사로 인한 혈당 변동 및 에너지 저하",
    strategy: "규칙적인 식사 시간을 설정하고, 간편한 건강 메뉴를 준비하세요",
    color: "bg-yellow-500",
  },
  healthy: {
    name: "균형 유지형",
    emoji: "✨",
    description: "비교적 건강한 식습관을 유지하고 있어요",
    weakness: "현재 상태 유지가 중요하며, 가끔 방심할 수 있음",
    strategy: "현재 패턴을 유지하면서 더 나은 선택을 위해 정보를 활용하세요",
    color: "bg-green-500",
  },
  regular: {
    name: "규칙 실천형",
    emoji: "💪",
    description: "규칙적인 식사와 관리를 실천하고 있어요",
    weakness: "너무 엄격한 관리로 인한 스트레스 가능성",
    strategy: "80/20 규칙으로 유연성을 유지하면서 건강을 관리하세요",
    color: "bg-teal-500",
  },
};

export function MBTISurveyPage() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [mbtiResult, setMbtiResult] = useState<string | null>(null);

  const progress = ((currentQuestion + 1) / surveyQuestions.length) * 100;

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion]: value });
  };

  const handleNext = () => {
    if (currentQuestion < surveyQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateMBTI();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateMBTI = () => {
    const scores: Record<string, number> = {};

    surveyQuestions.forEach((question, index) => {
      const answer = answers[index];
      if (answer) {
        const option = question.options.find((opt) => opt.value === answer);
        if (option) {
          Object.entries(option.score).forEach(([type, value]) => {
            scores[type] = (scores[type] || 0) + value;
          });
        }
      }
    });

    // 가장 높은 점수의 M.B.T.I. 유형 선택
    const result = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
    setMbtiResult(result);
    
    // M.B.T.I. 결과를 localStorage에 저장
    localStorage.setItem("nutrigo_mbti", result);
    localStorage.setItem("nutrigo_mbti_date", new Date().toISOString());
    
    setShowResult(true);
  };

  const currentMBTI = mbtiResult ? mbtiTypes[mbtiResult] : null;

  if (showResult && currentMBTI) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">{currentMBTI.emoji}</div>
            <CardTitle className="text-3xl mb-2">
              당신의 식습관 유형은
              <br />
              <span className={`${currentMBTI.color.replace('bg-', 'text-')} mt-2 inline-block`}>
                {currentMBTI.name}
              </span>
            </CardTitle>
            <p className="text-muted-foreground">{currentMBTI.description}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 유형 배지 */}
            <div className="flex justify-center">
              <div className={`${currentMBTI.color} text-white px-6 py-3 rounded-full flex items-center gap-2`}>
                <span className="text-2xl">{currentMBTI.emoji}</span>
                <span className="font-semibold">{currentMBTI.name}</span>
              </div>
            </div>

            {/* 주요 특징 */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">⚠️ 가장 흔한 함정</h3>
              <p className="text-red-700">{currentMBTI.weakness}</p>
            </div>

            {/* 극복 전략 */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">💡 맞춤 극복 전략</h3>
              <p className="text-green-700">{currentMBTI.strategy}</p>
            </div>

            {/* 안내 메시지 */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-sm text-center">
                이제부터 모든 메뉴 추천과 분석은 <span className="font-semibold">{currentMBTI.name}</span> 기준으로
                개인화됩니다. 언제든지 마이페이지에서 재진단할 수 있어요!
              </p>
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/goals")}
              >
                건강 목표 설정하기
              </Button>
              <Button
                className="flex-1"
                onClick={() => navigate("/")}
              >
                시작하기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = surveyQuestions[currentQuestion];
  const currentAnswer = answers[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              disabled={currentQuestion === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              이전
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentQuestion + 1} / {surveyQuestions.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
            >
              <Home className="w-4 h-4 mr-2" />
              홈으로
            </Button>
          </div>
          <Progress value={progress} className="mb-4" />
          <CardTitle>식습관 M.B.T.I. 진단</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">
              {question.question}
            </h3>

            <RadioGroup value={currentAnswer} onValueChange={handleAnswer}>
              <div className="space-y-3">
                {question.options.map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-start p-4 border rounded-lg hover:bg-white transition-colors cursor-pointer ${
                      currentAnswer === option.value
                        ? "border-primary bg-primary/5"
                        : "border-gray-200"
                    }`}
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={option.value}
                      className="mt-1"
                    />
                    <Label
                      htmlFor={option.value}
                      className="ml-3 cursor-pointer flex-1"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleNext}
            disabled={!currentAnswer}
          >
            {currentQuestion < surveyQuestions.length - 1 ? (
              <>
                다음 질문
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              "결과 확인하기"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}