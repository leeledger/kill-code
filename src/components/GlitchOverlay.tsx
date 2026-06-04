import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { X, AlertOctagon, ShieldAlert, Cpu, HardDrive } from 'lucide-react';
import { PrankConfig, GlitchPopup } from '../types';
import { soundManager } from '../utils/sound';

interface GlitchOverlayProps {
  config: PrankConfig;
  onGlitchComplete: () => void;
}

const ERROR_TITLES = [
  'Fatal System Malfunction',
  'Kernel Panic: core_0_heat',
  'system32 integrity checking failed',
  'Severe Hardware Disconnection',
  'DRAM Voltage Overdrive 4.2V',
  'Warning: Extreme Silly State Detected',
  'Buffer Overflow: stack_smash',
  'Motherboard Fan Stopped Spinning',
  'Critical Overheating [135°C]',
  'Catastrophic Stack Trace Runaway',
  'Power Supply Overload Detected',
];

const ERROR_MESSAGES = [
  'Processor registers corrupted. Flushing cache unsuccessful. Emergency halt required.',
  'An unrecoverable exception occurred in ring0 driver index_cache.sys. System thread dead.',
  'Deleting critical boot sectors to cool down the processor core...',
  'RAM integrity compromised. Swapping pages into virtual black hole. Please stop clicking!',
  'High gravity fields detected around the motherboard cooling unit.',
  'The processor thermal sensor has melted. Transitioning motherboard state to charcoal.',
  'Your local cookies are emitting minor amounts of background radiation. Cleaning...',
  'Semiautomatic hardware self-destruct countdown initiated due to extreme user speed.',
  'Error 0x000F43: CPU is crying. Please provide ice water immediately.',
  'Security sandbox breached by file "homework_final_final_v2_really_final.pdf".'
];

