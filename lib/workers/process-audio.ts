import { prisma } from '@/lib/db/prisma'
import { transcribeLargeAudio } from '@/lib/ai/whisper'
import { splitIntoConversations } from '@/lib/conversation/splitter'
import { analyzeConversationOutcome, analyzeImprovements } from '@/lib/ai/gemini'
import { getSignedUrl } from '@/lib/storage/supabase'

/**
 * 音声ファイルを処理するメインワーカー関数
 * 
 * 処理フロー:
 * 1. 音声認識（Whisper API）
 * 2. 会話分割
 * 3. 各会話の成果判定（Gemini API）
 * 4. 改善点分析（Gemini API）
 * 
 * @param audioFileId - 処理する音声ファイルのID
 */
export async function processAudioFile(audioFileId: number): Promise<void> {
  try {
    // 音声ファイル情報を取得
    const audioFile = await prisma.audioFile.findUnique({
      where: { id: audioFileId },
      include: { job: true },
    })

    if (!audioFile) {
      throw new Error(`Audio file not found: ${audioFileId}`)
    }

    // 既に処理中または完了している場合はスキップ
    if (audioFile.job.status !== 'PENDING') {
      console.log(`[Worker] Job ${audioFile.job.id} is already ${audioFile.job.status}, skipping`)
      return
    }

    console.log(`[Worker] Processing audio file: ${audioFile.id}`)

    // ジョブステータスを PROCESSING に更新
    await prisma.job.update({
      where: { id: audioFile.jobId },
      data: { status: 'PROCESSING' },
    })

    // ステップ1: 音声認識
    console.log(`[Worker] Step 1: Transcribing audio...`)
    console.log(`[Worker] File URL: ${audioFile.fileUrl}`)
    console.log(`[Worker] Original filename: ${audioFile.originalFilename}`)
    console.log(`[Worker] MIME type: ${audioFile.mimeType}`)
    
    // Supabase Storageの署名付きURLを生成（プライベートバケットの場合必要）
    let downloadUrl = audioFile.fileUrl
    try {
      downloadUrl = await getSignedUrl(audioFile.fileUrl, 7200) // 2時間有効
      console.log(`[Worker] Generated signed URL for download`)
    } catch (error) {
      console.warn(`[Worker] Failed to generate signed URL, using original URL:`, error)
      // 署名付きURL生成に失敗した場合は元のURLを使用（公開バケットの場合）
    }
    
    const transcriptionResults = await transcribeLargeAudio(
      downloadUrl,
      audioFile.originalFilename,
      audioFile.mimeType
    )
    
    // 全セグメントを結合
    const allSegments = transcriptionResults.flatMap(result => result.segments)
    const fullTranscript = transcriptionResults.map(result => result.text).join(' ')
    const totalDuration = Math.max(...allSegments.map(s => s.end))

    // 音声ファイル情報を更新
    await prisma.audioFile.update({
      where: { id: audioFile.id },
      data: {
        transcript: fullTranscript,
        durationSeconds: Math.ceil(totalDuration),
      },
    })

    console.log(`[Worker] Transcription complete: ${fullTranscript.length} characters`)

    // ステップ2: 会話分割
    console.log(`[Worker] Step 2: Splitting conversations...`)
    const conversations = splitIntoConversations(allSegments, fullTranscript)
    console.log(`[Worker] Found ${conversations.length} conversations`)

    // 会話をデータベースに保存
    for (const conv of conversations) {
      await prisma.conversation.create({
        data: {
          audioFileId: audioFile.id,
          conversationNo: conv.conversationNo,
          startTimeSec: conv.startTimeSec,
          endTimeSec: conv.endTimeSec,
          durationSeconds: conv.durationSeconds,
          transcript: conv.transcript,
          speakerInfo: undefined, // TODO: 話者情報の抽出
        },
      })
    }

    // ステップ3 & 4: 各会話の分析
    console.log(`[Worker] Step 3 & 4: Analyzing conversations...`)
    
    const conversationRecords = await prisma.conversation.findMany({
      where: { audioFileId: audioFile.id },
      orderBy: { conversationNo: 'asc' },
    })

    // 並列処理で高速化（ただしレート制限に注意）
    const batchSize = 5 // 同時実行数
    for (let i = 0; i < conversationRecords.length; i += batchSize) {
      const batch = conversationRecords.slice(i, i + batchSize)
      
      await Promise.all(
        batch.map(async (conv) => {
          try {
            // 成果判定
            const outcomeResult = await analyzeConversationOutcome(conv.transcript)
            
            // 改善点分析（失敗した会話のみ）
            const improvementResult = await analyzeImprovements(
              conv.transcript,
              outcomeResult.outcome
            )

            // 分析結果を保存
            await prisma.analysis.create({
              data: {
                conversationId: conv.id,
                outcome: outcomeResult.outcome,
                confidenceScore: outcomeResult.confidence,
                outcomeReason: outcomeResult.reason,
                improvements: improvementResult.improvements as any,
              },
            })

            console.log(`[Worker] Analyzed conversation ${conv.conversationNo}: ${outcomeResult.outcome}`)
          } catch (error) {
            console.error(`[Worker] Error analyzing conversation ${conv.id}:`, error)
            // エラーが発生しても処理を続行
          }
        })
      )

      // レート制限対策: 少し待機
      if (i + batchSize < conversationRecords.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // ジョブステータスを COMPLETED に更新
    await prisma.job.update({
      where: { id: audioFile.jobId },
      data: { status: 'COMPLETED' },
    })

    console.log(`[Worker] Processing complete for audio file: ${audioFile.id}`)
  } catch (error) {
    console.error(`[Worker] Error processing audio file ${audioFileId}:`, error)

    // ジョブステータスを FAILED に更新
    const audioFile = await prisma.audioFile.findUnique({
      where: { id: audioFileId },
    })

    if (audioFile) {
      await prisma.job.update({
        where: { id: audioFile.jobId },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : '処理中にエラーが発生しました',
        },
      })
    }

    throw error
  }
}

