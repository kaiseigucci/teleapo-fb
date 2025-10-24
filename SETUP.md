# セットアップガイド：テレアポFB君

このドキュメントでは、テレアポFB君の開発環境をゼロからセットアップする手順を詳しく説明します。

---

## 📋 目次

1. [前提条件](#前提条件)
2. [プロジェクトのセットアップ](#プロジェクトのセットアップ)
3. [Supabaseのセットアップ](#supabaseのセットアップ)
4. [APIキーの取得](#apiキーの取得)
5. [データベースの初期化](#データベースの初期化)
6. [動作確認](#動作確認)
7. [トラブルシューティング](#トラブルシューティング)

---

## 前提条件

### 必要なツール
- **Node.js**: v20.x 以上
- **npm**: v9.x 以上
- **Git**: 最新版

### 必要なアカウント
- **Supabase** (無料プランで開始可能)
- **OpenAI** (APIクレジット必要)
- **Google Cloud** (Gemini API用、無料枠あり)
- **Vercel** (デプロイ用、オプション)

---

## プロジェクトのセットアップ

### 1. 依存パッケージのインストール

```bash
cd "/Users/kaiseiyamaguchi/dev/テレアポFB君"
npm install
```

### 2. 環境変数ファイルの作成

`.env.local` ファイルをプロジェクトルートに作成します：

```bash
touch .env.local
```

**`.env.local` の内容:**

```env
# Database (後で設定)
DATABASE_URL=""

# Vercel Blob Storage (後で設定)
BLOB_READ_WRITE_TOKEN=""

# OpenAI API (後で設定)
OPENAI_API_KEY=""

# Google Gemini API (後で設定)
GOOGLE_GEMINI_API_KEY=""
```

---

## Supabaseのセットアップ

### 1. Supabaseプロジェクトの作成

1. [Supabase Dashboard](https://supabase.com/dashboard) にアクセス
2. "New project" をクリック
3. プロジェクト名を入力（例: `teleapo-fb`）
4. データベースパスワードを設定（必ずメモしておく）
5. リージョンを選択（推奨: Northeast Asia (Tokyo)）
6. "Create new project" をクリック

### 2. データベース接続文字列の取得

1. プロジェクトダッシュボードで **Settings** > **Database** を開く
2. "Connection string" セクションの **URI** をコピー
3. `[YOUR-PASSWORD]` 部分を実際のパスワードに置き換え
4. `.env.local` の `DATABASE_URL` に貼り付け

**例:**
```env
DATABASE_URL="postgresql://postgres:your_password@db.xxx.supabase.co:5432/postgres"
```

---

## APIキーの取得

### OpenAI API キー

1. [OpenAI Platform](https://platform.openai.com/) にアクセス
2. 右上のアカウントメニューから **API keys** を選択
3. **Create new secret key** をクリック
4. 名前を入力（例: `teleapo-fb`）
5. キーをコピー（後で見られないので注意！）
6. `.env.local` の `OPENAI_API_KEY` に貼り付け

**料金について:**
- 音声認識: $0.006/分（3時間の音声で約$1.08）
- 従量課金制なので、使った分だけ請求されます

### Google Gemini API キー

1. [Google AI Studio](https://makersuite.google.com/app/apikey) にアクセス
2. **Get API key** または **Create API key** をクリック
3. 既存のGCPプロジェクトを選択するか、新規作成
4. キーをコピー
5. `.env.local` の `GOOGLE_GEMINI_API_KEY` に貼り付け

**料金について:**
- Gemini 1.5 Flash: 無料枠が大きい
- 有料でも非常に安価（$0.00001875/1Kトークン）

### Vercel Blob（オプション、後で設定可）

MVPの段階では不要ですが、音声ファイルのアップロードを実装する際に必要になります。

1. Vercelプロジェクトを作成
2. **Storage** タブから **Blob** を選択
3. **Create Database** をクリック
4. トークンをコピーして `.env.local` に設定

---

## データベースの初期化

### 1. Prisma Clientの生成

```bash
npx prisma generate
```

このコマンドで、Prismaスキーマから TypeScript の型定義が生成されます。

### 2. データベースへのマイグレーション

```bash
npx prisma db push
```

このコマンドで、Supabaseのデータベースにテーブルが作成されます。

**成功すると以下のメッセージが表示されます:**

```
Environment variables loaded from .env.local
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "postgres", schema "public" at "db.xxx.supabase.co:5432"

🚀  Your database is now in sync with your Prisma schema. Done in XXXms

✔ Generated Prisma Client (5.x.x) to ./node_modules/@prisma/client
```

### 3. データベースの確認（オプション）

Prisma Studioでデータベースを確認できます：

```bash
npx prisma studio
```

ブラウザで `http://localhost:5555` が開き、テーブル構造を視覚的に確認できます。

---

## 動作確認

### 1. 開発サーバーの起動

```bash
npm run dev
```

### 2. ブラウザで確認

http://localhost:3000 にアクセスします。

**正常に起動していれば:**
- 「テレアポFB君」というタイトルが表示される
- エラーが表示されていない

### 3. データベース接続の確認

Prismaが正しくデータベースに接続できているか確認するため、簡単なテストを実行できます：

```bash
# Prismaスキーマの検証
npx prisma validate
```

---

## トラブルシューティング

### エラー: "Environment variable not found: DATABASE_URL"

**原因:** `.env.local` ファイルが読み込まれていない

**解決策:**
1. `.env.local` ファイルがプロジェクトルートに存在するか確認
2. ファイル名が正確に `.env.local` か確認（`.env.local.txt` などになっていないか）
3. 開発サーバーを再起動

### エラー: "Can't reach database server"

**原因:** DATABASE_URLが間違っているか、Supabaseプロジェクトが停止している

**解決策:**
1. Supabaseダッシュボードでプロジェクトが起動しているか確認
2. DATABASE_URLのパスワード部分が正しいか確認
3. ファイアウォールやVPNがPostgreSQLのポート（5432）をブロックしていないか確認

### エラー: "Invalid API key"

**原因:** OpenAIまたはGemini APIキーが間違っている

**解決策:**
1. APIキーをコピー&ペーストし直す
2. APIキーの前後に余計なスペースがないか確認
3. OpenAI/Googleのダッシュボードでキーが有効か確認

### npm install でエラーが発生する

**原因:** Node.jsのバージョンが古い、またはキャッシュの問題

**解決策:**
```bash
# Node.jsのバージョン確認
node -v  # v20.x 以上であること

# キャッシュをクリア
npm cache clean --force

# 再インストール
rm -rf node_modules package-lock.json
npm install
```

### Prismaのマイグレーションエラー

**原因:** データベースの権限不足、またはスキーマの問題

**解決策:**
```bash
# Prismaスキーマをリセット（注意: データが削除されます）
npx prisma db push --force-reset

# または、Supabaseダッシュボードから手動でテーブルを削除してから再度実行
npx prisma db push
```

---

## 次のステップ

セットアップが完了したら、以下のドキュメントを参照して実装を進めてください：

1. [要件定義書](./docs/requirements.md) - 機能要件の詳細
2. [システムアーキテクチャ設計書](./docs/architecture.md) - システム全体の設計
3. [API設計書](./docs/api.md) - APIエンドポイントの仕様
4. [データベース設計書](./docs/database.md) - データベーススキーマの詳細

---

## サポート

問題が解決しない場合は、以下を確認してください：

- [Next.js ドキュメント](https://nextjs.org/docs)
- [Prisma ドキュメント](https://www.prisma.io/docs)
- [Supabase ドキュメント](https://supabase.com/docs)
- [OpenAI API ドキュメント](https://platform.openai.com/docs)

