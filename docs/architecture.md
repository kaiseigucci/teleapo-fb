# システムアーキテクチャ設計書：テレアポFB君

**バージョン**: 1.0  
**作成日**: 2025年10月24日  
**最終更新日**: 2025年10月24日

---

## 1. システムアーキテクチャ概要

### 1.1 アーキテクチャ図

```
┌─────────────────────────────────────────────────────────────┐
│                        クライアント層                          │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │       Next.js 14 (App Router) + TypeScript            │  │
│  │   - React Components (Shadcn/ui)                      │  │
│  │   - Tailwind CSS                                       │  │
│  │   - クライアントサイド状態管理 (Zustand/Context)         │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                    アプリケーション層                          │
│                    (Vercel - Edge Runtime)                   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            Next.js API Routes                        │   │
│  │                                                       │   │
│  │  /api/upload       - 音声ファイルアップロード         │   │
│  │  /api/jobs         - ジョブ作成・状態確認            │   │
│  │  /api/analysis     - 分析結果取得                    │   │
│  │  /api/conversations - 会話詳細取得                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                            ↕                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          バックグラウンドジョブ処理                   │   │
│  │        (Vercel Serverless Functions)                 │   │
│  │                                                       │   │
│  │  - 音声認識ジョブ                                    │   │
│  │  - 会話分割ジョブ                                    │   │
│  │  - LLM分析ジョブ                                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
        ↕                    ↕                    ↕
┌───────────────┐  ┌─────────────────┐  ┌──────────────────┐
│  ストレージ層   │  │  データベース層  │  │  外部API層        │
│                │  │                  │  │                  │
│  Vercel Blob   │  │  Supabase        │  │  Google Cloud    │
│  Storage       │  │  (PostgreSQL)    │  │                  │
│                │  │                  │  │  - Speech-to-    │
│  - 音声ファイル │  │  - jobs テーブル │  │    Text API      │
│  (24時間保存)  │  │  - audio_files   │  │  - Gemini API    │
│                │  │  - conversations │  │                  │
│                │  │  - analyses      │  │                  │
└───────────────┘  └─────────────────┘  └──────────────────┘
```

### 1.2 技術スタック詳細

#### フロントエンド
- **Framework**: Next.js 14.2.x (App Router)
- **Language**: TypeScript 5.x
- **UI Library**: React 18.x
- **Styling**: Tailwind CSS 3.x
- **Component Library**: Shadcn/ui
- **State Management**: Zustand または React Context API
- **Form Validation**: Zod + React Hook Form
- **Data Fetching**: SWR または TanStack Query

#### バックエンド
- **Runtime**: Node.js 20.x (Vercel Serverless Functions)
- **API**: Next.js API Routes
- **Authentication**: NextAuth.js（将来的に実装）
- **File Upload**: @vercel/blob

#### データベース
- **DBMS**: PostgreSQL 15.x (Supabase)
- **ORM**: Prisma 5.x または Drizzle ORM
- **Migration**: Prisma Migrate

#### ストレージ
- **File Storage**: Vercel Blob Storage
- **CDN**: Vercel Edge Network

#### 外部API
- **音声認識**: OpenAI Whisper API
- **LLM**: Google Gemini 1.5 Flash API
- **API Client**: OpenAI SDK, Google AI SDK

#### インフラ
- **Hosting**: Vercel
- **CI/CD**: Vercel Git Integration
- **Monitoring**: Vercel Analytics
- **Logging**: Vercel Logs

---

## 2. データフロー詳細

### 2.1 音声アップロード〜分析完了までのフロー

