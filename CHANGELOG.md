# Changelog - テレアポFB君

このファイルは、プロジェクトの重要な変更を記録します。

フォーマットは [Keep a Changelog](https://keepachangelog.com/ja/1.0.0/) に基づいています。

---

## [Unreleased]

### 計画中
- API Routes実装
- ジョブワーカー実装
- ダッシュボードUI実装
- 音声アップロード機能

---

## [0.1.0] - 2025-10-25

### Added

#### 進捗管理システム
- `TODO.md` - タスク管理ファイル追加
- `PROGRESS.md` - 全体進捗記録ファイル追加
- `CHANGELOG.md` - 変更履歴ファイル追加（このファイル）
- `.cursor/rules/95-progress-tracking.mdc` - 進捗管理ルール追加

#### 開発ルール（Cursor Rules）
- `.cursor/rules/00-architecture.mdc` - アーキテクチャ原則
- `.cursor/rules/10-backend-api.mdc` - API設計規約
- `.cursor/rules/20-audio-processing.mdc` - 音声処理規約
- `.cursor/rules/30-llm-analysis.mdc` - LLM分析規約
- `.cursor/rules/40-db-schema.mdc` - データベーススキーマ規約
- `.cursor/rules/50-ui-dashboard.mdc` - UI/UX規約
- `.cursor/rules/60-security-privacy.mdc` - セキュリティ・プライバシー規約
- `.cursor/rules/70-operations-jobs.mdc` - ジョブキュー設計
- `.cursor/rules/80-testing-ci.mdc` - テスト・CI規約
- `.cursor/rules/90-prompts.mdc` - LLMプロンプト規約

#### ドキュメント
- `AGENTS.md` - エージェント運用手順書
- `SETUP.md` - 詳細セットアップガイド（282行）
- `.env.example` - 環境変数テンプレート

#### README更新
- 開発ルールセクション追加
- UI設計書へのリンク追加
- セットアップ手順の詳細化

---

## [0.0.9] - 2025-10-24

### Added

#### 設計ドキュメント完成
- `docs/requirements.md` - 要件定義書（605行）
- `docs/architecture.md` - システムアーキテクチャ設計書（649行）
- `docs/database.md` - データベース設計書（651行）
- `docs/ui-design.md` - UI設計書（1,903行）
- `docs/api.md` - API設計書（617行）

合計約4,000行の詳細設計書を作成。

---

## [0.0.5] - 2025-10-24

### Added

#### プロジェクト基盤
- Next.js 14プロジェクト初期化（App Router）
- TypeScript設定
- Tailwind CSS + PostCSS設定
- ESLint + Prettier設定

#### 依存パッケージ
- `@google/generative-ai` - Google Gemini API SDK
- `@prisma/client` - Prisma ORM
- `@vercel/blob` - Vercel Blob Storage
- `openai` - OpenAI API SDK
- `zod` - スキーマバリデーション
- `date-fns` - 日付操作
- `lucide-react` - アイコン
- `class-variance-authority` - CVA（スタイル管理）

#### Shadcn/ui コンポーネント
- Button
- Card
- Badge
- Progress

#### ディレクトリ構造
```
app/
  api/
    audio-files/
    conversations/
    jobs/
    upload/
  dashboard/
components/
  ui/
  dashboard/
  upload/
lib/
  api/
  blob/
  db/
  utils/
  validations/
prisma/
types/
```

#### データベース
- Prismaスキーマ定義完了
  - `Job` モデル
  - `AudioFile` モデル
  - `Conversation` モデル
  - `Analysis` モデル
  - Enum定義（JobStatus, Outcome）

---

## [0.0.1] - 2025-10-24

### Added
- 初回コミット
- プロジェクト構想開始
- README.md初版

---

## 変更の種類

このプロジェクトでは以下の分類を使用します：

- **Added**: 新機能
- **Changed**: 既存機能の変更
- **Deprecated**: 今後削除される機能
- **Removed**: 削除された機能
- **Fixed**: バグ修正
- **Security**: セキュリティ修正

---

**リリース方針:**
- `[Unreleased]`: 開発中の変更
- `[0.x.x]`: MVP開発中のバージョン
- `[1.0.0]`: 正式リリース（MVP完成）

