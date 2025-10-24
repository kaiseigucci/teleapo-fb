# テレアポFB君（フィードバック君）

テレアポの音声を自動で分析し、改善点をフィードバックするAIシステム

## 📖 プロジェクト概要

テレアポの音声ファイル（最大3時間）をアップロードすると、自動で以下の処理を行います：

1. **音声の文字起こし**：Google Speech-to-Text APIで音声をテキスト化
2. **会話の自動分割**：1件1件の電話を自動で区切り
3. **成果判定**：各会話がアポ獲得/資料送付/担当者接続/受付突破失敗のいずれかを判定
4. **改善点分析**：うまくいかなかった会話に対して、冒頭/クロージング等の改善点を提示

## 🚀 技術スタック

### フロントエンド
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Shadcn/ui**

### バックエンド
- **Next.js API Routes**
- **Python** (音声処理用)

### データベース & ストレージ
- **Supabase** (PostgreSQL)
- **Vercel Blob Storage** (音声ファイル一時保存)

### AI/ML
- **OpenAI Whisper API** (音声認識)
- **Google Gemini API** (会話分析・フィードバック生成)

### インフラ
- **Vercel** (ホスティング)

## 📁 ドキュメント

### 設計ドキュメント
- [要件定義書](./docs/requirements.md)
- [システムアーキテクチャ設計書](./docs/architecture.md)
- [データベース設計書](./docs/database.md)
- [UI設計書](./docs/ui-design.md)
- [API設計書](./docs/api.md)

### 開発ルール
- [エージェント運用手順](./AGENTS.md)
- [セットアップガイド](./SETUP.md)
- [Cursorルール](./.cursor/rules/) - プロジェクト固有の開発規約
  - `00-architecture.mdc` - アーキテクチャ原則
  - `10-backend-api.mdc` - API設計規約
  - `20-audio-processing.mdc` - 音声処理規約
  - `30-llm-analysis.mdc` - LLM分析規約
  - `40-db-schema.mdc` - データベーススキーマ規約
  - `50-ui-dashboard.mdc` - UI/UX規約
  - `60-security-privacy.mdc` - セキュリティ・プライバシー規約
  - `70-operations-jobs.mdc` - ジョブキュー設計
  - `80-testing-ci.mdc` - テスト・CI規約
  - `90-prompts.mdc` - LLMプロンプト規約
  - `95-progress-tracking.mdc` - 進捗管理ルール

### 進捗管理
- [TODO](./TODO.md) - タスク管理
- [PROGRESS](./PROGRESS.md) - 全体進捗状況
- [CHANGELOG](./CHANGELOG.md) - 変更履歴

## 🎯 主要機能（MVP）

### 1. 音声アップロード機能
- Webから音声ファイルをアップロード
- 対応形式：MP3, WAV, M4A
- 最大ファイルサイズ：1GB
- 処理時間：5〜10分以内

### 2. 自動分析機能
- 音声の文字起こし
- 会話の自動分割（挨拶〜終了挨拶で区切り）
- 成果指標の自動判定
- 改善点の自動生成

### 3. ダッシュボード機能
- 分析結果の一覧表示
- 各会話の詳細表示
- 成果指標の可視化

## 🔒 セキュリティ & プライバシー

- 音声ファイルは処理後24時間で自動削除
- 分析結果のみデータベースに保存
- API認証は環境変数で管理

## 💰 コスト試算

### OpenAI Whisper API
- 料金：$0.006/分
- 3時間（180分）= 約 $1.08/ファイル

### Google Gemini API
- Gemini 1.5 Flash：無料枠あり
- 有料時：$0.00001875/1Kトークン（入力）

### Vercel
- Hobby（無料）または Pro（$20/月）

### Supabase
- Free tier（500MB DB、1GB ストレージ）

## 📦 セットアップ

### 1. 環境変数の設定

`.env.example` を `.env.local` にコピーして、必要なAPIキーを設定してください。

```bash
cp .env.example .env.local
```

必要な環境変数：
- `OPENAI_API_KEY` - OpenAI Whisper API用
- `GOOGLE_API_KEY` - Google Gemini API用
- `SUPABASE_URL` - Supabase プロジェクトURL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase サービスロールキー
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob ストレージトークン

### 2. 依存パッケージのインストール

```bash
pnpm install
```

### 3. 開発サーバーの起動

```bash
pnpm dev
```

詳細な開発手順は [AGENTS.md](./AGENTS.md) を参照してください。

## 🚧 開発ロードマップ

### Phase 1: MVP（最小限の機能）✅ 完了
- [x] 音声アップロード機能
- [x] 音声の文字起こし（OpenAI Whisper API）
- [x] 会話の自動分割
- [x] 成果指標の判定（Google Gemini API）
- [x] 改善点フィードバック
- [x] ダッシュボード（基本）
- [x] 手動処理トリガー

### Phase 2: 機能拡張（未実装）
- [ ] 自動バックグラウンド処理
- [ ] 会話詳細表示画面
- [ ] 統計情報の可視化
- [ ] フィルター・検索機能
- [ ] データエクスポート（CSV/PDF）

### Phase 3: 改善（未実装）
- [ ] リアルタイム進捗表示
- [ ] Vercel Blob連携（現在未設定）
- [ ] より詳細な分析カテゴリ
- [ ] カスタマイズ可能なフィードバック
- [ ] 話者認識の改善

## 📝 ライセンス

MIT License

## 👤 作成者

Kaisei Yamaguchi

