# 🚀 クイックデプロイガイド

## 📋 必要なもの

- [ ] GitHubアカウント
- [ ] Vercelアカウント（GitHubでログイン可）
- [ ] 各種APIキー（既に取得済み）

---

## ⚡ 5ステップでデプロイ

### 1️⃣ Gitリポジトリを初期化

```bash
cd "/Users/kaiseiyamaguchi/dev/テレアポFB君"
git init
git add .
git commit -m "Initial commit"
```

### 2️⃣ GitHubリポジトリを作成

https://github.com/new

- リポジトリ名: `teleapo-fb`
- プライベート: ✅

### 3️⃣ GitHubにプッシュ

```bash
git remote add origin https://github.com/YOUR_USERNAME/teleapo-fb.git
git branch -M main
git push -u origin main
```

### 4️⃣ Vercelにインポート

https://vercel.com/new

1. GitHubリポジトリを選択
2. **Import**

### 5️⃣ 環境変数を設定

```
DATABASE_URL=（Supabase PostgreSQL URL）
NEXT_PUBLIC_SUPABASE_URL=（SupabaseプロジェクトURL）
NEXT_PUBLIC_SUPABASE_ANON_KEY=（Supabase Anon Key）
SUPABASE_SERVICE_ROLE_KEY=（Supabase Service Role Key）
OPENAI_API_KEY=（OpenAI APIキー）
GOOGLE_GEMINI_API_KEY=（Google Gemini APIキー）
```

**Deploy** をクリック！

---

## ✅ 完了

2〜3分でデプロイ完了！

デプロイURL: `https://your-project.vercel.app`

---

詳細は `DEPLOY.md` を参照してください。

