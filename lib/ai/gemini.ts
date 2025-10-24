import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Outcome, Improvements } from '@/types'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

export interface OutcomeAnalysisResult {
  outcome: Outcome
  confidence: number
  reason: string
}

export interface ImprovementAnalysisResult {
  improvements: Improvements
}

/**
 * 会話の成果を判定する
 */
export async function analyzeConversationOutcome(
  transcript: string
): Promise<OutcomeAnalysisResult> {
  const prompt = `
あなたはテレアポの分析専門家です。以下のテレアポの会話を分析し、成果を判定してください。

【会話内容】
${transcript}

【判定基準】
1. APPOINTMENT: 商談やアポイントメントが確定した
2. DOCUMENT_SENT: 資料送付の承諾を得た
3. CONTACT_SUCCESS: キーパーソン（担当者）との通話に成功した
4. RECEPTION_FAILED: 受付で断られた、または担当者に繋がらなかった

【回答形式】
必ず以下のJSON形式で回答してください（JSON以外の文字は含めないでください）：

{
  "outcome": "カテゴリ名（APPOINTMENT/DOCUMENT_SENT/CONTACT_SUCCESS/RECEPTION_FAILED）",
  "confidence": 信頼度（0〜100の数値）,
  "reason": "判定理由（100文字以内）"
}
`.trim()

  try {
    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    // JSONのみを抽出（コードブロックなどを除去）
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('JSONレスポンスが見つかりません')
    }

    const analysis = JSON.parse(jsonMatch[0]) as OutcomeAnalysisResult
    
    // バリデーション
    const validOutcomes: Outcome[] = ['APPOINTMENT', 'DOCUMENT_SENT', 'CONTACT_SUCCESS', 'RECEPTION_FAILED']
    if (!validOutcomes.includes(analysis.outcome)) {
      throw new Error('無効なoutcome値です')
    }

    return analysis
  } catch (error) {
    console.error('Gemini API error (outcome):', error)
    
    // フォールバック: 簡易的な判定
    if (transcript.includes('アポ') || transcript.includes('お伺い')) {
      return {
        outcome: 'APPOINTMENT',
        confidence: 50,
        reason: '自動判定（キーワードマッチ）',
      }
    } else if (transcript.includes('資料') || transcript.includes('送付')) {
      return {
        outcome: 'DOCUMENT_SENT',
        confidence: 50,
        reason: '自動判定（キーワードマッチ）',
      }
    } else if (transcript.includes('担当') || transcript.includes('責任者')) {
      return {
        outcome: 'CONTACT_SUCCESS',
        confidence: 50,
        reason: '自動判定（キーワードマッチ）',
      }
    } else {
      return {
        outcome: 'RECEPTION_FAILED',
        confidence: 50,
        reason: '自動判定（デフォルト）',
      }
    }
  }
}

/**
 * 失敗した会話の改善点を分析する
 */
export async function analyzeImprovements(
  transcript: string,
  outcome: Outcome
): Promise<ImprovementAnalysisResult> {
  // 成功している会話には改善点を提示しない
  if (outcome === 'APPOINTMENT' || outcome === 'DOCUMENT_SENT' || outcome === 'CONTACT_SUCCESS') {
    return {
      improvements: {
        categories: [],
      },
    }
  }

  const prompt = `
あなたはテレアポのコーチングの専門家です。以下の失敗したテレアポの会話を分析し、改善点を提示してください。

【会話内容】
${transcript}

【成果】
${outcome === 'RECEPTION_FAILED' ? '受付で断られた' : 'その他'}

【改善カテゴリ】
- 冒頭トーク: 名乗り、挨拶、つかみ
- ヒアリング: 顧客のニーズや状況の聞き出し
- 提案・訴求: サービス・商品の説明、ベネフィット訴求
- 反論処理: 断り文句への対応
- クロージング: アポや資料送付への誘導
- トーン・話し方: 声のトーン、スピード、間の取り方
- その他

【回答形式】
必ず以下のJSON形式で回答してください（JSON以外の文字は含めないでください）：

{
  "categories": [
    {
      "category": "カテゴリ名",
      "priority": "高/中/低",
      "problem": "問題点の説明（100文字以内）",
      "suggestion": "具体的な改善提案（150文字以内）"
    }
  ]
}

※最大3つまでの改善点を提示してください
`.trim()

  try {
    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    // JSONのみを抽出
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('JSONレスポンスが見つかりません')
    }

    const analysis = JSON.parse(jsonMatch[0]) as ImprovementAnalysisResult
    
    return analysis
  } catch (error) {
    console.error('Gemini API error (improvements):', error)
    
    // フォールバック: 一般的な改善点を返す
    return {
      improvements: {
        categories: [
          {
            category: '冒頭トーク',
            priority: '高',
            problem: '相手の警戒心を解くための工夫が不足しています。',
            suggestion: '具体的な業界事例や実績を最初に伝えることで、興味を引きやすくなります。',
          },
        ],
      },
    }
  }
}