```
[ユーザー]
   ↓ (1) 音声ファイルをドラッグ&ドロップ
[ブラウザ]
   ↓ (2) POST /api/upload (multipart/form-data)
[API: /api/upload]
   ↓ (3) Vercel Blob Storageにアップロード
[Vercel Blob Storage]
   ↓ (4) ファイルURL取得
[API: /api/upload]
   ↓ (5) ジョブレコード作成 (status: PENDING)
[Supabase DB: jobs テーブル]
   ↓ (6) バックグラウンドジョブをキュー投入
[ジョブキュー]
   ↓ (7) ジョブ実行開始（status: PROCESSING）
[Worker: 音声認識処理]
   ↓ (8) OpenAI Whisper API呼び出し
[OpenAI API]
   ↓ (9) 文字起こし結果（JSON）
[Worker: 音声認識処理]
   ↓ (10) audio_filesテーブルに保存
[Supabase DB: audio_files]
   ↓ (11) 会話分割処理
[Worker: 会話分割処理]
   ↓ (12) conversations テーブルに保存（N件）
[Supabase DB: conversations]
   ↓ (13) LLM分析処理（各会話に対して）
[Worker: LLM分析処理]
   ↓ (14) Google Gemini API呼び出し（成果判定）
[Google Cloud API]
   ↓ (15) 判定結果
[Worker: LLM分析処理]
   ↓ (16) 改善点分析（失敗した会話のみ）
[Google Cloud API]
   ↓ (17) 改善点データ
[Worker: LLM分析処理]
   ↓ (18) analyses テーブルに保存（N件）
[Supabase DB: analyses]
   ↓ (19) ジョブステータス更新（status: COMPLETED）
[Supabase DB: jobs]
   ↓ (20) クライアントがポーリングで確認
[ブラウザ]
   ↓ (21) GET /api/analysis/:jobId
[API: /api/analysis]
   ↓ (22) 分析結果を返す
[ブラウザ]
   → ダッシュボードに結果表示
```

### 2.2 処理時間の内訳（3時間音声の場合）

| 処理ステップ | 想定時間 | 備考 |
|------------|---------|-----|
| アップロード | 2〜5分 | ネットワーク速度に依存 |
| 音声認識 | 3〜6分 | OpenAI Whisper APIの処理時間 |
| 会話分割 | 10〜30秒 | LLMによるパターン検出 |
| LLM分析（50会話） | 2〜4分 | 並列処理で高速化 |
| **合計** | **8〜16分** | 目標: 10分以内 |

---

## 3. バックグラウンドジョブ設計

### 3.1 ジョブキューの実装方針

Vercelはサーバーレス環境のため、長時間実行ジョブには制約があります。以下の方法で対応します。

#### オプション1: Vercel Cron Jobs（推奨）
- Vercel標準のCron機能を使用
- 定期的にPENDINGジョブをチェックして実行
- 実装が簡単、追加コストなし

#### オプション2: Upstash（Redis）+ QStash
- Upstash RedisをジョブキューとRして使用
- QStashでHTTPリクエストベースのジョブ実行
- より柔軟な制御が可能

**MVP採用**: オプション1（Vercel Cron Jobs）

### 3.2 ジョブステータス遷移図

```
PENDING (ジョブ作成直後)
   ↓
PROCESSING (処理開始)
   ↓
COMPLETED (正常終了)

PROCESSING から FAILED (エラー発生時)
```

### 3.3 エラーハンドリング

| エラー種別 | 対応方法 |
|-----------|---------|
| API呼び出し失敗 | 3回までリトライ（exponential backoff） |
| 音声ファイル破損 | ジョブをFAILEDにしてユーザーに通知 |
| タイムアウト | 部分的な結果を保存してFAILED |
| API制限超過 | 一定時間待機してリトライ |

---

## 4. データベース設計

### 4.1 ER図

```
┌─────────────────┐
│  jobs           │
├─────────────────┤
│ id (PK)         │
│ status          │◄─────┐
│ created_at      │      │
│ updated_at      │      │
│ error_message   │      │
└─────────────────┘      │
        │                │
        │ 1              │
        │                │
        ↓ N              │
┌─────────────────┐      │
│ audio_files     │      │
├─────────────────┤      │
│ id (PK)         │      │
│ job_id (FK)     │──────┘
│ filename        │
│ file_url        │
│ duration        │
│ transcript      │
│ created_at      │
│ deleted_at      │
└─────────────────┘
        │
        │ 1
        │
        ↓ N
┌─────────────────┐
│ conversations   │
├─────────────────┤
│ id (PK)         │
│ audio_file_id(FK)│
│ conversation_no │
│ start_time      │
│ end_time        │
│ transcript      │
│ created_at      │
└─────────────────┘
        │
        │ 1
        │
        ↓ 1
┌─────────────────┐
│ analyses        │
├─────────────────┤
│ id (PK)         │
│ conversation_id(FK)│
│ outcome         │
│ confidence      │
│ outcome_reason  │
│ improvements    │ (JSON)
│ created_at      │
└─────────────────┘
```

