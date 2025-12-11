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
import { chatWithNutriBot } from "../api/nutribot";

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

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputValue;
    setInputValue("");

    try {
      // 실제 API 호출
      const response = await chatWithNutriBot(messageToSend);
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: response.reply,
        timestamp: new Date(),
        suggestions: response.recommendedActions && response.recommendedActions.length > 0 
          ? response.recommendedActions 
          : undefined
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error: any) {
      console.error("챗봇 응답 오류:", error);
      console.error("에러 상세:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        config: error?.config
      });
      
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          "죄송해요, 응답을 생성하는데 문제가 발생했어요. 잠시 후 다시 시도해주세요. 😅";
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: errorMessage,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    }
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