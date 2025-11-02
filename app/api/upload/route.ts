import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api/response'
import {
  validateAudioFile,
  SUPPORTED_AUDIO_FORMATS,
  MAX_FILE_SIZE,
} from '@/lib/validations/upload'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60 // 60秒（Vercel Pro）

/**
 * POST /api/upload
 * 音声ファイルをアップロードし、分析ジョブを作成する
 */
export async function POST(request: NextRequest) {
  try {
    // FormDataを取得
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    // ファイルの存在チェック
    if (!file) {
      return errorResponse(
        ErrorCodes.MISSING_FILE,
        'ファイルが選択されていません',
        400
      )
    }

    // ファイルバリデーション
    const validation = validateAudioFile(file)
    if (!validation.valid) {
      const isFormatError = !SUPPORTED_AUDIO_FORMATS.includes(file.type)
      return errorResponse(
        isFormatError ? ErrorCodes.INVALID_FILE_TYPE : ErrorCodes.FILE_TOO_LARGE,
        validation.error!,
        isFormatError ? 400 : 413
      )
    }

    // ジョブを作成（PENDING状態）
    const job = await prisma.job.create({
      data: {
        status: 'PENDING',
      },
    })

    // ファイルをストレージにアップロード
    let blobResult
    try {
      // Supabase Storageを使用（推奨）
      const useSupabaseStorage = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (useSupabaseStorage) {
        const { uploadAudioFile } = await import('@/lib/storage/supabase')
        blobResult = await uploadAudioFile(file)
      } else if (process.env.BLOB_READ_WRITE_TOKEN) {
        // Vercel Blobが設定されている場合
        const { uploadAudioFile } = await import('@/lib/blob/client')
        blobResult = await uploadAudioFile(file)
      } else {
        // どちらも設定されていない場合はモック
        console.warn('⚠️  Storage is not configured. Using mock storage.')
        const { uploadAudioFile: mockUpload } = await import('@/lib/blob/client-mock')
        blobResult = await mockUpload(file)
      }
    } catch (error) {
      // アップロード失敗時はジョブをFAILEDに更新
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          errorMessage: 'ファイルのアップロードに失敗しました',
        },
      })
      
      console.error('Blob upload error:', error)
      return errorResponse(
        ErrorCodes.UPLOAD_FAILED,
        'ファイルのアップロードに失敗しました',
        500
      )
    }

    // audio_filesテーブルにレコードを作成
    const audioFile = await prisma.audioFile.create({
      data: {
        jobId: job.id,
        filename: file.name,
        originalFilename: file.name,
        fileUrl: blobResult.url,
        fileSize: BigInt(file.size),
        mimeType: file.type,
      },
    })

    // TODO: バックグラウンドジョブをキューに投入
    // 現時点ではジョブ作成のみ

    return successResponse({
      jobId: job.id,
      audioFileId: audioFile.id,
      filename: audioFile.filename,
      originalFilename: audioFile.originalFilename,
      fileSize: file.size,
      status: job.status,
      createdAt: job.createdAt.toISOString(),
    })
  } catch (error) {
    console.error('Upload error:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      'サーバーエラーが発生しました',
      500
    )
  }
}

