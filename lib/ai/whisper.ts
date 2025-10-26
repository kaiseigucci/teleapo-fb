import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface WhisperSegment {
  id: number
  seek: number
  start: number
  end: number
  text: string
  tokens: number[]
  temperature: number
  avg_logprob: number
  compression_ratio: number
  no_speech_prob: number
}

export interface WhisperResponse {
  task: string
  language: string
  duration: number
  text: string
  segments: WhisperSegment[]
}

/**
 * OpenAI Whisper APIで音声を文字起こし
 * 
 * @param audioFile - 音声ファイル（File）
 * @param options - オプション設定
 * @returns 文字起こし結果
 */
export async function transcribeAudio(
  audioFile: File,
  options: {
    filename?: string
    language?: string
  } = {}
): Promise<WhisperResponse> {
  try {
    const response = await openai.audio.transcriptions.create({
      file: audioFile as any, // OpenAI SDKの型定義の問題を回避
      model: 'whisper-1',
      language: options.language || 'ja',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment'],
    })

    return response as WhisperResponse
  } catch (error) {
    console.error('Whisper API error:', error)
    throw new Error('音声認識に失敗しました')
  }
}

/**
 * 大きな音声ファイルを分割してWhisper APIに送信
 * 
 * 注意: Whisper APIのファイルサイズ制限は25MBです。
 * 大きなファイルはFFmpegなどで分割してから送信する必要があります。
 * 
 * @param audioUrl - 音声ファイルのURL（Supabase Storageの署名付きURL）
 * @param filename - 元のファイル名
 * @param mimeType - ファイルのMIMEタイプ
 * @returns 文字起こし結果の配列
 */
export async function transcribeLargeAudio(
  audioUrl: string,
  filename: string = 'audio.mp3',
  mimeType: string = 'audio/mpeg'
): Promise<WhisperResponse[]> {
  // TODO: ファイルをダウンロードしてサイズをチェック
  // TODO: 25MB以上の場合は分割処理
  // MVP版では25MB以下のファイルのみ対応
  
  console.log(`[Whisper] Downloading audio from: ${audioUrl}`)
  console.log(`[Whisper] Filename: ${filename}, MIME: ${mimeType}`)
  
  const response = await fetch(audioUrl)
  
  if (!response.ok) {
    throw new Error(`Failed to download audio file: ${response.status} ${response.statusText}`)
  }
  
  const audioBuffer = await response.arrayBuffer()
  console.log(`[Whisper] Downloaded ${audioBuffer.byteLength} bytes`)
  
  const audioFile = new File([audioBuffer], filename, { type: mimeType })

  const result = await transcribeAudio(audioFile)
  
  return [result]
}

