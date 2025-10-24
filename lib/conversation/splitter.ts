import type { WhisperSegment } from '@/lib/ai/whisper'

export interface ConversationSegment {
  conversationNo: number
  startTimeSec: number
  endTimeSec: number
  durationSeconds: number
  transcript: string
  segments: WhisperSegment[]
}

/**
 * 会話の開始パターン（正規表現）
 */
const CONVERSATION_START_PATTERNS = [
  /^(お世話になっております|もしもし|失礼いたします)/,
  /^.{0,10}(と申します|でございます|と言います)/,
  /^(株式会社|会社).{0,30}(と申します|でございます)/,
]

/**
 * 会話の終了パターン（正規表現）
 */
const CONVERSATION_END_PATTERNS = [
  /(ありがとうございました|失礼いたします|失礼します)$/,
  /(よろしくお願いします|またご連絡します)$/,
]

/**
 * 沈黙時間の閾値（秒）
 * この時間以上の沈黙があれば、会話が切り替わったと判断
 */
const SILENCE_THRESHOLD = 30

/**
 * 最小会話時間（秒）
 * この時間未満の会話は誤検知として除外
 */
const MIN_CONVERSATION_DURATION = 30

/**
 * 文字起こしセグメントを個別の会話に分割する
 * 
 * @param segments - Whisper APIから返されたセグメント配列
 * @param fullTranscript - 全体の文字起こしテキスト
 * @returns 分割された会話の配列
 */
export function splitIntoConversations(
  segments: WhisperSegment[],
  fullTranscript: string
): ConversationSegment[] {
  if (segments.length === 0) {
    return []
  }

  const conversations: ConversationSegment[] = []
  let currentConversation: {
    startTimeSec: number
    segments: WhisperSegment[]
  } | null = null
  let conversationNo = 1

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    const prevSegment = i > 0 ? segments[i - 1] : null
    
    // 沈黙時間をチェック
    const silenceDuration = prevSegment
      ? segment.start - prevSegment.end
      : 0

    // 会話の開始を検出
    const isConversationStart = 
      !currentConversation ||
      silenceDuration >= SILENCE_THRESHOLD ||
      CONVERSATION_START_PATTERNS.some(pattern => pattern.test(segment.text.trim()))

    if (isConversationStart) {
      // 前の会話を保存
      if (currentConversation && currentConversation.segments.length > 0) {
        const conversation = createConversation(
          conversationNo,
          currentConversation.startTimeSec,
          currentConversation.segments
        )
        
        // 最小会話時間をチェック
        if (conversation.durationSeconds >= MIN_CONVERSATION_DURATION) {
          conversations.push(conversation)
          conversationNo++
        }
      }

      // 新しい会話を開始
      currentConversation = {
        startTimeSec: Math.floor(segment.start),
        segments: [segment],
      }
    } else {
      // 現在の会話にセグメントを追加
      currentConversation!.segments.push(segment)
    }
  }

  // 最後の会話を保存
  if (currentConversation && currentConversation.segments.length > 0) {
    const conversation = createConversation(
      conversationNo,
      currentConversation.startTimeSec,
      currentConversation.segments
    )
    
    if (conversation.durationSeconds >= MIN_CONVERSATION_DURATION) {
      conversations.push(conversation)
    }
  }

  return conversations
}

/**
 * セグメント配列から会話オブジェクトを作成
 */
function createConversation(
  conversationNo: number,
  startTimeSec: number,
  segments: WhisperSegment[]
): ConversationSegment {
  const lastSegment = segments[segments.length - 1]
  const endTimeSec = Math.ceil(lastSegment.end)
  const transcript = segments.map(s => s.text).join(' ')

  return {
    conversationNo,
    startTimeSec,
    endTimeSec,
    durationSeconds: endTimeSec - startTimeSec,
    transcript,
    segments,
  }
}

/**
 * 簡易的な会話分割（パターンマッチングベース）
 * 
 * Whisperのセグメント情報がない場合の代替手段
 */
export function splitTranscriptByPatterns(
  transcript: string
): string[] {
  // 改行で分割
  const lines = transcript.split('\n').filter(line => line.trim())
  
  const conversations: string[] = []
  let currentConversation: string[] = []

  for (const line of lines) {
    const trimmedLine = line.trim()
    
    // 会話の開始パターンをチェック
    const isStart = CONVERSATION_START_PATTERNS.some(pattern => 
      pattern.test(trimmedLine)
    )

    if (isStart && currentConversation.length > 0) {
      // 前の会話を保存
      conversations.push(currentConversation.join('\n'))
      currentConversation = [line]
    } else {
      currentConversation.push(line)
    }
  }

  // 最後の会話を保存
  if (currentConversation.length > 0) {
    conversations.push(currentConversation.join('\n'))
  }

  return conversations
}

