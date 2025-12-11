import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { AnalyzePage } from "./pages/AnalyzePage";
import { PreOrderAnalyzePage } from "./pages/PreOrderAnalyzePage";
import { AboutPage } from "./pages/AboutPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { MyPage } from "./pages/MyPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { NutriBotPage } from "./pages/NutriBotPage";
import { ChallengePage } from "./pages/ChallengePage";
import { InsightsPage } from "./pages/InsightsPage";
import { KakaoCallbackPage } from "./pages/KakaoCallbackPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

function AppContent() {
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/forgot-password';

  return (
    <div className="min-h-screen">
      {!isAuthPage && <Header />}
      <main>
        <Routes>
          <Route path="/" element={isLoggedIn ? <HomePage /> : <AboutPage />} />
          <Route path="/analyze" element={
            <ProtectedRoute>
              <AnalyzePage />
            </ProtectedRoute>
          } />
          <Route path="/pre-order" element={
            <ProtectedRoute>
              <PreOrderAnalyzePage />
            </ProtectedRoute>
          } />
          <Route path="/mypage" element={
            <ProtectedRoute>
              <MyPage />
            </ProtectedRoute>
          } />
          <Route path="/nutribot" element={
            <ProtectedRoute>
              <NutriBotPage />
            </ProtectedRoute>
          } />
          <Route path="/challenges" element={
            <ProtectedRoute>
              <ChallengePage />
            </ProtectedRoute>
          } />
          <Route path="/insights" element={
            <ProtectedRoute>
              <InsightsPage />
            </ProtectedRoute>
          } />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/kakao/callback" element={<KakaoCallbackPage />} />
          <Route path="/preview_page.html" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}