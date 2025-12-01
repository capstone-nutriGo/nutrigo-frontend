import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Send, Sparkles, Bot, Calendar, TrendingUp, Flame } from "lucide-react";
import { motion } from "motion/react";
import nutribotImage from "figma:asset/71504baf4a13d6260836aac5e71a616ee87c746b.png";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export function NutriBotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 초기 인사 메시지
    setMessages([
      {
        id: "1",
        role: "bot",
        content: "안녕하세요! 저는 NutriBot이에요 🤖\n\n여러분의 식습관 기록을 기반으로 간단한 코칭과 정보를 제공해드려요. 편하게 물어보세요!",
        timestamp: new Date(),
        suggestions: [
          "어제 너무 짜게 먹었는데 오늘 저녁 뭐 먹을까?",
          "이번 주 나 어떻게 먹었어?",
          "현재 진행 중인 챌린지 알려줘"
        ]
      }
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    // AI 응답 시뮬레이션
    setTimeout(() => {
      const botResponse = generateBotResponse(inputValue);
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const generateBotResponse = (userInput: string): Message => {
    const input = userInput.toLowerCase();

    // 기록 기반 응답
    if (input.includes("어제") || input.includes("오늘")) {
      return {
        id: Date.now().toString(),
        role: "bot",
        content: "어제는 치킨과 콜라를 드셨네요! 칼로리가 1,850kcal, 나트륨이 3,200mg으로 조금 높았어요 😅\n\n오늘 저녁은 가볍게 먹어보는 건 어떨까요?\n\n추천 메뉴:\n• 비빔밥 (채소 많이)\n• 해물 칼국수 (국물 적게)\n• 샐러드 + 닭가슴살",
        timestamp: new Date(),
        suggestions: [
          "이번 주 평균 칼로리는?",
          "챌린지 진행 상황 알려줘"
        ]
      };
    }

    if (input.includes("이번 주") || input.includes("주간")) {
      return {
        id: Date.now().toString(),
        role: "bot",
        content: "이번 주 식습관 요약이에요! 📊\n\n• 평균 칼로리: 2,050kcal\n• 평균 나트륨: 2,400mg\n• 빨간 날: 2일 (목, 토)\n• 녹색 날: 4일\n\n지난주보다 평균 칼로리가 150kcal 낮아졌어요! 잘하고 계세요 💪\n\n다만 목요일과 토요일에 고칼로리 음식을 드셨네요. 다음 주에는 이 날들에 조금 더 가볍게 먹어보는 건 어떨까요?",
        timestamp: new Date(),
        suggestions: [
          "많이 먹은 메뉴 TOP3 알려줘",
          "나트륨 줄이는 팁 알려줘"
        ]
      };
    }

    if (input.includes("챌린지")) {
      return {
        id: Date.now().toString(),
        role: "bot",
        content: "현재 진행 중인 챌린지 현황이에요! 🎯\n\n1️⃣ 이번 주 빨간 날 3일 이하\n   → 현재 2일 (목표 달성 가능!)\n\n2️⃣ 주간 평균 칼로리 10% 낮추기\n   → 65% 달성 (거의 다 왔어요!)\n\n이대로만 하면 이번 주 2개 챌린지를 모두 클리어할 수 있어요! 화이팅! 🎉",
        timestamp: new Date(),
        suggestions: [
          "남은 주에 뭘 먹으면 좋을까?",
          "나트륨 낮은 메뉴 추천해줘"
        ]
      };
    }

    if (input.includes("추천") || input.includes("뭐 먹")) {
      return {
        id: Date.now().toString(),
        role: "bot",
        content: "지금 여러분의 상황을 고려한 추천이에요! 🍽️\n\n오늘은 가벼운 메뉴가 좋을 것 같아요:\n\n1. 비빔밥 (채소 드문뿍) - 650kcal, 적정 나트륨\n2. 연어 샐러드 - 420kcal, 저나트륨\n3. 토마토 파스타 - 520kcal, 적정 나트륨\n\n이 중에서 골라보세요! 어떤 게 끌리시나요? 😊",
        timestamp: new Date(),
        suggestions: [
          "토마토 파스타 영양소 자세히 알려줘",
          "오늘 야식은?"
        ]
      };
    }

    if (input.includes("나트륨") || input.includes("짜게")) {
      return {
        id: Date.now().toString(),
        role: "bot",
        content: "나트륨을 줄이는 간단한 팁이에요! 💧\n\n1. 국물 요리는 국물을 반만 먹기\n2. 소스는 '별도 제공' 옵션 선택하기\n3. 김치찌개보다 순두부찌개 선택하기\n4. 튀김보다는 구이 메뉴로\n5. 물을 충분히 마시기 (하루 2L)\n\n작은 습관부터 바꿔보세요. 몸이 달라지는 걸 느낄 수 있을 거예요! 😊",
        timestamp: new Date(),
        suggestions: [
          "이번 주 나 어떻게 먹었어?",
          "저나트륨 메뉴 추천해줘"
        ]
      };
    }

    // 기본 응답
    return {
      id: Date.now().toString(),
      role: "bot",
      content: "음, 잘 이해하지 못했어요 😅\n\n이런 걸 물어보시면 더 정확하게 답변할 수 있어요:\n\n• \"어제 너무 짜게 먹었는데 오늘 저녁 뭐 먹을까?\"\n• \"이번 주 나 어떻게 먹었어?\"\n• \"현재 진행 중인 챌린지 알려줘\"\n• \"나트륨 줄이는 팁 알려줘\"\n\n편하게 물어보세요! 😊",
      timestamp: new Date(),
      suggestions: [
        "이번 주 나 어떻게 먹었어?",
        "챌린지 진행 상황 알려줘"
      ]
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-stone-50 to-lime-50/30">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-4xl mx-auto">
            {/* 헤더 */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-green-200 shadow-lg">
                  <ImageWithFallback
                    src={nutribotImage}
                    alt="NutriBot"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h1 className="text-4xl">NutriBot</h1>
              </div>
              <p className="text-lg text-muted-foreground">
                기록 기반 AI 코치와 대화해보세요 💬
              </p>
              <p className="text-muted-foreground mt-2">
                과한 코칭은 하지 않아요. 편하게 정보를 얻어가세요!
              </p>
            </div>

            {/* 채팅 카드 */}
            <Card className="mb-6">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  대화하기
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* 메시지 영역 */}
                <div className="h-[500px] overflow-y-auto p-6 space-y-4">
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                        {/* 아바타 */}
                        {message.role === "bot" ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-200 flex-shrink-0">
                            <ImageWithFallback
                              src={nutribotImage}
                              alt="NutriBot"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <Avatar className="bg-purple-500">
                            <AvatarFallback className="text-white">
                              👤
                            </AvatarFallback>
                          </Avatar>
                        )}

                        {/* 메시지 내용 */}
                        <div className="space-y-2">
                          <div
                            className={`p-4 rounded-lg ${
                              message.role === "user"
                                ? "bg-purple-500 text-white"
                                : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                          </div>

                          {/* 제안 버튼 */}
                          {message.role === "bot" && message.suggestions && (
                            <div className="space-y-2">
                              {message.suggestions.map((suggestion, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="block w-full text-left px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  💡 {suggestion}
                                </button>
                              ))}
                            </div>
                          )}

                          <p className="text-xs text-muted-foreground px-1">
                            {message.timestamp.toLocaleTimeString("ko-KR", {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* 입력 영역 */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="궁금한 걸 물어보세요..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!inputValue.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 안내 카드 */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Flame className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                    <p className="text-sm text-orange-900">
                      "이번 주 평균 칼로리는?"
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm text-blue-900">
                      "챌린지 진행 상황 알려줘"
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <p className="text-sm text-green-900">
                      "오늘 저녁 뭐 먹을까?"
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}