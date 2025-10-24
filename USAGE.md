# 使い方ガイド：テレアポFB君

## 🚀 基本的な使い方

### 1. アプリケーションの起動

```bash
npm run dev
```

http://localhost:3000 にアクセスしてください。

### 2. 音声ファイルのアップロード

1. ダッシュボードの「音声ファイルをアップロード」セクションに移動
2. 音声ファイル（MP3, WAV, M4A）をドラッグ&ドロップ、または「クリックして選択」
3. 「アップロード」ボタンをクリック

**注意**: 現在、BLOB_READ_WRITE_TOKENが未設定の場合、アップロードは失敗します。
Vercel Blobの設定が完了するまで、テスト環境では直接データベースに登録してください。

### 3. 処理の開始

アップロードが完了すると、「分析履歴」セクションに新しいジョブが表示されます。

1. ジョブの右側にある「処理を開始」ボタンをクリック
2. バックグラウンドで処理が開始されます
3. ステータスが「処理中」に変わります

**処理時間の目安**:
- 3分の音声: 約30秒〜1分
- 1時間の音声: 約10〜15分
- 3時間の音声: 約30〜45分

### 4. 結果の確認

処理が完了すると、ジョブのステータスが「完了」に変わり、以下の情報が表示されます：

- **会話数**: 検出された会話の総数
- **アポ獲得**: アポイントメントが取れた会話の数
- **資料送付**: 資料送付の承諾を得た会話の数
- **担当者接続**: キーパーソンとの通話に成功した会話の数
- **成功率**: 全体の成功率（%）

---

## 🧪 テスト方法

### テスト用の音声ファイルがない場合

音声ファイルがない場合、以下の方法でテストできます：

#### オプション1: サンプル音声を作成

テキストを音声に変換するツールを使用：
- Google Text-to-Speech
- Amazon Polly
- OpenAI TTS

#### オプション2: 直接データベースに登録

```sql
-- ジョブを作成
INSERT INTO jobs (status) VALUES ('PENDING') RETURNING id;

-- 音声ファイル情報を登録（例: job_id = 1）
INSERT INTO audio_files (
  job_id, 
  filename, 
  original_filename, 
  file_url, 
  file_size, 
  mime_type
) VALUES (
  1,
  'test-audio.mp3',
  'test-audio.mp3',
  'https://example.com/audio.mp3',  -- 有効なURLに置き換え
  1024000,
  'audio/mpeg'
);
```

その後、ダッシュボードで「処理を開始」をクリックします。

---

## 📊 処理フロー

```
[音声アップロード]
     ↓
[Vercel Blob Storageに保存]
     ↓
[ジョブ作成（PENDING）]
     ↓
[「処理を開始」ボタンをクリック]
     ↓
[ジョブステータス: PROCESSING]
     ↓
[ステップ1: OpenAI Whisper APIで文字起こし]
     ↓
[ステップ2: 会話を自動分割]
     ↓
[ステップ3: 各会話の成果を判定（Gemini API）]
     ↓
[ステップ4: 失敗した会話の改善点を分析（Gemini API）]
     ↓
[ジョブステータス: COMPLETED]
     ↓
[ダッシュボードに結果を表示]
```

---

## 🛠️ トラブルシューティング

### エラー: "Environment variable not found: BLOB_READ_WRITE_TOKEN"

**原因**: Vercel Blobのトークンが未設定

**解決策**: 
1. Vercelプロジェクトを作成
2. Storage > Blob を有効化
3. `.env.local` に `BLOB_READ_WRITE_TOKEN` を設定
4. サーバーを再起動

**一時的な回避策**: 
直接データベースにレコードを作成して、処理開始ボタンからテストする。

### エラー: "Can't reach database server"

**原因**: DATABASE_URLが間違っているか、Supabaseが停止

**解決策**:
1. Supabaseダッシュボードでプロジェクトが起動しているか確認
2. `.env` ファイルのDATABASE_URLを確認
3. ファイアウォールでポート5432がブロックされていないか確認

### エラー: "Rate limit exceeded"

**原因**: OpenAIまたはGemini APIのレート制限

**解決策**:
- 有料プランにアップグレード
- または処理する会話数を減らす

### 処理が「PROCESSING」のまま止まる

**原因**: 
- APIエラー
- タイムアウト
- Vercelの実行時間制限（60秒）

**確認方法**:
1. ターミナルのログを確認
2. Vercelダッシュボードのログを確認
3. データベースのjobsテーブルでerror_messageを確認

```sql
SELECT * FROM jobs WHERE status = 'PROCESSING' OR status = 'FAILED';
```

---

## 💡 ヒント

### 処理を高速化する

1. **並列処理**: 現在は5会話ずつ並列処理していますが、レート制限に問題がなければ増やせます
   ```typescript
   // lib/workers/process-audio.ts
   const batchSize = 10 // デフォルト: 5
   ```

2. **会話分割の閾値を調整**: 短い会話が多すぎる場合
   ```typescript
   // lib/conversation/splitter.ts
   const MIN_CONVERSATION_DURATION = 60 // デフォルト: 30秒
   ```

### コストを削減する

- Gemini APIは無料枠が大きいので、まず無料枠を使い切る
- Whisper APIのコストは音声時間に比例（$0.006/分）
- 長時間の音声は事前に不要部分をカットする

### 精度を向上させる

1. **会話分割パターンを追加**:
   ```typescript
   // lib/conversation/splitter.ts
   const CONVERSATION_START_PATTERNS = [
     // 独自のパターンを追加
   ]
   ```

2. **プロンプトをカスタマイズ**:
   ```typescript
   // lib/ai/gemini.ts
   // プロンプト内容を業界や商品に合わせて調整
   ```

---

## 📞 サポート

問題が解決しない場合：

1. [SETUP.md](./SETUP.md) のトラブルシューティングを確認
2. プロジェクトのIssueを作成
3. ログファイルを確認:
   ```bash
   # 開発サーバーのログ
   npm run dev
   
   # Prismaのログ
   npx prisma studio
   ```

---

## 🎯 次のステップ

MVPの動作が確認できたら：

1. Vercel Blobを設定してファイルアップロードを有効化
2. 会話詳細表示画面を実装（Phase 2）
3. 自動バックグラウンド処理を実装
4. 本番環境にデプロイ（Vercel）

詳しくは [README.md](./README.md) の開発ロードマップを参照してください。

