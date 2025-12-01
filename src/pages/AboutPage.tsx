import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Camera, Search, Calendar, Trophy, Bot, Bell, CheckCircle, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "motion/react";

const features = [
  {
    icon: Camera,
    title: "사진 기반 자동 영양 기록",
    description: "배달앱 스크린샷만 찍으면 AI가 자동으로 칼로리, 나트륨, 단백질을 분석하고 캘린더에 기록해요",
    badge: "초간단",
    color: "from-orange-400 to-red-400"
  },
  {
    icon: Calendar,
    title: "식습관 캘린더 & 주간 인사이트",
    description: "매일의 식습관을 색상으로 표시하고, 주간 보고서로 패턴을 파악해요",
    badge: "한눈에",
    color: "from-blue-400 to-purple-400"
  },
  {
    icon: Search,
    title: "주문 전 메뉴 영양 분석",
    description: "주문하기 전에 메뉴를 분석하고, 더 가벼운 대안을 제안해드려요",
    badge: "똑똑한 선택",
    color: "from-green-400 to-teal-400"
  },
  {
    icon: Trophy,
    title: "가벼운 챌린지",
    description: "빨간 날 줄이기, 평균 칼로리 낮추기 등 작은 목표를 달성하며 습관을 만들어요",
    badge: "동기부여",
    color: "from-purple-400 to-pink-400"
  },
  {
    icon: Bot,
    title: "NutriBot - 기록 기반 챗봇",
    description: "내 기록을 바탕으로 대화하며 간단한 코칭과 정보를 받아요",
    badge: "대화형",
    color: "from-cyan-400 to-blue-400"
  },
  {
    icon: Bell,
    title: "다음 끼니 주의 알림",
    description: "어제 과식했다면 다음 날 점심 전에 가벼운 조언을 보내드려요",
    badge: "배려",
    color: "from-yellow-400 to-orange-400"
  }
];

const whyDifferent = [
  {
    icon: CheckCircle,
    title: "직접 입력 최소화",
    description: "사진만 찍으면 끝! 번거로운 수동 입력은 이제 그만"
  },
  {
    icon: CheckCircle,
    title: "강제력 없음",
    description: "억지로 하지 않아도 돼요. 한 번 생각하게 만드는 것만으로 충분해요"
  },
  {
    icon: CheckCircle,
    title: "죄책감 제로",
    description: "과한 코칭이나 경고 없이 편하게 정보를 얻어가세요"
  },
  {
    icon: CheckCircle,
    title: "자동 판정",
    description: "챌린지는 기록 기반으로 자동 판정되어 번거로움이 없어요"
  }
];

export function AboutPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const handleStartClick = () => {
    if (isLoggedIn) {
      navigate('/analyze');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-50/50 via-stone-50 to-lime-50/40 relative overflow-hidden">
        {/* 배경 애니메이션 */}
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-green-400/20 rounded-full blur-3xl"
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl"
          animate={{
            y: [0, 30, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-block mb-6"
            >
              <Badge className="px-6 py-2 text-lg bg-gradient-to-r from-green-500 to-blue-500 text-white">
                <Sparkles className="w-5 h-5 mr-2 inline" />
                사진 한 장으로 끝내는 영양 관리
              </Badge>
            </motion.div>

            <h1 className="text-5xl md:text-6xl mb-6">
              배달 음식, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                이제 건강하게 즐기세요
              </span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              스크린샷만 찍으면 AI가 자동으로 영양소를 분석하고 기록해요.<br />
              복잡한 입력 없이 편하게 식습관을 관리해보세요.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex gap-4 justify-center flex-wrap"
            >
              <Button 
                size="lg" 
                onClick={handleStartClick}
                className="text-lg px-8 py-6 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                무료로 시작하기
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-lg px-8 py-6"
              >
                기능 둘러보기
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl mb-4">주요 기능</h2>
            <p className="text-xl text-muted-foreground">
              nutriGo가 제공하는 6가지 핵심 기능이에요
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2">
                  <CardContent className="pt-8">
                    <div className={`w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <div className="mb-3 flex items-center gap-2">
                      <h3 className="text-xl">{feature.title}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {feature.badge}
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Different Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl mb-4">nutriGo는 달라요</h2>
            <p className="text-xl text-muted-foreground">
              억지로 하지 않아도 괜찮아요. 편하게 시작하세요 😊
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {whyDifferent.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="h-full text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-8">
                    <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="mb-2">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl mb-6">
              지금 바로 시작해보세요
            </h2>
            <p className="text-xl mb-8 opacity-90">
              스크린샷 한 장으로 시작하는 건강한 배달 음식 생활
            </p>
            <Button 
              size="lg" 
              onClick={handleStartClick}
              className="bg-white text-green-600 hover:bg-gray-100 text-lg px-10 py-6"
            >
              무료로 시작하기
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}