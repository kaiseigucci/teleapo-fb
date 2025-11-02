import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { processAudioFile } from '@/lib/workers/process-audio'
import { successResponse, errorResponse } from '@/lib/api/response'

// API Routeは常に動的レンダリング
export const dynamic = 'force-dynamic'

/**
 * GET /api/cron/process-jobs
 * 
 * 定期的に実行されるCronジョブ
 * PENDINGステータスのジョブを自動的に処理開始する
 * 
 * Vercel Cron Jobsで使用:
 * vercel.json に設定を追加
 */
export async function GET(request: NextRequest) {
  try {
    // セキュリティ: Vercel Cronからのリクエストのみ許可
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return errorResponse('UNAUTHORIZED', '認証に失敗しました', 401)
    }

    console.log('[Cron] Starting job processor...')

    // PENDINGステータスのジョブを取得
    const pendingJobs = await prisma.job.findMany({
      where: { status: 'PENDING' },
      include: {
        audioFiles: {
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: 5, // 一度に最大5件まで処理
    })

    if (pendingJobs.length === 0) {
      console.log('[Cron] No pending jobs found')
      return successResponse({
        message: 'No pending jobs',
        processed: 0,
      })
    }

    console.log(`[Cron] Found ${pendingJobs.length} pending jobs`)

    // 各ジョブを順次処理
    const results = []
    for (const job of pendingJobs) {
      const audioFile = job.audioFiles[0]
      if (!audioFile) {
        console.log(`[Cron] Job ${job.id} has no audio file, skipping`)
        continue
      }

      try {
        console.log(`[Cron] Processing job ${job.id}, audio file ${audioFile.id}`)
        
        // 非同期で処理を開始（await しない）
        processAudioFile(audioFile.id).catch((error) => {
          console.error(`[Cron] Error processing job ${job.id}:`, error)
        })

        results.push({
          jobId: job.id,
          audioFileId: audioFile.id,
          status: 'started',
        })
      } catch (error) {
        console.error(`[Cron] Error starting job ${job.id}:`, error)
        results.push({
          jobId: job.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return successResponse({
      message: `Started processing ${results.length} jobs`,
      processed: results.length,
      results,
    })
  } catch (error) {
    console.error('[Cron] Error in process-jobs cron:', error)
    return errorResponse(
      'INTERNAL_SERVER_ERROR',
      'Cronジョブでエラーが発生しました',
      500
    )
  }
}

// Vercel Cronジョブ以外でも手動実行可能にする
export async function POST(request: NextRequest) {
  return GET(request)
}

