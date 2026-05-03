import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { SplashScreen } from '../components/SplashScreen';
import { ModernNavbar } from '../components/ModernNavbar';
import { ModernHero } from '../components/ModernHero';
import { EnhancedCategories } from '../components/EnhancedCategories';
import { FeaturedStates } from '../components/FeaturedStates';
import { CulturalEvents } from '../components/CulturalEvents';
import { MarketplaceSection } from '../components/MarketplaceSection';
import { CommunitySection } from '../components/CommunitySection';
import { About } from '../components/About';
import { Footer } from '../components/Footer';

export function Home() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Check if splash screen has been shown in this session
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    if (hasSeenSplash) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem('hasSeenSplash', 'true');
    setShowSplash(false);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      </AnimatePresence>

      {!showSplash && (
        <div className="min-h-screen bg-white">
          <ModernNavbar />
          <ModernHero />
          <EnhancedCategories />
          <FeaturedStates />
          <CulturalEvents />
          <MarketplaceSection />
          <CommunitySection />
          <About />
          <Footer />
        </div>
      )}
    </>
  );
}
