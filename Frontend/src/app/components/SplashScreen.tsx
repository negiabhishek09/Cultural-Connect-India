import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Flag, Heart, Star } from 'lucide-react';
import logoImg from '../../imports/AZ1HylrRIHU2bgVKHbaC2A-AZ1HylrSZmM6JSLqFu-l_w.jpg';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [showLogo, setShowLogo] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [showIcons, setShowIcons] = useState(false);

  useEffect(() => {
    const logoTimer = setTimeout(() => setShowLogo(true), 300);
    const taglineTimer = setTimeout(() => setShowTagline(true), 1200);
    const iconsTimer = setTimeout(() => setShowIcons(true), 1800);
    const completeTimer = setTimeout(() => onComplete(), 3800);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(taglineTimer);
      clearTimeout(iconsTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const icons = [
    { Icon: Sparkles, delay: 0, position: 'top-1/4 left-1/4' },
    { Icon: Flag, delay: 0.2, position: 'top-1/3 right-1/4' },
    { Icon: Heart, delay: 0.4, position: 'bottom-1/3 left-1/3' },
    { Icon: Star, delay: 0.6, position: 'bottom-1/4 right-1/3' },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900 via-orange-900 to-indigo-900"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Animated Background Circles */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative text-center">
        {/* Logo */}
        <AnimatePresence>
          {showLogo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex justify-center mb-8"
            >
              <motion.img
                src={logoImg}
                alt="Cultural Connect India"
                className="h-32 w-32 rounded-2xl shadow-2xl"
                animate={{ 
                  rotateY: [0, 360],
                }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tagline */}
        <AnimatePresence>
          {showTagline && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1 
                className="text-4xl md:text-5xl font-bold text-white mb-3"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                style={{
                  backgroundImage: 'linear-gradient(90deg, #fff, #fbbf24, #fff)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Cultural Connect India
              </motion.h1>
              <motion.p 
                className="text-xl text-orange-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Connecting India's Culture & Heritage
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Icons */}
        <AnimatePresence>
          {showIcons && icons.map(({ Icon, delay, position }, index) => (
            <motion.div
              key={index}
              className={`absolute ${position}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0.3, 0.7, 0.3],
                scale: [0, 1.2, 1],
                y: [0, -10, 0],
              }}
              transition={{ 
                delay,
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            >
              <Icon className="w-8 h-8 text-orange-300" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Loading Progress */}
      <motion.div 
        className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-64 h-1 bg-white/20 rounded-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-orange-400 to-yellow-400"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 3, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  );
}
