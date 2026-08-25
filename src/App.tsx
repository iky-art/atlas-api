import { useEffect, useState } from "react";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import Providers from "./components/Providers";
import Pricing from "./components/Pricing";
import ApiKeyGenerator from "./components/ApiKeyGenerator";
import Footer from "./components/Footer";
import SplashScreen from "./components/SplashScreen";
import AuthModal from "./components/AuthModal";
import { fetchCurrentUser, logout, type AuthUser } from "./lib/auth";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    fetchCurrentUser().then(setUser);
  }, []);

  function handleAuthSuccess(nextUser: AuthUser) {
    setUser(nextUser);
    setAuthOpen(false);
  }

  function handleLogout() {
    logout();
    setUser(null);
  }

  return (
    <>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}

      <Nav user={user} onOpenAuth={() => setAuthOpen(true)} onLogout={handleLogout} />
      <main>
        <Hero />
        <HowItWorks />
        <Providers />
        <Pricing />
        <ApiKeyGenerator user={user} onRequireAuth={() => setAuthOpen(true)} />
      </main>
      <Footer />

      {authOpen && (
        <AuthModal onClose={() => setAuthOpen(false)} onSuccess={handleAuthSuccess} />
      )}
    </>
  );
}
