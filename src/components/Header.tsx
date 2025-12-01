import { useState } from "react";
import { Button } from "./ui/button";
import { Menu, User, LogOut, Bot, Trophy, BarChart3, Camera, Search } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Logo } from "./Logo";
import { AuthDialog } from "./AuthDialog";
import { useAuth } from "../contexts/AuthContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "./ui/sheet";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, logout } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const mbtiType = localStorage.getItem("nutrigo_mbti");

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowMobileMenu(false);
  };

  const handleStartClick = () => {
    if (isLoggedIn) {
      navigate('/analyze');
    } else {
      setShowAuthDialog(true);
    }
    setShowMobileMenu(false);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setShowMobileMenu(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <Logo size="md" showText={true} />
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => handleNavigate('/analyze')} 
              className={`hover:text-primary transition-colors ${location.pathname === '/analyze' ? 'text-primary' : ''}`}
            >
              사진 기록
            </button>
            <button 
              onClick={() => handleNavigate('/pre-order')} 
              className={`hover:text-primary transition-colors ${location.pathname === '/pre-order' ? 'text-primary' : ''}`}
            >
              주문 전 분석
            </button>
            <button 
              onClick={() => handleNavigate('/insights')} 
              className={`hover:text-primary transition-colors ${location.pathname === '/insights' ? 'text-primary' : ''}`}
            >
              나의 캘린더
            </button>
            <button 
              onClick={() => handleNavigate('/challenges')} 
              className={`hover:text-primary transition-colors ${location.pathname === '/challenges' ? 'text-primary' : ''}`}
            >
              챌린지
            </button>
            <button 
              onClick={() => handleNavigate('/nutribot')} 
              className={`hover:text-primary transition-colors ${location.pathname === '/nutribot' ? 'text-primary' : ''}`}
            >
              AI 코치
            </button>
            <button 
              onClick={() => handleNavigate('/about')} 
              className={`hover:text-primary transition-colors ${location.pathname === '/about' ? 'text-primary' : ''}`}
            >
              소개
            </button>
          </nav>
          
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hidden md:flex"
                  onClick={() => navigate('/mypage')}
                >
                  <User className="w-4 h-4 mr-2" />
                  마이페이지
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hidden md:flex"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  로그아웃
                </Button>
              </>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden md:flex"
                onClick={() => setShowAuthDialog(true)}
              >
                <User className="w-4 h-4 mr-2" />
                로그인
              </Button>
            )}
            <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader className="mb-6">
                  <SheetTitle>메뉴</SheetTitle>
                  <SheetDescription>
                    nutriGo 네비게이션 메뉴
                  </SheetDescription>
                </SheetHeader>
                
                <div className="flex flex-col gap-6">
                  <nav className="flex flex-col gap-4">
                    <button 
                      onClick={() => handleNavigate('/analyze')} 
                      className={`text-left p-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 ${location.pathname === '/analyze' ? 'bg-green-50 text-primary' : ''}`}
                    >
                      <Camera className="w-4 h-4" />
                      사진 기록
                    </button>
                    <button 
                      onClick={() => handleNavigate('/pre-order')} 
                      className={`text-left p-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 ${location.pathname === '/pre-order' ? 'bg-green-50 text-primary' : ''}`}
                    >
                      <Search className="w-4 h-4" />
                      주문 전 분석
                    </button>
                    <button 
                      onClick={() => handleNavigate('/insights')} 
                      className={`text-left p-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 ${location.pathname === '/insights' ? 'bg-green-50 text-primary' : ''}`}
                    >
                      <BarChart3 className="w-4 h-4" />
                      나의 캘린더
                    </button>
                    <button 
                      onClick={() => handleNavigate('/challenges')} 
                      className={`text-left p-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 ${location.pathname === '/challenges' ? 'bg-green-50 text-primary' : ''}`}
                    >
                      <Trophy className="w-4 h-4" />
                      챌린지
                    </button>
                    <button 
                      onClick={() => handleNavigate('/nutribot')} 
                      className={`text-left p-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 ${location.pathname === '/nutribot' ? 'bg-green-50 text-primary' : ''}`}
                    >
                      <Bot className="w-4 h-4" />
                      AI 코치
                    </button>
                    <button 
                      onClick={() => handleNavigate('/about')} 
                      className={`text-left p-3 rounded-lg hover:bg-gray-100 transition-colors ${location.pathname === '/about' ? 'bg-green-50 text-primary' : ''}`}
                    >
                      소개
                    </button>
                  </nav>
                  
                  <Separator />
                  
                  <div className="flex flex-col gap-3">
                    {isLoggedIn ? (
                      <>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => handleNavigate('/mypage')}
                        >
                          <User className="w-4 h-4 mr-2" />
                          마이페이지
                        </Button>
                        <Button 
                          variant="outline"
                          className="w-full justify-start"
                          onClick={handleLogout}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          로그아웃
                        </Button>
                      </>
                    ) : (
                      <Button 
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          setShowMobileMenu(false);
                          setShowAuthDialog(true);
                        }}
                      >
                        <User className="w-4 h-4 mr-2" />
                        로그인
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <AuthDialog 
        isOpen={showAuthDialog} 
        onClose={() => setShowAuthDialog(false)} 
      />
    </>
  );
}