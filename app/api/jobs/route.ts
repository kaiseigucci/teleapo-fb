import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api/response'

// API Routeは常に動的レンダリング
export const dynamic = 'force-dynamic'

/**
 * GET /api/jobs
 * ジョブ一覧を取得
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // バリデーション
    if (limit > 100) {
      return errorResponse(
        'INVALID_PARAMETERS',
        'limitは100以下にしてください',
        400
      )
    }

    // クエリ条件
    const where = status ? { status: status as any } : {}

    // ジョブ一覧を取得
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          audioFiles: {
            select: {
              id: true,
              originalFilename: true,
              durationSeconds: true,
              conversations: {
                select: {
                  id: true,
                  analysis: {
                    select: {
                      outcome: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.job.count({ where }),
    ])

    // レスポンスデータの整形
    const formattedJobs = jobs.map((job) => {
      const audioFile = job.audioFiles[0]
      let conversationCount = 0
      let appointmentCount = 0
      let documentSentCount = 0
      let contactSuccessCount = 0
      let receptionFailedCount = 0

      if (audioFile) {
        conversationCount = audioFile.conversations.length
        audioFile.conversations.forEach((conv) => {
          if (conv.analysis) {
            switch (conv.analysis.outcome) {
              case 'APPOINTMENT':
                appointmentCount++
                break
              case 'DOCUMENT_SENT':
                documentSentCount++
                break
              case 'CONTACT_SUCCESS':
                contactSuccessCount++
                break
              case 'RECEPTION_FAILED':
                receptionFailedCount++
                break
            }
          }
        })
      }

      return {
        id: job.id,
        status: job.status,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
        audioFile: audioFile
          ? {
              id: audioFile.id,
              originalFilename: audioFile.originalFilename,
              duration: audioFile.durationSeconds,
              conversationCount,
              appointmentCount,
              documentSentCount,
              contactSuccessCount,
              receptionFailedCount,
            }
          : null,
      }
    })

    return successResponse({
      jobs: formattedJobs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error('Get jobs error:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      'サーバーエラーが発生しました',
      500
    )
  }
}

