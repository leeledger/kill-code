import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert } from 'lucide-react';
import { PrankConfig, SimulatorState, OSProfile } from './types';
import GlitchOverlay from './components/GlitchOverlay';
import FakeShutdown from './components/FakeShutdown';
import { soundManager } from './utils/sound';

const OS_PROFILES: OSProfile[] = ['WINDOWS_BSOD', 'MAC_PANIC', 'LINUX_TERMINAL', 'CYBER_HAZARD'];

export default function App() {
  const [gameState, setGameState] = useState<SimulatorState>('ACTIVE_GLITCH');
  const [config, setConfig] = useState<PrankConfig>(() => {
    const randomOS = OS_PROFILES[Math.floor(Math.random() * OS_PROFILES.length)];
    return {
      profile: randomOS,
      severity: 'apocalyptic', // Maximum crash settings
      enableAudio: true,
      triggerDelay: 0,
      shakeIntensity: 'shatter',
      popupCount: 30,
    };
  });

  const handleGlitchComplete = () => {
    setGameState('SHUTDOWN');
  };

  const handleReset = () => {
    // Generate a new random crash profile and re-trigger instantly on reboot!
    const randomOS = OS_PROFILES[Math.floor(Math.random() * OS_PROFILES.length)];
    setConfig({
      profile: randomOS,
      severity: 'apocalyptic',
      enableAudio: true,
      triggerDelay: 0,
      shakeIntensity: 'shatter',
      popupCount: 30,
    });
    setGameState('ACTIVE_GLITCH');
  };

  return (
    <div className="relative min-h-screen bg-black text-slate-100 overflow-hidden" id="app_root">
      
      {/* 1. ACTIVE GLITCH ACTIVE SOUND SPASTIC STAGE */}
      {gameState === 'ACTIVE_GLITCH' && (
        <GlitchOverlay 
          config={config} 
          onGlitchComplete={handleGlitchComplete} 
        />
      )}

      {/* 2. CRASH SCREEN BSOD HALT BLACKOUT SYSTEM */}
      {gameState === 'SHUTDOWN' && (
        <FakeShutdown 
          config={config} 
          onReset={handleReset} 
        />
      )}

    </div>
  );
}
