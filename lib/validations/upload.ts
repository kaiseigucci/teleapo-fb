import { z } from 'zod'

// ファイルアップロードのバリデーションスキーマ
export const uploadFileSchema = z.object({
  file: z.custom<File>((val) => val instanceof File, {
    message: 'ファイルを選択してください',
  }),
})

// サポートされているファイル形式
export const SUPPORTED_AUDIO_FORMATS = [
  'audio/mpeg', // MP3
  'audio/wav',  // WAV
  'audio/m4a',  // M4A
  'audio/mp4',  // MP4
  'audio/x-m4a',
]

// 最大ファイルサイズ（1GB）
export const MAX_FILE_SIZE = 1024 * 1024 * 1024 // 1GB in bytes

// ファイルバリデーション関数
export function validateAudioFile(file: File): {
  valid: boolean
  error?: string
} {
  // ファイルサイズチェック
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `ファイルサイズが${MAX_FILE_SIZE / (1024 * 1024 * 1024)}GBを超えています`,
    }
  }

  // ファイル形式チェック
  if (!SUPPORTED_AUDIO_FORMATS.includes(file.type)) {
    return {
      valid: false,
      error: `サポートされていないファイル形式です。対応形式: MP3, WAV, M4A`,
    }
  }

  return { valid: true }
}

