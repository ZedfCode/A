
export type Language = 'zh' | 'en';
// Added to fix SettingsModal.tsx errors
export type VisualEnvironment = 'amber_digital' | 'ethereal_vapor' | 'monolith_dark';
// Added to fix SettingsModal.tsx errors
export type AccentColor = string;

// Added to fix geminiService.ts error
export interface AIAnalysisResult {
  suggestedName: string;
  fileType: FileType;
  description: string;
  tags: string[];
  safetyScore: number;
  securityReport: string;
}

export enum DownloadStatus {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  DOWNLOADING = 'DOWNLOADING',
  PAUSED = 'PAUSED',
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

export interface DownloadChunk {
  start: number;
  end: number;
  downloaded: number;
  active: boolean;
}

export interface DownloadTask {
  id: string;
  url: string;
  name: string;
  size: number;
  downloaded: number;
  status: DownloadStatus;
  type: FileType;
  progress: number;
  speed: number;
  addedAt: number;
  fileHandle?: any; // FileSystemFileHandle
  chunks: DownloadChunk[];
  threads: number;
  isRangeSupported: boolean;
  // Added to fix error in NewTaskModal.tsx
  physicalPath?: string;
  // Added to support PreviewModal.tsx
  peerCount?: number;
}

export interface SystemLog {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export interface AppSettings {
  language: Language;
  maxThreads: number;
  // Added to support SettingsModal.tsx usage
  visualEnvironment: VisualEnvironment;
  aiEnabledByDefault: boolean;
}