### 4.2 テーブル定義詳細は `database.md` を参照

---

## 5. API設計

### 5.1 RESTful API エンドポイント一覧

| メソッド | パス | 説明 | 認証 |
|---------|------|-----|-----|
| POST | /api/upload | 音声ファイルアップロード | 不要（MVP） |
| GET | /api/jobs | ジョブ一覧取得 | 不要 |
| GET | /api/jobs/:id | ジョブ詳細取得 | 不要 |
| GET | /api/audio-files | 音声ファイル一覧 | 不要 |
| GET | /api/audio-files/:id | 音声ファイル詳細 | 不要 |
| GET | /api/audio-files/:id/conversations | 会話一覧 | 不要 |
| GET | /api/conversations/:id | 会話詳細 | 不要 |
| GET | /api/conversations/:id/analysis | 会話の分析結果 | 不要 |

### 5.2 API詳細は `api.md` を参照

---

## 6. セキュリティ設計

### 6.1 認証・認可（将来実装）

MVP段階では認証なしで実装しますが、将来的には以下を実装：

- **認証**: NextAuth.js（Google OAuth、Email/Password）
- **認可**: Row Level Security（Supabase RLS）
- **セッション管理**: JWT（HTTPOnly Cookie）

### 6.2 データ保護

| 保護対象 | 対策 |
|---------|-----|
| 通信 | HTTPS必須（Vercel標準） |
| APIキー | 環境変数で管理、`.env.local`はGit除外 |
| データベース | Supabaseの接続文字列を環境変数管理 |
| ファイルストレージ | 署名付きURLで一時アクセス許可 |
| 個人情報 | 音声ファイルは24時間で自動削除 |

### 6.3 入力バリデーション

- ファイルアップロード時の拡張子・MIMEタイプチェック
- ファイルサイズ制限（1GB）
- SQLインジェクション対策（ORMの使用）
- XSS対策（React標準のエスケープ）

---

## 7. パフォーマンス最適化

### 7.1 フロントエンド最適化

- **コード分割**: Next.js の動的インポート
- **画像最適化**: Next.js Image コンポーネント
- **キャッシング**: SWRのキャッシュ戦略
- **遅延読み込み**: React.lazy + Suspense

### 7.2 バックエンド最適化

- **並列処理**: LLM分析を並列実行（Promise.all）
- **キャッシング**: API レスポンスのキャッシュ（Redis）
- **データベース最適化**: インデックス作成、クエリ最適化
- **ファイルストリーミング**: 大きな音声ファイルはストリーム処理

### 7.3 API最適化

- **レート制限**: Google APIの制限を考慮したリトライ
- **バッチ処理**: 複数会話を1回のLLM呼び出しにまとめる（可能な場合）
- **圧縮**: gzip圧縮を有効化

---

## 8. 外部システム連携

### 8.1 OpenAI Whisper API

**目的**: 音声認識・文字起こし  
**認証方式**: APIキー（Bearer Token）  
**エンドポイント**: `https://api.openai.com/v1/audio/transcriptions`  
**データフロー**: 音声ファイル → API → 文字起こしテキスト  
**制約事項**:
- 最大ファイルサイズ: 25MB
- 対応形式: mp3, mp4, mpeg, mpga, m4a, wav, webm
- 25MB超のファイルは分割処理が必要

**リクエスト例**:
```typescript
const formData = new FormData();
formData.append('file', audioFile);
formData.append('model', 'whisper-1');
formData.append('language', 'ja');
formData.append('response_format', 'verbose_json');
formData.append('timestamp_granularities', 'segment');

const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
  },
  body: formData,
});
```

