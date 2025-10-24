// データベースモデルの型定義
export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export type Outcome = 
  | 'APPOINTMENT' 
  | 'DOCUMENT_SENT' 
  | 'CONTACT_SUCCESS' 
  | 'RECEPTION_FAILED'

export type ImprovementPriority = '高' | '中' | '低'

export type ImprovementCategory = 
  | '冒頭トーク'
  | 'ヒアリング'
  | '提案・訴求'
  | '反論処理'
  | 'クロージング'
  | 'トーン・話し方'
  | 'その他'

// 改善点の型定義
export interface ImprovementCategory {
  category: ImprovementCategory
  priority: ImprovementPriority
  problem: string
  suggestion: string
}

export interface Improvements {
  categories: ImprovementCategory[]
}

// 話者情報の型定義
export interface Speaker {
  speakerId: number
  label: string
  utterances: number
}

export interface SpeakerInfo {
  speakers: Speaker[]
}

// APIレスポンスの型定義
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

// ジョブサマリーの型定義
export interface JobSummary {
  jobId: number
  jobStatus: JobStatus
  jobCreatedAt: Date
  audioFileId: number | null
  originalFilename: string | null
  totalDuration: number | null
  totalConversations: number
  appointmentCount: number
  documentSentCount: number
  contactSuccessCount: number
  receptionFailedCount: number
  successRate: number | null
}

// 会話詳細の型定義
export interface ConversationDetail {
  conversationId: number
  audioFileId: number
  conversationNo: number
  startTimeSec: number
  endTimeSec: number
  durationSeconds: number
  transcript: string
  speakerInfo: SpeakerInfo | null
  outcome: Outcome | null
  confidenceScore: number | null
  outcomeReason: string | null
  improvements: Improvements | null
  originalFilename: string
  jobId: number
}

