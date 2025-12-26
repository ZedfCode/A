
export enum DownloadStatus {
  IDLE = 'IDLE',
  QUEUED = 'QUEUED',
  CONNECTING = 'CONNECTING',
  ANALYZING = 'ANALYZING',
  DOWNLOADING = 'DOWNLOADING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
  RETRYING = 'RETRYING'
}

export enum FileType {
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  IMAGE = 'IMAGE',
  DOCUMENT = 'DOCUMENT',
  ARCHIVE = 'ARCHIVE',
  SOFTWARE = 'SOFTWARE',
  WEBSITE = 'WEBSITE',
  OTHER = 'OTHER'
}

export enum Priority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  URGENT = 3
}

export type Protocol = 'HTTP' | 'MAGNET' | 'TORRENT' | 'FTP' | 'THUNDER' | 'BT' | 'WEBRTC';

export type VisualEnvironment = 'amber_digital' | 'ethereal_vapor' | 'monolith_dark';

export interface PostProcessScript {
  id: string;
  name: string;
  code: string;
  isEnabled: boolean;
}

export interface SystemLog {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'success' | 'security';
  message: string;
  taskId?: string;
}

export interface DownloadTask {
  id: string;
  url: string;
  name: string;
  size: number;
  downloaded: number;
  status: DownloadStatus;
  type: FileType;
  protocol: Protocol;
  progress: number;
  speed: number;
  threads: number; 
  maxThreads: number; 
  priority: Priority;
  addedAt: number;
  isResumable: boolean;
  savePath?: string;
  eta: number;
  error?: string;
  speedHistory: number[];
  bitfield: number[]; 
  safetyScore: number;
  securityReport: string;
  retries: number;
  peerCount: number;
}

export interface AppSettings {
  language: Language;
  accentColor: AccentColor;
  visualEnvironment: VisualEnvironment;
  uiIntensity: 'calm' | 'normal' | 'juicy';
  aiEnabledByDefault: boolean;
  globalMaxThreads: number;
  concurrentTasks: number;
  globalSpeedLimit: number; 
  defaultSavePath: string;
  autoStart: boolean;
  theme: 'dark' | 'light';
  notifications: boolean;
  clipboardMonitoring: boolean;
  scripts: PostProcessScript[];
}

export type Language = 'zh' | 'en';
export type AccentColor = 'warm' | 'blue' | 'purple' | 'emerald' | 'crimson';
export type BackgroundPreset = 'mesh' | 'grid' | 'glass' | 'dark';

// Interface for AI link analysis results
export interface AIAnalysisResult {
  suggestedName: string;
  fileType: FileType;
  description: string;
  tags: string[];
  safetyScore: number;
  securityReport: string;
}
