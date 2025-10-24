# テストガイド：テレアポFB君

## 🧪 テストの流れ

### テスト1: アップロード機能（UIから）

1. http://localhost:3000 にアクセス
2. 音声ファイルをドラッグ&ドロップ
3. 「アップロード」ボタンをクリック
4. 成功メッセージが表示される
5. 「分析履歴」にジョブが追加される

**期待される結果**:
- ✅ アップロード成功
- ✅ Supabase Storageにファイルが保存される
- ✅ データベースにジョブとaudio_fileレコードが作成される

---

### テスト2: 音声処理・分析

#### 方法A: UIから手動実行

1. ダッシュボードの「分析履歴」を確認
2. PENDINGステータスのジョブの「処理を開始」ボタンをクリック
3. ステータスが「処理中」に変わる
4. 処理完了まで待機（数分〜数十分）

#### 方法B: APIから直接実行

```bash
# ジョブIDを確認
curl http://localhost:3000/api/jobs

# 処理を開始（job_idは実際のIDに置き換え）
curl -X POST http://localhost:3000/api/jobs/1/process
```

**期待される動作**:
1. ステータスが PENDING → PROCESSING に変わる
2. OpenAI Whisper APIで音声認識
3. 会話を自動分割
4. 各会話の成果判定（Gemini API）
5. 改善点分析（Gemini API）
6. ステータスが COMPLETED に変わる
7. ダッシュボードに結果が表示される

---

### テスト3: 結果の確認

処理完了後、ダッシュボードで以下を確認：

- ✅ 会話数
- ✅ アポ獲得件数
- ✅ 資料送付件数
- ✅ 担当者接続件数
- ✅ 成功率

---

## 🐛 トラブルシューティング

### エラー: "Bucket not found"

**原因**: Supabaseでバケットが作成されていない

**解決策**:
1. Supabase Dashboard → Storage
2. **New bucket** → 名前: `audio-files`
3. Public: チェックを外す
4. Create

### エラー: "Permission denied"

**原因**: Storageのポリシーが設定されていない

**解決策**:
1. Storage → `audio-files` バケット → Policies
2. New Policy → 以下を実行:

```sql
CREATE POLICY "Allow all operations for testing"
ON storage.objects FOR ALL
USING (bucket_id = 'audio-files');
```

### エラー: "Rate limit exceeded"

**原因**: OpenAI/Gemini APIのレート制限

**解決策**:
- 少し待ってから再実行
- 有料プランにアップグレード

### 処理が止まる

**確認方法**:
1. ターミナルのログを確認
2. データベースでジョブのエラーメッセージを確認:

```sql
SELECT id, status, error_message 
FROM jobs 
WHERE status = 'FAILED' 
ORDER BY created_at DESC;
```

---

## 📊 期待されるログ

処理中のターミナルログ：

```
[Worker] Processing audio file: 1
[Worker] Step 1: Transcribing audio...
[Worker] Transcription complete: 1500 characters
[Worker] Step 2: Splitting conversations...
[Worker] Found 5 conversations
[Worker] Step 3 & 4: Analyzing conversations...
[Worker] Analyzed conversation 1: APPOINTMENT
[Worker] Analyzed conversation 2: RECEPTION_FAILED
[Worker] Analyzed conversation 3: CONTACT_SUCCESS
[Worker] Analyzed conversation 4: RECEPTION_FAILED
[Worker] Analyzed conversation 5: DOCUMENT_SENT
[Worker] Processing complete for audio file: 1
```

---

## 🎯 成功の基準

### 最小限のMVP動作確認

- [ ] 音声ファイルがアップロードできる
- [ ] ジョブが作成される
- [ ] 「処理を開始」ボタンが動作する
- [ ] 処理が完了する（エラーなし）
- [ ] ダッシュボードに結果が表示される

### フル機能の動作確認

- [ ] 文字起こしが正確
- [ ] 会話が適切に分割される
- [ ] 成果判定が妥当
- [ ] 改善点が具体的で有用
- [ ] 処理時間が許容範囲内

---

## 💡 テスト用の音声ファイル

### 推奨スペック（初回テスト）

- **長さ**: 1〜3分
- **形式**: MP3, WAV, M4A
- **サイズ**: 数MB
- **内容**: 日本語の会話（テレアポでなくても可）

### テキスト→音声変換サービス

音声ファイルがない場合：

1. **Google Text-to-Speech**: https://cloud.google.com/text-to-speech
2. **VOICEVOX**: https://voicevox.hiroshiba.jp/
3. **ChatGPT TTS**: ChatGPTで音声生成

---

## 📝 次のステップ

テストが成功したら：

1. より長い音声（10分〜1時間）でテスト
2. 実際のテレアポ音声でテスト
3. 結果の精度を評価
4. プロンプトを調整（必要に応じて）
5. Vercelにデプロイ

---

## 🆘 サポート

問題が発生した場合：

1. ターミナルのログを確認
2. ブラウザのコンソールを確認（F12）
3. Supabaseのログを確認
4. `TEST_GUIDE.md`のトラブルシューティングを参照

**デバッグ用SQL**:

```sql
-- ジョブの状態を確認
SELECT * FROM jobs ORDER BY created_at DESC LIMIT 10;

-- 音声ファイルを確認
SELECT * FROM audio_files ORDER BY created_at DESC LIMIT 10;

-- 会話を確認
SELECT * FROM conversations ORDER BY created_at DESC LIMIT 10;

-- 分析結果を確認
SELECT * FROM analyses ORDER BY created_at DESC LIMIT 10;
```

