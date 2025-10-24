# デプロイガイド：テレアポFB君

## 🚀 Vercelへのデプロイ手順

### ステップ1: GitHubにプッシュ

#### 1.1 Gitリポジトリを初期化（まだの場合）

```bash
cd "/Users/kaiseiyamaguchi/dev/テレアポFB君"
git init
git add .
git commit -m "Initial commit: テレアポFB君 MVP完成"
```

#### 1.2 GitHubリポジトリを作成

1. https://github.com/new にアクセス
2. リポジトリ名: `teleapo-fb` (任意)
3. プライベート: ✅ チェック（推奨）
4. **Create repository** をクリック

#### 1.3 GitHubにプッシュ

```bash
# GitHubのリポジトリURLを設定（自分のユーザー名に置き換えてください）
git remote add origin https://github.com/YOUR_USERNAME/teleapo-fb.git
git branch -M main
git push -u origin main
```

---

### ステップ2: Vercelにデプロイ

#### 2.1 Vercelにログイン

1. https://vercel.com にアクセス
2. GitHubアカウントでログイン

#### 2.2 プロジェクトをインポート

1. **Add New...** → **Project** をクリック
2. **Import Git Repository** でGitHubリポジトリを選択
3. **Import** をクリック

#### 2.3 プロジェクト設定

- **Framework Preset**: Next.js（自動検出）
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

**そのまま次へ**

---

### ステップ3: 環境変数を設定

**Environment Variables** セクションで以下を設定：

#### データベース
```
DATABASE_URL=postgresql://postgres:kaisei3230@db.wicqxydlxbxjvoofmuer.supabase.co:5432/postgres
```

#### Supabase Storage
```
NEXT_PUBLIC_SUPABASE_URL=https://wicqxydlxbxjvoofmuer.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（あなたのキー）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（あなたのキー）
```

#### OpenAI API
```
OPENAI_API_KEY=sk-proj-...（あなたのキー）
```

#### Google Gemini API
```
GOOGLE_GEMINI_API_KEY=AIzaSy...（あなたのキー）
```

⚠️ **重要**: 本番環境では必ず新しいAPIキーを発行してください！

---

### ステップ4: デプロイ

1. **Deploy** をクリック
2. ビルドが完了するまで待機（2〜3分）
3. デプロイ完了！🎉

---

### ステップ5: Vercel Cron Jobsの設定確認

Vercelダッシュボードで：

1. プロジェクト → **Settings** → **Cron Jobs**
2. `vercel.json` の設定が反映されていることを確認

```json
{
  "crons": [
    {
      "path": "/api/cron/process-jobs",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

これにより、5分ごとにPENDINGジョブが自動処理されます。

---

## 🧪 デプロイ後のテスト

### 1. サイトにアクセス

デプロイURLにアクセス（例: `https://teleapo-fb-xxx.vercel.app`）

### 2. アップロード機能をテスト

1. 音声ファイルをアップロード
2. 「処理を開始」ボタンをクリック
3. 処理完了を確認

### 3. データベースを確認

Supabase Dashboardで：
- ジョブが作成されているか
- 音声ファイルが保存されているか
- 会話と分析結果が保存されているか

---

## 📊 本番環境での注意点

### 1. APIキーのセキュリティ

- 開発環境と本番環境で**別々のAPIキー**を使用
- GitHubに`.env.local`を**絶対にコミットしない**（`.gitignore`で除外済み）

### 2. データベースのバックアップ

Supabaseで定期的にバックアップを取る設定を有効化

### 3. コスト管理

#### OpenAI Whisper API
- 約 $0.006/分（3時間 = 約$1.08）
- 使用量アラートを設定: https://platform.openai.com/settings/billing

#### Google Gemini API
- 無料枠: 15 RPM, 1M TPM, 1500 RPD
- 超過した場合の課金設定を確認

#### Supabase
- 無料枠: 500MB DB, 1GB Storage
- Pro プラン($25/月)で容量拡大

### 4. モニタリング

#### Vercelダッシュボード
- **Analytics**: トラフィック確認
- **Logs**: エラーログ確認
- **Functions**: 実行時間・エラー率

#### Supabase Dashboard
- **Database**: クエリパフォーマンス
- **Storage**: 使用容量
- **API**: リクエスト数

---

## 🔄 アップデート方法

コードを変更した後：

```bash
git add .
git commit -m "機能追加: ○○○"
git push
```

Vercelが自動的に再デプロイします（約2〜3分）。

---

## 🆘 トラブルシューティング

### デプロイエラー: "Build failed"

**原因**: TypeScriptエラー、依存関係の問題

**解決策**:
```bash
# ローカルでビルドテスト
npm run build

# エラーを修正後、再度プッシュ
git push
```

### エラー: "Function execution timed out"

**原因**: 長時間の音声処理

**解決策**: すでにVercel Cron Jobsで対応済み。5分ごとに自動処理されます。

### エラー: "Database connection failed"

**原因**: `DATABASE_URL`が間違っている

**解決策**: Vercelの環境変数を確認・修正

---

## 📝 デプロイ後のチェックリスト

- [ ] サイトにアクセスできる
- [ ] 音声ファイルをアップロードできる
- [ ] 処理が正常に完了する
- [ ] 分析結果が表示される
- [ ] Cron Jobsが動作している（5分待って確認）
- [ ] APIキーの使用量アラートを設定
- [ ] Supabaseのバックアップ設定を有効化

---

## 🎉 デプロイ完了！

これでテレアポFB君が本番環境で動作します！

質問があれば、Vercelのサポートまたは開発者に連絡してください。