export default function GlitchOverlay({ config, onGlitchComplete }: GlitchOverlayProps) {
  const [popups, setPopups] = useState<GlitchPopup[]>([]);
  const [screenRattle, setScreenRattle] = useState({ x: 0, y: 0, rotate: 0 });
  const [flashColor, setFlashColor] = useState<string | null>(null);
  const [invertActive, setInvertActive] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const termEndRef = useRef<HTMLDivElement>(null);
  
  const originalPopupsGenerated = useRef(false);

  // Sound and global Timer
  useEffect(() => {
    if (config.enableAudio) {
      soundManager.startGlitchFitter();
    }

    // After 6.5 seconds of absolute chaos, shut down!
    const delayTime = config.severity === 'mild' ? 4500 : config.severity === 'moderate' ? 6000 : 7500;
    const shutdownTimer = setTimeout(() => {
      soundManager.stopGlitchAudio();
      onGlitchComplete();
    }, delayTime);

    return () => {
      clearTimeout(shutdownTimer);
      soundManager.stopGlitchAudio();
    };
  }, [config.enableAudio, config.severity, onGlitchComplete]);

  // Handle continuous viewport rattle and visual glitches
  useEffect(() => {
    const intensityModifier = 
      config.shakeIntensity === 'none' ? 0 : 
      config.shakeIntensity === 'low' ? 3 : 
      config.shakeIntensity === 'high' ? 12 : 30;

    const rattleInterval = setInterval(() => {
      if (intensityModifier > 0) {
        setScreenRattle({
          x: (Math.random() - 0.5) * intensityModifier,
          y: (Math.random() - 0.5) * intensityModifier,
          rotate: (Math.random() - 0.5) * (intensityModifier * 0.25),
        });
      }

      // Occasional extreme visual glitches
      const randVal = Math.random();
      if (randVal < 0.15 && config.severity !== 'mild') {
        const colors = ['rgba(255, 0, 0, 0.4)', 'rgba(0, 0, 255, 0.3)', 'rgba(0, 255, 0, 0.35)', 'rgba(255, 255, 255, 0.5)'];
        setFlashColor(colors[Math.floor(Math.random() * colors.length)]);
        if (randVal < 0.08) {
          setInvertActive(true);
        }
      } else {
        setFlashColor(null);
        setInvertActive(false);
      }
    }, 45);

    return () => clearInterval(rattleInterval);
  }, [config.shakeIntensity, config.severity]);

  // Generate initial popups
  useEffect(() => {
    if (originalPopupsGenerated.current) return;
    originalPopupsGenerated.current = true;

    const count = config.popupCount;
    const initialPopups: GlitchPopup[] = [];
    
    for (let i = 0; i < count; i++) {
      initialPopups.push(generateRandomPopup(`init_${i}`));
    }
    setPopups(initialPopups);
  }, [config.popupCount]);

  // Drag popups or spawn 2 more when clicking close
  const generateRandomPopup = (idPrefix: string): GlitchPopup => {
    const width = Math.min(window.innerWidth - 40, 360 + Math.random() * 120);
    const height = 180;
    
    // Position randomly on stage
    const maxX = Math.max(20, window.innerWidth - width - 20);
    const maxY = Math.max(20, window.innerHeight - height - 40);

    return {
      id: `${idPrefix}_${Date.now()}_${Math.floor(Math.random()*1000)}`,
      x: Math.random() * maxX,
      y: Math.random() * maxY,
      title: ERROR_TITLES[Math.floor(Math.random() * ERROR_TITLES.length)],
      message: ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)],
      type: Math.random() > 0.45 ? 'critical' : 'warning',
      width
    };
  };

  const handleClosePopup = (id: string) => {
    // A classic prank behaviour: clicking Close spawns more!
    soundManager.playBiosBeep(1200, 0.06);
    soundManager.playBiosBeep(650, 0.08);

    setPopups(prev => {
      const filtered = prev.filter(p => p.id !== id);
      if (config.severity === 'mild') return filtered;

      // Spawn extra popups nearby
      const spawnCount = config.severity === 'moderate' ? 1 : config.severity === 'extreme' ? 2 : 3;
      const extras: GlitchPopup[] = [];
      for (let i = 0; i < spawnCount; i++) {
        extras.push(generateRandomPopup(`spawn_${id}_${i}`));
      }
      return [...filtered, ...extras];
    });
  };

  // Generate Linux kernel logs continuously
  useEffect(() => {
    if (config.profile !== 'LINUX_TERMINAL' && config.profile !== 'CYBER_HAZARD') return;

    const codeTerms = [
      'syslogd: starting CPU thermal sweep...',
      'WARNING: CPU0 temp is 142.5C (Threshold exceeded)',
      'ACPI: BIOS throttling disabled by security lock',
      'BUG: unable to handle kernel paging request at 000f07fa14',
      'IP: [<c01012f4>] crash_burn_dump+0x42/0x90',
      'kernel panic - not syncing: Fatal exception in interrupt',
      'PANIC: mother_board_melt_safety_fuse: tri-state disconnect!',
      'Upping hardware voltages to force cooling fan...',
      'FAIL: FAN_REVOLUTION_0_RPM: physical block detected',
      'systemd[1]: Freezing remaining execution filesystems.',
      'systemd[1]: Shuting down motherboard cache... [FAIL]',
      'Dumping memory registers to core 0-7:',
      '  EAX: 7ff001c4 EBX: a0fbde81 ECX: 00001004 EDX: ffffffff',
      '  ESI: 00b01c42 EDI: edf0124a EBP: ccf1024b ESP: e0f214ac',
      '  CR0: 8005003b CR2: b01c4021 CR3: 00101000 CR4: 000006d0',
      'FATAL: Deleting system directory blocks to satisfy thermals...',
      '!!! SYSTEM DESTRUCTION INITIATED BY USER INJECTED PROTOCOL !!!'
    ];

    const interval = setInterval(() => {
      setTerminalLines(prev => {
        const nextLines = [...prev];
        const lineCount = 3 + Math.floor(Math.random() * 5);
        for (let i = 0; i < lineCount; i++) {
          nextLines.push(codeTerms[Math.floor(Math.random() * codeTerms.length)]);
        }
        if (nextLines.length > 200) {
          nextLines.splice(0, nextLines.length - 200);
        }
        return nextLines;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [config.profile]);

  useEffect(() => {
    termEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLines]);

  return (
    <div 
      className={`fixed inset-0 overflow-hidden select-none z-50 flex items-center justify-center transition-all bg-black`}
      style={{
        transform: `translate(${screenRattle.x}px, ${screenRattle.y}px) rotate(${screenRattle.rotate}deg)`,
        filter: invertActive ? 'invert(100%)' : 'none',
      }}
      id="glitch_stage"
    >
      {/* Glitch Overlay Flares */}
      {flashColor && (
        <div 
          className="absolute inset-0 z-[60] pointer-events-none mix-blend-color-burn" 
          style={{ backgroundColor: flashColor }}
        />
      )}

      {/* Cyber/Matrix Digital Distortions */}
      <div className="absolute inset-0 opacity-[0.25] pointer-events-none bg-radial-gradient z-20">
        <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,6px_100%]"></div>
      </div>

      {/* Random Neon Color Glitch Bars */}
      {config.severity !== 'mild' && Array.from({ length: 4 }).map((_, index) => {
        const randomY = Math.random() * 100;
        const randomHeight = 5 + Math.random() * 70;
        const randomColor = ['bg-rose-600', 'bg-emerald-500', 'bg-cyan-500', 'bg-amber-500', 'bg-fuchsia-600'][index % 5];
        return (
          <div 
            key={`bar_${index}`}
            className={`absolute left-0 w-full z-10 opacity-30 ${randomColor} mix-blend-screen animate-[pulse_0.1s_infinite]`}
            style={{
              top: `${randomY}%`,
              height: `${randomHeight}px`,
              transform: `translateX(${(Math.random() - 0.5) * 8}%)`
            }}
          />
        );
      })}

      {/* Profile-specific Base Canvas */}
      {config.profile === 'LINUX_TERMINAL' && (
        <div className="absolute inset-0 bg-black/95 p-4 font-mono text-emerald-400 text-xs overflow-hidden leading-relaxed z-0" id="linux_term_dump">
          <div className="max-w-4xl mx-auto flex flex-col h-full justify-end">
            <div className="text-red-500 font-bold mb-4 flex items-center gap-2 border-b border-red-500/30 p-2 animate-pulse">
              <ShieldAlert className="w-6 h-6 animate-bounce" />
              <span>[CRITICAL SYS EM CONFLICT] REGESTRY MELTDOWN ACTIVE</span>
            </div>
            <div className="space-y-1 overflow-y-auto max-h-[80vh] font-mono whitespace-pre-wrap select-none opacity-80">
              {terminalLines.map((line, idx) => (
                <div key={idx} className={line.includes('PANIC') || line.includes('FAIL') || line.includes('FATAL') ? 'text-red-500 font-bold animate-pulse' : 'text-emerald-500'}>
                  {line}
                </div>
              ))}
              <div ref={termEndRef} />
            </div>
          </div>
        </div>
      )}

      {config.profile === 'CYBER_HAZARD' && (
        <div className="absolute inset-0 bg-red-950/20 backdrop-blur-subtle flex flex-col justify-center items-center z-0 p-6" id="cyber_hazard_screener">
          <div className="max-w-2xl text-center space-y-6">
            <AlertOctagon className="w-24 h-24 text-rose-500 mx-auto animate-ping" />
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold text-red-500 tracking-wider font-mono animate-pulse">
                ⚠️ HAZARD LEVEL 5 RECLAMATION ⚠️
              </h1>
              <p className="text-xs font-mono text-rose-400 tracking-widest uppercase">
                SYSTEM CORRUPTED - CORE FUSION COOLING OFFLINE
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 font-mono text-sm border border-red-500/20 bg-slate-950/80 p-4 rounded-xl text-left">
              <div>
                <span className="text-slate-500 block text-xs">COOLER VOLTAGE</span>
                <span className="text-red-500 font-bold">14.8V [OVERLIMIT]</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">PUMP RPM</span>
                <span className="text-red-500 font-bold">0 RPM [BLOCKED]</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">TEMP SENSOR 1</span>
                <span className="text-red-500 font-bold bg-red-500/20 animate-pulse px-1">154.2 °C [熔化]</span>
              </div>
            </div>

            <p className="text-xs text-rose-400 font-mono italic animate-pulse">
              Deleting hardware indices and initializing battery discharge safety purge...
            </p>
          </div>
        </div>
      )}

      {/* Spawns Multi-layered draggable popups on top */}
      <div className="absolute inset-0 pointer-events-auto z-30" id="glitch_popups_grid">
        {popups.map((popup) => (
          <motion.div
            key={popup.id}
            id={`popup_${popup.id}`}
            drag
            dragMomentum={false}
            initial={{ scale: 0.9, opacity: 0, x: popup.x, y: popup.y }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute rounded-lg border shadow-2xl bg-slate-900 border-red-500/60 overflow-hidden flex flex-col"
            style={{ width: `${popup.width}px` }}
          >
            {/* Retro title bar */}
            <div className="bg-gradient-to-r from-red-800 to-rose-700 text-white select-none py-1.5 px-3 flex justify-between items-center cursor-grab active:cursor-grabbing border-b border-red-900">
              <span className="text-xs font-mono font-bold tracking-tight uppercase flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5" />
                {popup.title}
              </span>
              <button 
                id={`close_${popup.id}`}
                onClick={() => handleClosePopup(popup.id)} 
                className="hover:bg-red-600 p-0.5 rounded transition-colors text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Error Content */}
            <div className="p-4 bg-slate-950 flex gap-3 text-slate-100 min-h-[90px]">
              <div className="p-2 h-fit bg-red-500/10 rounded-lg border border-red-500/30 text-rose-400 shrink-0">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium font-sans leading-relaxed text-slate-300">
                  {popup.message}
                </p>
                <code className="text-[10px] font-mono text-rose-400/80 block select-none">
                  At module_ring3::seg_fault(0x{Math.floor(Math.random()*1000000).toString(16)})
                </code>
              </div>
            </div>

            {/* Button controls inside error card */}
            <div className="bg-slate-900 px-3 py-2 border-t border-slate-800 flex justify-end gap-2">
              <button
                id={`btn_p_ok_${popup.id}`}
                onClick={() => handleClosePopup(popup.id)}
                className="px-3 py-1 bg-red-600/25 border border-red-500 hover:bg-red-600 hover:border-red-400 text-white rounded text-[11px] font-bold font-mono transition-all active:scale-95 cursor-pointer"
              >
                IGNORE ERROR
              </button>
              <button
                id={`btn_p_abort_${popup.id}`}
                onClick={() => handleClosePopup(popup.id)}
                className="px-3 py-1 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded text-[11px] font-mono transition-all active:scale-95 cursor-pointer"
              >
                ABORT
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chaos status panel */}
      <div className="absolute bottom-6 left-6 z-40 bg-slate-950/95 border border-emerald-500/30 p-4 rounded-xl shadow-xl max-w-sm pointer-events-none select-none font-mono text-emerald-400 text-xs space-y-1 animate-[pulse_1s_infinite]">
        <div className="flex justify-between font-bold border-b border-emerald-500/20 pb-1 mb-1.5 uppercase tracking-wider text-rose-500">
          <span>⚙️ HEAVY INSTABILITY CORE</span>
          <span>SPASMING</span>
        </div>
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 shrink-0 text-rose-500 animate-spin" />
          <span>CPU USAGE: <strong className="text-red-500">998.4%</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <HardDrive className="w-3.5 h-3.5 shrink-0 text-yellow-500" />
          <span>SECTOR INTEGRITY: <strong className="text-red-500">DECOMPOSING</strong></span>
        </div>
        <p className="text-[10px] text-emerald-600 mt-2">
          Critical thermal failover scheduled. Power bypass isolation initiated...
        </p>
      </div>
    </div>
  );
}
