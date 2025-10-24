import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api/response'

/**
 * GET /api/jobs/:id
 * ジョブの詳細を取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = parseInt(params.id, 10)

    if (isNaN(jobId)) {
      return errorResponse(
        'INVALID_PARAMETERS',
        'ジョブIDが不正です',
        400
      )
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        audioFiles: {
          include: {
            conversations: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    })

    if (!job) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'ジョブが見つかりません',
        404
      )
    }

    const audioFile = job.audioFiles[0]

    // 進捗情報の計算
    const totalSteps = 4 // 1.アップロード 2.文字起こし 3.会話分割 4.分析
    let completedSteps = 1 // アップロード完了
    let currentStep = 'アップロード完了'

    if (job.status === 'PROCESSING') {
      currentStep = '処理中'
      completedSteps = 2
    } else if (job.status === 'COMPLETED') {
      currentStep = '完了'
      completedSteps = 4
    } else if (job.status === 'FAILED') {
      currentStep = 'エラー'
    }

    const percentage = Math.floor((completedSteps / totalSteps) * 100)

    return successResponse({
      id: job.id,
      status: job.status,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
      errorMessage: job.errorMessage,
      audioFile: audioFile
        ? {
            id: audioFile.id,
            filename: audioFile.filename,
            originalFilename: audioFile.originalFilename,
            fileSize: Number(audioFile.fileSize),
            duration: audioFile.durationSeconds,
            mimeType: audioFile.mimeType,
            createdAt: audioFile.createdAt.toISOString(),
            conversationCount: audioFile.conversations.length,
          }
        : null,
      progress: {
        totalSteps,
        completedSteps,
        currentStep,
        percentage,
      },
    })
  } catch (error) {
    console.error('Get job error:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      'サーバーエラーが発生しました',
      500
    )
  }
}

