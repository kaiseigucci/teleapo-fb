import { NextRequest } from 'next/server'
import { processAudioFile } from '@/lib/workers/process-audio'
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api/response'

/**
 * POST /api/jobs/:id/process
 * ジョブの処理を開始する（手動トリガー）
 * 
 * 本来はバックグラウンドジョブで自動実行されるべきですが、
 * MVP段階では手動でトリガーする仕組みを用意します。
 */
export async function POST(
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

    // ジョブ情報を取得
    const { prisma } = await import('@/lib/db/prisma')
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        audioFiles: {
          take: 1,
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

    if (job.status !== 'PENDING') {
      return errorResponse(
        'INVALID_STATUS',
        `ジョブは既に${job.status}状態です`,
        400
      )
    }

    const audioFile = job.audioFiles[0]
    if (!audioFile) {
      return errorResponse(
        'NO_AUDIO_FILE',
        '音声ファイルが見つかりません',
        404
      )
    }

    // バックグラウンドで処理を開始（非同期）
    // 注意: Vercelでは長時間実行ジョブは制限があるため、
    // 本番環境では別のジョブキューシステムを使用すべき
    processAudioFile(audioFile.id).catch((error) => {
      console.error('Background processing error:', error)
    })

    return successResponse({
      jobId: job.id,
      audioFileId: audioFile.id,
      message: '処理を開始しました',
      status: 'PROCESSING',
    })
  } catch (error) {
    console.error('Process job error:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      'サーバーエラーが発生しました',
      500
    )
  }
}

