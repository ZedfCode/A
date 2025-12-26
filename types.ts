
// Fix: Add missing type exports for application settings
export type Language = 'zh' | 'en';

export type AccentColor = 'blue' | 'amber' | 'emerald' | 'rose' | 'indigo';

export type VisualEnvironment = 'amber_digital' | 'ethereal_vapor' | 'monolith_dark';

export enum DownloadStatus {
  IDLE = 'IDLE',
  QUEUED = 'QUEUED',
  CONNECTING = 'CONNECTING',
  ALLOCATING = 'ALLOCATING', 
  ANALYZING = 'ANALYZING',
  DOWNLOADING = 'DOWNLOADING',
  PAUSED = 'PAUSED',
  VERIFYING = 'VERIFYING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export enum FileType {
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  IMAGE = 'IMAGE',
  DOCUMENT = 'DOCUMENT',
  ARCHIVE = 'ARCHIVE',
  SOFTWARE = 'SOFTWARE',
  OTHER = 'OTHER'
}

export type Protocol = 'HTTP' | 'MAGNET' | 'TORRENT' | 'FTP' | 'BT';

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
  addedAt: number;
  isResumable: boolean;
  fileHandle?: any; // FileSystemFileHandle (not serializable)
  physicalPath?: string;
  bitfield: number[]; // 0: empty, 1: downloading, 2: finished
  safetyScore: number;
  peerCount: number;
  lastActive: number;
}

export interface AppSettings {
  language: Language;
  accentColor: AccentColor;
  visualEnvironment: VisualEnvironment;
  globalMaxThreads: number;
  totalDiskLimit: number;
  defaultSavePath: string;
  aiEnabledByDefault: boolean;
}

export interface SystemLog {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export interface AIAnalysisResult {
  suggestedName: string;
  fileType: FileType;
  description: string;
  tags: string[];
  safetyScore: number;
  securityReport: string;
}
