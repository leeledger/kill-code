import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Power, Terminal } from 'lucide-react';
import { OSProfile, PrankConfig } from '../types';
import { soundManager } from '../utils/sound';

interface FakeShutdownProps {
  config: PrankConfig;
  onReset: () => void;
}

export default function FakeShutdown({ config, onReset }: FakeShutdownProps) {
  const [percent, setPercent] = useState(0);
  const [phase, setPhase] = useState<'CRASH_SCREEN' | 'OS_SHUTDOWN' | 'PITCH_BLACK'>('CRASH_SCREEN');
  const [isCrtShrinking, setIsCrtShrinking] = useState(false);

  // Sound play on shutdown
  useEffect(() => {
    // Stage 1: Crash screens
    if (config.profile === 'WINDOWS_BSOD') {
      // Windows BSOD ticks up percentage, then shuts down
      const interval = setInterval(() => {
        setPercent(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setPhase('OS_SHUTDOWN');
            }, 600);
            return 100;
          }
          return prev + Math.floor(Math.random() * 20) + 5;
        });
      }, 500);

      return () => clearInterval(interval);
    } else if (config.profile === 'MAC_PANIC') {
      // Mac panic hangs for 4 seconds, then shuts down
      const timer = setTimeout(() => {
        setPhase('OS_SHUTDOWN');
      }, 4200);
      return () => clearTimeout(timer);
    } else if (config.profile === 'LINUX_TERMINAL') {
      // Linux hangs on core dump dump then reboots
      const timer = setTimeout(() => {
        setPhase('OS_SHUTDOWN');
      }, 3500);
      return () => clearTimeout(timer);
    } else {
      // Cyber hazard dramatic self destruct
      const timer = setTimeout(() => {
        setPhase('OS_SHUTDOWN');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [config.profile]);

  // Stage 2: OS Shutting Down loader screen
  useEffect(() => {
    if (phase === 'OS_SHUTDOWN') {
      const shutdownTimer = setTimeout(() => {
        if (config.profile === 'CYBER_HAZARD') {
          // Play specialized CRT turnoff
          setIsCrtShrinking(true);
          setTimeout(() => {
            soundManager.playPowerShutdownClick();
            setPhase('PITCH_BLACK');
          }, 600);
        } else {
          soundManager.playPowerShutdownClick();
          setPhase('PITCH_BLACK');
        }
      }, 3000);

      return () => clearTimeout(shutdownTimer);
    }
  }, [phase, config.profile]);

  const handlePowerRepower = () => {
    soundManager.playBiosBeep(440, 0.1);
    setTimeout(() => {
      soundManager.playBiosBeep(880, 0.15);
      onReset();
    }, 150);
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] overflow-hidden select-none" id="shutdown_overlay_stage">
      
      {/* 1. CRASH SCREEN PHASE */}
      {phase === 'CRASH_SCREEN' && (
        <div className="w-full h-full flex items-center justify-center">
          
          {/* Windows 11 Blue Screen */}
          {config.profile === 'WINDOWS_BSOD' && (
            <div className="w-full h-full bg-[#0078d7] text-white p-8 md:p-24 flex flex-col justify-between font-sans selection:bg-transparent" id="windows_bsod_screen">
              <div className="max-w-4xl space-y-8 mt-12">
                <div className="text-8xl md:text-9xl font-light select-none">:(</div>
                <h1 className="text-xl md:text-3xl leading-relaxed font-light">
                  Your PC ran into a problem and needs to restart. We're just collecting some error info, and then we'll restart for you.
                </h1>
                
                <div className="text-lg md:text-2xl font-light">
                  {Math.min(100, percent)}% complete
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-start pt-6">
                  {/* Fake Custom QR Code via CSS squares */}
                  <div className="w-32 h-32 bg-white p-2.5 rounded shrink-0 flex flex-wrap gap-1 relative">
                    <div className="absolute inset-2 border-4 border-black bg-white flex flex-wrap gap-[3px] select-none">
                      <div className="w-6 h-6 border-4 border-black bg-white"></div>
                      <div className="w-2 h-2 bg-black"></div>
                      <div className="w-4 h-4 bg-black"></div>
                      <div className="w-6 h-6 border-4 border-black bg-white absolute right-0 top-0"></div>
                      <div className="w-6 h-6 border-4 border-black bg-white absolute left-0 bottom-0"></div>
                      <div className="w-3 h-3 bg-black absolute right-1.5 bottom-1.5"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 font-mono text-xs md:text-sm text-slate-100">
                    <p>For more information about this issue and possible fixes, visit:</p>
                    <p className="underline font-bold">https://windows.com/stopcode</p>
                    <div className="pt-3 space-y-0.5 text-slate-200">
                      <p>If you call a support person, give them this info:</p>
                      <p>Stop code: <strong className="text-white">COSMIC_MOTHERBOARD_MELTDOWN</strong></p>
                      <p>What failed: <strong className="text-white">ring0_silly_core.sys</strong></p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-xs md:text-sm text-[#005a9e] font-mono">
                Windows Crash Alert Protocol // AI Studio sandboxed simulator
              </div>
            </div>
          )}

          {/* Mac Kernel Panic Box */}
          {config.profile === 'MAC_PANIC' && (
            <div className="w-full h-full bg-[#2c2c2c] text-neutral-300 flex items-center justify-center p-6 selection:bg-transparent" id="mac_panic_screen">
              <div className="max-w-xl bg-neutral-900 border border-neutral-700/60 shadow-2xl rounded-2xl p-8 space-y-6 relative overflow-hidden text-center md:text-left">
                {/* Embedded transparent Apple logo */}
                <div className="absolute -top-10 -right-10 text-neutral-800 pointer-events-none select-none opacity-20">
                  <svg className="w-48 h-48 fill-current" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.13-1.85-14.36-5.96-3.41-2.69-7.38-7.38-11.91-14.07-6.22-9.11-11.12-19.11-14.7-30s-5.37-21.2-5.37-30.82c0-12.51 2.94-22.95 8.79-31.33 5.86-8.38 13.6-12.68 23.23-12.92 5.18.11 10.4 1.7 15.66 4.77 5.25 3.07 9.17 4.1 11.75 4.1 2.12 0 5.69-1.01 10.7-3.03 5.02-2.02 9.84-3.03 14.47-3.03 9.4 0 17.15 3.63 23.23 10.89 4.88 5.85 7.9 12.63 9.07 20.33-11.21 5.39-16.71 13.3-16.5 23.71.21 8.24 3.29 15.11 9.24 20.61 5.95 5.5 13.1 8.52 21.46 9.07-.63 2.12-1.38 4.34-2.22 6.66zM119.22 28.16c0-7.85 2.76-14.88 8.27-21.09 6.13-6.9 13.56-10.45 22.3-10.65.11.95.16 2.01.16 3.19 0 7.64-2.81 14.63-8.43 20.97-5.62 6.33-12.89 9.68-21.8 10.05-.32-.85-.5-1.64-.5-2.47z"/>
                  </svg>
                </div>

                <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center mx-auto md:mx-0 text-white border border-neutral-700">
                  <Power className="w-6 h-6 text-red-500 animate-pulse" />
                </div>

                <div className="space-y-4 font-sans text-xs md:text-sm text-neutral-300 leading-relaxed">
                  <p className="font-bold text-white text-sm md:text-base">
                    You need to restart your computer. Hold down the Power button for several seconds or press the Restart button.
                  </p>
                  <p className="text-neutral-400">
                    Vous devez redémarrer votre ordinateur. Éteignez l'ordinateur en maintenant le bouton de démarrage enfoncé pendant quelques secondes, puis rallumez-le.
                  </p>
                  <p className="text-neutral-400">
                    Sie müssen Ihren Computer neu starten. Halten Sie den Ein-/Ausschalter gedrückt, bis der Computer ausgeschaltet ist, und schalten Sie ihn dann wieder ein.
                  </p>
                  <p className="text-neutral-400">
                    컴퓨터를 재시동해야 합니다. 컴퓨터가 꺼질 때까지 전원 버튼을 몇 초 동안 누르고 있거나 재시동 버튼을 누르십시오.
                  </p>
                </div>

                <div className="pt-2 font-mono text-[9px] text-neutral-600 border-t border-neutral-800 flex justify-between">
                  <span>panic(cpu 0 caller 0xffffff8013f9): "Silly Core overflow"</span>
                  <span>Darwin Kernel v21.4.0</span>
                </div>
              </div>
            </div>
          )}

          {/* Linux Dump Halt */}
          {config.profile === 'LINUX_TERMINAL' && (
            <div className="w-full h-full bg-black text-slate-300 p-6 md:p-12 font-mono text-xs md:text-sm flex flex-col justify-between selection:bg-transparent" id="linux_halt_screen">
              <div className="space-y-1.5 leading-relaxed max-w-4xl mt-6">
                <p className="text-red-500">[  245.210452] kernel_shutdown: powering down dynamic registers...</p>
                <p className="text-slate-500">[  245.212001] ACPI: Preparing to enter system sleep state S5</p>
                <p className="text-slate-500">[  245.420109] sd 0:0:0:0: [sda] Synchronizing SCSI cache</p>
                <p className="text-slate-500">[  245.420872] sd 0:0:0:0: [sda] Stopping disk spin-down</p>
                <p className="text-amber-500">[  246.104291] pci 0000:00:1f.2: AMD-SB950 poweroff gate triggered</p>
                <p className="text-slate-500">[  246.502120] usb 1-1: power gate isolated</p>
                <p className="text-slate-300 font-bold mt-4">[  247.100524] reboot: Powering down CPU motherboard complex...</p>
                <div className="pt-4 flex items-center gap-2 text-rose-500 font-bold animate-pulse">
                  <Terminal className="w-4 h-4 shrink-0" />
                  <span>--- LOGICAL SYSTEM HALTED ---</span>
                </div>
              </div>
              <div className="text-slate-700">
                Linux kernel panic simulation sandbox. Free of actual state storage.
              </div>
            </div>
          )}

          {/* Cyber Hazard Discharge Screen */}
          {config.profile === 'CYBER_HAZARD' && (
            <div className="w-full h-full bg-slate-950 text-red-500 flex flex-col items-center justify-center p-6 text-center font-mono selection:bg-transparent" id="cyber_discharge_screen">
              <div className="space-y-4 max-w-lg border border-red-500 p-8 rounded-xl bg-black shadow-2xl relative shadow-red-500/10">
                <div className="absolute top-2 left-6 bg-red-600 text-black px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase">
                  HAZARD STAGE 3
                </div>
                
                <h2 className="text-2xl font-black tracking-widest animate-pulse pt-2">
                  DISCHARGING CORE FUSION
                </h2>
                
                <div className="space-y-1 text-xs text-rose-400 text-left bg-slate-900/60 p-3 rounded border border-red-500/20">
                  <p>&gt; sys_purge_voltage: 100% SUCCESS</p>
                  <p>&gt; flash_bootloader_zero: OK</p>
                  <p>&gt; isolation_coils: STABILIZED</p>
                  <p className="text-red-500 font-bold">&gt; PHYSICAL INTERFACING DISCONNECTED // POWER CLOSURE</p>
                </div>
                
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest">
                  Motherboard power relay cut trigger in 3, 2, 1...
                </p>
              </div>
            </div>
          )}
          
        </div>
      )}


      {/* 2. OS SHUTDOWN SCREEN PHASE (Spinning wheel / shutting down fade) */}
      {phase === 'OS_SHUTDOWN' && (
        <div 
          className="w-full h-full bg-black flex flex-col items-center justify-center text-white"
          id="os_shutdown_screen"
        >
          {config.profile === 'WINDOWS_BSOD' ? (
            <div className="flex flex-col items-center space-y-6">
              {/* Windows 11 Fluent Spinning Loader (custom SVG with keyframe spin) */}
              <div className="relative w-16 h-16">
                <svg className="animate-spin w-full h-full text-sky-500" viewBox="0 0 50 50">
                  <circle className="opacity-25" cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="3" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a1 1 0 011-1 25.07 25.07 0 0115.5 5.51 1 1 0 01.12 1.41l-1.42 1.42a1 1 0 01-1.41-.12A21.07 21.07 0 008 16.5a1 1 0 01-1-1v-3.5zm34 0a1 1 0 00-1-1 25.07 25.07 0 00-15.5 5.51 1 1 0 00-.12 1.41l1.42 1.42a1 1 0 001.41-.12A21.07 21.07 0 0134 16.5a1 1 0 001-1v-3.5z" />
                </svg>
              </div>
              <p className="text-xl font-light font-sans tracking-wide">
                Restarting
              </p>
            </div>
          ) : config.profile === 'MAC_PANIC' ? (
            <div className="flex flex-col items-center space-y-6 opacity-40 transition-opacity duration-1000">
              <svg className="w-16 h-16 fill-neutral-600" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.13-1.85-14.36-5.96-3.41-2.69-7.38-7.38-11.91-14.07-6.22-9.11-11.12-19.11-14.7-30s-5.37-21.2-5.37-30.82c0-12.51 2.94-22.95 8.79-31.33 5.86-8.38 13.6-12.68 23.23-12.92 5.18.11 10.4 1.7 15.66 4.77 5.25 3.07 9.17 4.1 11.75 4.1 2.12 0 5.69-1.01 10.7-3.03 5.02-2.02 9.84-3.03 14.47-3.03 9.4 0 17.15 3.63 23.23 10.89 4.88 5.85 7.9 12.63 9.07 20.33-11.21 5.39-16.71 13.3-16.5 23.71.21 8.24 3.29 15.11 9.24 20.61 5.95 5.5 13.1 8.52 21.46 9.07-.63 2.12-1.38 4.34-2.22 6.66zM119.22 28.16c0-7.85 2.76-14.88 8.27-21.09 6.13-6.9 13.56-10.45 22.3-10.65.11.95.16 2.01.16 3.19 0 7.64-2.81 14.63-8.43 20.97-5.62 6.33-12.89 9.68-21.8 10.05-.32-.85-.5-1.64-.5-2.47z"/>
              </svg>
              <div className="w-6 h-6 border-2 border-neutral-700 border-t-neutral-400 rounded-full animate-spin"></div>
            </div>
          ) : config.profile === 'LINUX_TERMINAL' ? (
            <div className="flex flex-col items-start p-8 font-mono text-xs text-neutral-500 w-full max-w-md space-y-1">
              <p>[  248.012541] Sending SIGTERM to remaining processes...</p>
              <p>[  248.250104] Sending SIGKILL to remaining processes...</p>
              <p>[  249.124501] Unmounting loop devices...</p>
              <p>[  249.301242] Disabling page cache...</p>
              <p className="text-white font-bold animate-pulse">[  250.000000] System halted. Power down control handed to physical logic.</p>
            </div>
          ) : (
            /* Cyber hazard specialized CRT collapse container */
            <div className={`w-full h-full flex items-center justify-center transition-all bg-red-950 duration-700 ${isCrtShrinking ? 'scale-x-[0.001] scale-y-[0.001] bg-white opacity-0' : 'bg-black'}`}>
              <div className="text-center font-mono text-red-500 space-y-1 px-4 animate-pulse">
                <p className="text-sm font-bold">⚠️ SYSTEM TERMINATED ⚠️</p>
                <p className="text-[10px]">BATTERY VOLTAGE DRAINING SAFETY INJECT</p>
              </div>
            </div>
          )}
        </div>
      )}


      {/* 3. PITCH BLACK FLAT BLACKOUT SCREEN */}
      {phase === 'PITCH_BLACK' && (
        <div className="w-full h-full bg-black flex flex-col items-center justify-center relative cursor-none" id="pitch_black_screener">
          {/* Subtle cursor prompt blinking on the left top */}
          <div className="absolute top-4 left-4 font-mono text-[10px] text-zinc-900 select-none animate-pulse">
            _
          </div>

          {/* Faint elegant visual indicator for user recovery */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0.2, 0.6, 0.1, 0.3] }}
            transition={{ delay: 2, duration: 8, repeat: Infinity, repeatType: 'reverse' }}
            className="flex flex-col items-center space-y-2 pointer-events-auto"
            id="recovery_prompt_panel"
          >
            <p className="text-zinc-800 font-mono text-[9px] tracking-widest text-center select-none uppercase pointer-events-none">
              Power State: Zero Volts. Click Power button to boot again.
            </p>
            <button
              id="btn_repower_motherboard"
              onClick={handlePowerRepower}
              className="mt-2 bg-zinc-900/60 hover:bg-zinc-800/80 hover:scale-105 active:scale-95 border border-zinc-800 hover:border-zinc-700/60 p-4 rounded-full text-zinc-600 hover:text-emerald-500 shadow-lg cursor-pointer transition-all duration-300"
              title="Return to Config Dashboard"
            >
              <Power className="w-6 h-6" />
            </button>
          </motion.div>
        </div>
      )}

    </div>
  );
}
