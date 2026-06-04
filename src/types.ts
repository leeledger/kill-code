export type OSProfile = 'WINDOWS_BSOD' | 'MAC_PANIC' | 'LINUX_TERMINAL' | 'CYBER_HAZARD';

export interface PrankConfig {
  profile: OSProfile;
  severity: 'mild' | 'moderate' | 'extreme' | 'apocalyptic';
  enableAudio: boolean;
  triggerDelay: number; // in seconds
  shakeIntensity: 'none' | 'low' | 'high' | 'shatter';
  popupCount: number;
}

export type SimulatorState = 'CONFIG' | 'COUNTDOWN' | 'ACTIVE_GLITCH' | 'SHUTDOWN' | 'BLACKOUT';

export interface GlitchPopup {
  id: string;
  x: number;
  y: number;
  title: string;
  message: string;
  type: 'error' | 'warning' | 'critical' | 'system';
  width: number;
}