**レスポンス例**:
```json
{
  "task": "transcribe",
  "language": "japanese",
  "duration": 10800.0,
  "text": "全文字起こしテキスト...",
  "segments": [
    {
      "id": 0,
      "seek": 0,
      "start": 0.0,
      "end": 5.5,
      "text": "お世話になっております。",
      "tokens": [50364, 1234, ...],
      "temperature": 0.0,
      "avg_logprob": -0.3,
      "compression_ratio": 1.2,
      "no_speech_prob": 0.01
    }
  ]
}
```

**大きなファイルの処理**:
25MB超のファイルは、FFmpegなどで分割してから送信する必要があります。

```typescript
// 例：FFmpegで10分ごとに分割
import ffmpeg from 'fluent-ffmpeg';

function splitAudioFile(inputPath: string, outputDir: string) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        '-f segment',
        '-segment_time 600', // 10分
        '-c copy'
      ])
      .output(`${outputDir}/segment_%03d.mp3`)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}
```

### 8.2 Google Gemini API

**目的**: 会話分析、成果判定、改善点抽出  
**認証方式**: APIキー  
**エンドポイント**: Google AI SDK経由  
**データフロー**: 会話テキスト → API → 分析結果

**使用例**:
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// 成果判定
const prompt = `
以下のテレアポの会話を分析し、成果を判定してください。

会話内容:
${conversationText}

以下の4つのカテゴリから1つを選択してください：
1. APPOINTMENT: アポイントメントが取れた
2. DOCUMENT_SENT: 資料送付の承諾を得た
3. CONTACT_SUCCESS: 担当者との通話に成功した
4. RECEPTION_FAILED: 受付で断られた

JSON形式で回答してください：
{
  "outcome": "カテゴリ",
  "confidence": 信頼度（0〜100）,
  "reason": "判定理由"
}
`;

const result = await model.generateContent(prompt);
const response = JSON.parse(result.response.text());
```

**レート制限**:
- Gemini 1.5 Flash: 15 RPM（無料枠）、1000 RPM（有料）
- 実装時は適切なリトライ処理が必要

---

## 9. 監視・ログ設計

### 9.1 ログ出力

| ログレベル | 内容 |
|----------|-----|
| ERROR | API呼び出し失敗、ジョブ失敗、予期しないエラー |
| WARN | リトライ発生、API制限接近 |
| INFO | ジョブ開始/終了、重要な処理ステップ |
| DEBUG | 詳細なデバッグ情報（開発環境のみ） |

### 9.2 監視項目

- API レスポンスタイム
- ジョブ処理時間
- エラー率
- データベース接続数
- ストレージ使用量
- API呼び出し回数（コスト管理）

### 9.3 アラート設定

- ジョブ失敗率が50%超え
- API呼び出しコストが予算超過
- ストレージ容量が80%超え

---

## 9. デプロイ設計

### 9.1 環境構成

| 環境 | 用途 | URL |
|-----|-----|-----|
| Development | ローカル開発 | http://localhost:3000 |
| Preview | プルリクエストプレビュー | Vercel自動生成URL |
| Production | 本番環境 | https://teleapo-fb.vercel.app |

### 9.2 CI/CD パイプライン

```
[Git Push]
   ↓
[GitHub]
   ↓ (自動トリガー)
[Vercel Build]
   ↓ (ESLint, TypeCheck)
[Tests]
   ↓ (成功時)
