# テレアポFB君 – エージェント運用手順

## 1. 目的
音声→テキスト→分割→判定→改善→可視化を、安全・高速・低コストで回す。

## 2. セットアップ
- `pnpm i`
- `.env`を`.env.local`にコピーし鍵を設定
- `pnpm dev`

## 3. 実装ルール（Plan→Act）
- **Plan**: 変更差分・影響範囲・テスト方針をMarkdownで提示→レビュー。
- **Act**: 1PR=1機能 or 1不具合。最大差分800行目安。

## 4. よくあるタスク
- アップロードUI改善 → `features/upload`の範囲のみ変更。
- Whisperの分割閾値変更 → `lib/audio/chunker.ts`の定数修正 + 単体テスト更新。
- 成果判定閾値/カテゴリ調整 → `lib/llm/schemas.ts` or prompt更新。

## 5. 運用
- 大容量音声はQueueへ。API Routeで実行しない。
- 24時間のクリーンアップは`jobs/cleanup.ts`で日次実行（Vercel Scheduled）。

## 6. 注意
- 個人情報は常にマスク・削除できるよう関数化（`lib/pii.ts`）。