[Deploy to Preview/Production]
```

### 9.3 環境変数管理

| 変数名 | 説明 | 環境 |
|-------|-----|-----|
| DATABASE_URL | Supabase接続文字列 | All |
| BLOB_READ_WRITE_TOKEN | Vercel Blob トークン | All |
| OPENAI_API_KEY | OpenAI API キー | All |
| GOOGLE_GEMINI_API_KEY | Google Gemini API キー | All |
| NEXTAUTH_SECRET | NextAuth秘密鍵 | Production |

---

## 10. スケーラビリティ設計

### 10.1 現在のスケール上限

| 項目 | 上限 |
|-----|-----|
| 同時アップロード数 | 3〜5 |
| 1日あたり処理数 | 20〜30ファイル |
| ユーザー数 | 10名 |
| データ保存量 | 10GB |

### 10.2 将来のスケールアップ戦略

#### 短期（〜100ユーザー）
- Vercel Pro プランへ移行
- Supabase Pro プランへ移行
- Redisキャッシュ導入（Upstash）

#### 中期（100〜1000ユーザー）
- マルチテナント対応
- ジョブキューの強化（BullMQ）
- CDN最適化
- データベースのリードレプリカ

#### 長期（1000ユーザー〜）
- マイクロサービス化
- Kubernetes移行
- 独自音声認識エンジンの検討

---

## 11. 障害対応設計

### 11.1 障害シナリオと対応

| 障害シナリオ | 影響範囲 | 対応方法 |
|------------|---------|---------|
| Vercelダウン | 全体停止 | Vercel Status確認、復旧待ち |
| Supabaseダウン | データアクセス不可 | Supabase Status確認、復旧待ち |
| OpenAI APIダウン | 音声認識不可 | リトライキューに保存、復旧後処理 |
| Google Gemini APIダウン | 分析不可 | リトライキューに保存、復旧後処理 |
| ストレージ容量超過 | アップロード不可 | 古いファイルを手動削除 |
| 処理エラー急増 | 一部機能停止 | エラーログ確認、原因特定 |

### 11.2 バックアップ・リカバリ

- **データベース**: Supabase自動バックアップ（日次、7日間保持）
- **リカバリ時間目標（RTO）**: 4時間以内
- **リカバリポイント目標（RPO）**: 24時間以内

---

## 12. コスト試算詳細

### 12.1 月間コスト（想定: 20ファイル/月処理）

| サービス | 項目 | 単価 | 利用量 | 月額コスト |
|---------|-----|-----|-------|-----------|
| Vercel | Hobby | $0 | 1 | $0 |
| Vercel | Pro（将来） | $20 | 1 | $20 |
| Supabase | Free tier | $0 | 1 | $0 |
| OpenAI Whisper | 音声認識 | $1.08/3h | 20回 | $21.60 |
| Google Gemini | LLM分析 | $0.05/会話 | 1000会話 | $50.00 |
| Vercel Blob | ストレージ | $0.15/GB | 5GB | $0.75 |
| **合計（MVP）** | | | | **$72.35** |
| **合計（Pro）** | | | | **$92.35** |

### 12.2 コスト最適化策

- 音声ファイルの24時間自動削除（ストレージコスト削減）
- LLM呼び出しの最小化（キャッシュ活用）
- バッチ処理でAPI呼び出し回数削減
- 無料枠を最大限活用

---

## 13. 技術選定理由

### 13.1 Next.js採用理由

- **フルスタック開発**: フロントとバックエンドを一元管理
- **Vercel最適化**: Vercelとのシームレスな統合
- **TypeScript**: 型安全性、開発効率向上
- **エコシステム**: 豊富なライブラリ、コミュニティ

### 13.2 Supabase採用理由

- **無料枠**: MVPに十分な無料枠
- **PostgreSQL**: 信頼性の高いRDB
- **リアルタイム機能**: 将来的なリアルタイム通知に対応
- **認証機能**: 将来的な認証実装が容易

### 13.3 OpenAI Whisper API採用理由

- **コスト**: Google Speech-to-Textの約1/4のコスト（$0.006/分）
- **精度**: 日本語の認識精度が高い（多言語モデル）
- **シンプル**: APIがシンプルで実装が容易
- **タイムスタンプ**: セグメント単位のタイムスタンプを提供

### 13.4 Google Gemini API採用理由

- **コスト**: 無料枠が大きく、コストパフォーマンスが良い
- **性能**: 会話分析に十分な性能
- **レート制限**: 適度なレート制限でMVPに十分

---

## 14. 変更履歴

| バージョン | 日付 | 変更内容 | 担当者 |
|-----------|------|---------|-------|
| 1.0 | 2025-10-24 | 初版作成 | Kaisei Yamaguchi |

---

**以上**

