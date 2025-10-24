# データベース設計書：テレアポFB君

**バージョン**: 1.0  
**作成日**: 2025年10月24日  
**最終更新日**: 2025年10月24日

---

## 1. データベース概要

### 1.1 DBMS
- **製品**: PostgreSQL 15.x
- **ホスティング**: Supabase
- **文字エンコーディング**: UTF-8
- **タイムゾーン**: Asia/Tokyo (JST)

### 1.2 接続情報
- **接続方式**: Connection Pooling（推奨）
- **ORM**: Prisma または Drizzle ORM
- **マイグレーション**: Prisma Migrate

---

## 2. ER図

```
┌──────────────────────────────────┐
│         jobs                     │
├──────────────────────────────────┤
│ id               SERIAL PK       │
│ status           VARCHAR(20)     │
│ created_at       TIMESTAMP       │
│ updated_at       TIMESTAMP       │
│ error_message    TEXT NULL       │
└──────────────────────────────────┘
              │
              │ 1
              │
              │ N
              ↓
┌──────────────────────────────────┐
│      audio_files                 │
├──────────────────────────────────┤
│ id               SERIAL PK       │
│ job_id           INTEGER FK      │───┐
│ filename         VARCHAR(255)    │   │
│ original_filename VARCHAR(255)   │   │
│ file_url         TEXT            │   │
│ file_size        BIGINT          │   │
│ duration_seconds INTEGER         │   │
│ mime_type        VARCHAR(50)     │   │
│ transcript       TEXT NULL       │   │
│ created_at       TIMESTAMP       │   │
│ deleted_at       TIMESTAMP NULL  │   │
└──────────────────────────────────┘   │
              │                        │
              │ 1                      │
              │                        │
              │ N                      │
              ↓                        │
┌──────────────────────────────────┐   │
│      conversations               │   │
├──────────────────────────────────┤   │
│ id               SERIAL PK       │   │
│ audio_file_id    INTEGER FK      │◄──┘
│ conversation_no  INTEGER         │
│ start_time_sec   INTEGER         │
│ end_time_sec     INTEGER         │
│ duration_seconds INTEGER         │
│ transcript       TEXT            │
│ speaker_info     JSONB NULL      │
│ created_at       TIMESTAMP       │
└──────────────────────────────────┘
              │
              │ 1
              │
              │ 1
              ↓
┌──────────────────────────────────┐
│        analyses                  │
├──────────────────────────────────┤
│ id               SERIAL PK       │
│ conversation_id  INTEGER FK      │
│ outcome          VARCHAR(50)     │
│ confidence_score DECIMAL(5,2)    │
│ outcome_reason   TEXT NULL       │
│ improvements     JSONB NULL      │
│ created_at       TIMESTAMP       │
└──────────────────────────────────┘
```

---

## 3. テーブル定義

### 3.1 jobs テーブル

**目的**: 音声ファイル処理ジョブの管理

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|---------|------|----------|-----|
| id | SERIAL | NOT NULL | auto | ジョブID（主キー） |
| status | VARCHAR(20) | NOT NULL | 'PENDING' | ジョブステータス |
| created_at | TIMESTAMP | NOT NULL | NOW() | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL | NOW() | 更新日時 |
| error_message | TEXT | NULL | NULL | エラーメッセージ |

**制約**
- PRIMARY KEY: id
- CHECK: status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')

**インデックス**
```sql
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
```

**サンプルデータ**
```sql
INSERT INTO jobs (status) VALUES ('PENDING');
```

---

### 3.2 audio_files テーブル

**目的**: アップロードされた音声ファイルの情報管理

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|---------|------|----------|-----|
| id | SERIAL | NOT NULL | auto | 音声ファイルID（主キー） |
| job_id | INTEGER | NOT NULL | - | ジョブID（外部キー） |
| filename | VARCHAR(255) | NOT NULL | - | 保存ファイル名（UUID） |
| original_filename | VARCHAR(255) | NOT NULL | - | 元のファイル名 |
| file_url | TEXT | NOT NULL | - | Blob StorageのURL |
| file_size | BIGINT | NOT NULL | - | ファイルサイズ（バイト） |
| duration_seconds | INTEGER | NULL | NULL | 音声の長さ（秒） |
| mime_type | VARCHAR(50) | NOT NULL | - | MIMEタイプ |
| transcript | TEXT | NULL | NULL | 全文字起こしテキスト |
| created_at | TIMESTAMP | NOT NULL | NOW() | 作成日時 |
| deleted_at | TIMESTAMP | NULL | NULL | 削除日時（論理削除） |

**制約**
- PRIMARY KEY: id
- FOREIGN KEY: job_id REFERENCES jobs(id) ON DELETE CASCADE
- CHECK: file_size > 0
- CHECK: duration_seconds IS NULL OR duration_seconds > 0

**インデックス**
```sql
CREATE INDEX idx_audio_files_job_id ON audio_files(job_id);
CREATE INDEX idx_audio_files_created_at ON audio_files(created_at DESC);
CREATE INDEX idx_audio_files_deleted_at ON audio_files(deleted_at) WHERE deleted_at IS NULL;
```

**サンプルデータ**
```sql
INSERT INTO audio_files (
  job_id, 
  filename, 
  original_filename, 
  file_url, 
  file_size, 
  mime_type
) VALUES (
  1, 
  '550e8400-e29b-41d4-a716-446655440000.mp3',
  'teleapo_2025-10-24.mp3',
  'https://blob.vercel-storage.com/...',
  104857600,
  'audio/mpeg'
);
```

---

### 3.3 conversations テーブル

**目的**: 分割された個別の会話情報

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|---------|------|----------|-----|
| id | SERIAL | NOT NULL | auto | 会話ID（主キー） |
| audio_file_id | INTEGER | NOT NULL | - | 音声ファイルID（外部キー） |
| conversation_no | INTEGER | NOT NULL | - | 会話番号（1から連番） |
| start_time_sec | INTEGER | NOT NULL | - | 開始時間（秒） |
| end_time_sec | INTEGER | NOT NULL | - | 終了時間（秒） |
| duration_seconds | INTEGER | NOT NULL | - | 会話時間（秒） |
| transcript | TEXT | NOT NULL | - | 会話の文字起こし |
| speaker_info | JSONB | NULL | NULL | 話者情報（JSON） |
| created_at | TIMESTAMP | NOT NULL | NOW() | 作成日時 |

**制約**
- PRIMARY KEY: id
- FOREIGN KEY: audio_file_id REFERENCES audio_files(id) ON DELETE CASCADE
- UNIQUE: (audio_file_id, conversation_no)
- CHECK: start_time_sec >= 0
- CHECK: end_time_sec > start_time_sec
- CHECK: duration_seconds = end_time_sec - start_time_sec
- CHECK: conversation_no > 0

**インデックス**
```sql
CREATE INDEX idx_conversations_audio_file_id ON conversations(audio_file_id);
CREATE INDEX idx_conversations_audio_file_conversation 
  ON conversations(audio_file_id, conversation_no);
```

**speaker_info JSON構造**
```json
{
  "speakers": [
    {
      "speaker_id": 1,
      "label": "テレアポ担当者",
      "utterances": 15
    },
    {
      "speaker_id": 2,
      "label": "顧客",
      "utterances": 12
    }
  ]
}
```

**サンプルデータ**
```sql
INSERT INTO conversations (
  audio_file_id,
  conversation_no,
  start_time_sec,
  end_time_sec,
  duration_seconds,
  transcript,
  speaker_info
) VALUES (
  1,
  1,
  0,
  95,
  95,
  '[担当者] お世話になっております...',
  '{"speakers": [{"speaker_id": 1, "label": "テレアポ担当者", "utterances": 8}, {"speaker_id": 2, "label": "顧客", "utterances": 6}]}'::jsonb
);
```

---

### 3.4 analyses テーブル

**目的**: 会話の分析結果（成果判定・改善点）

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|---------|------|----------|-----|
| id | SERIAL | NOT NULL | auto | 分析ID（主キー） |
| conversation_id | INTEGER | NOT NULL | - | 会話ID（外部キー） |
| outcome | VARCHAR(50) | NOT NULL | - | 成果カテゴリ |
| confidence_score | DECIMAL(5,2) | NOT NULL | - | 信頼度スコア（0〜100） |
| outcome_reason | TEXT | NULL | NULL | 判定理由 |
| improvements | JSONB | NULL | NULL | 改善点データ（JSON） |
| created_at | TIMESTAMP | NOT NULL | NOW() | 作成日時 |

**制約**
- PRIMARY KEY: id
- FOREIGN KEY: conversation_id REFERENCES conversations(id) ON DELETE CASCADE
- UNIQUE: conversation_id（1会話に1分析）
- CHECK: outcome IN ('APPOINTMENT', 'DOCUMENT_SENT', 'CONTACT_SUCCESS', 'RECEPTION_FAILED')
- CHECK: confidence_score >= 0 AND confidence_score <= 100

**インデックス**
```sql
CREATE INDEX idx_analyses_conversation_id ON analyses(conversation_id);
CREATE INDEX idx_analyses_outcome ON analyses(outcome);
```

**improvements JSON構造**
```json
{
  "categories": [
    {
      "category": "冒頭トーク",
      "priority": "高",
      "problem": "「新規のご提案」という表現が警戒感を与えている可能性があります。",
      "suggestion": "具体的なメリットや業界実績を最初に伝えることで、興味を引きやすくなります。"
    },
    {
      "category": "反論処理",
      "priority": "中",
      "problem": "「そうですか」とすぐに引き下がってしまっています。",
      "suggestion": "「1分だけお時間いただけませんか」等、粘り強く対応することが重要です。"
    }
  ]
}
```

**サンプルデータ**
```sql
INSERT INTO analyses (
  conversation_id,
  outcome,
  confidence_score,
  outcome_reason,
  improvements
) VALUES (
  1,
  'RECEPTION_FAILED',
  85.50,
  '受付担当者が「そういったお電話はお断りしております」と明確に断っているため。',
  '{
    "categories": [
      {
        "category": "冒頭トーク",
        "priority": "高",
        "problem": "「新規のご提案」という表現が警戒感を与えている可能性があります。",
        "suggestion": "具体的なメリットや業界実績を最初に伝えることで、興味を引きやすくなります。"
      }
    ]
  }'::jsonb
);
```

---

## 4. ENUM定義

### 4.1 job_status（ジョブステータス）

| 値 | 説明 |
|----|-----|
| PENDING | 処理待ち |
| PROCESSING | 処理中 |
| COMPLETED | 完了 |
| FAILED | 失敗 |

### 4.2 outcome（成果カテゴリ）

| 値 | 説明 |
|----|-----|
| APPOINTMENT | アポ獲得 |
| DOCUMENT_SENT | 資料送付 |
| CONTACT_SUCCESS | 担当者接続 |
| RECEPTION_FAILED | 受付突破失敗 |

### 4.3 improvement_priority（改善優先度）

| 値 | 説明 |
|----|-----|
| 高 | 最優先で改善すべき |
| 中 | 改善が望ましい |
| 低 | 余裕があれば改善 |

### 4.4 improvement_category（改善カテゴリ）

| 値 | 説明 |
|----|-----|
| 冒頭トーク | 名乗り、挨拶、つかみ |
| ヒアリング | 顧客のニーズ聞き出し |
| 提案・訴求 | サービス説明、ベネフィット |
| 反論処理 | 断り文句への対応 |
| クロージング | アポや資料送付への誘導 |
| トーン・話し方 | 声のトーン、スピード、間 |
| その他 | 上記以外 |

---

## 5. ビュー定義

### 5.1 v_job_summary（ジョブサマリービュー）

**目的**: ジョブごとの集計情報を取得

```sql
CREATE VIEW v_job_summary AS
SELECT
  j.id AS job_id,
  j.status AS job_status,
  j.created_at AS job_created_at,
  af.id AS audio_file_id,
  af.original_filename,
  af.duration_seconds AS total_duration,
  COUNT(c.id) AS total_conversations,
  COUNT(CASE WHEN a.outcome = 'APPOINTMENT' THEN 1 END) AS appointment_count,
  COUNT(CASE WHEN a.outcome = 'DOCUMENT_SENT' THEN 1 END) AS document_sent_count,
  COUNT(CASE WHEN a.outcome = 'CONTACT_SUCCESS' THEN 1 END) AS contact_success_count,
  COUNT(CASE WHEN a.outcome = 'RECEPTION_FAILED' THEN 1 END) AS reception_failed_count,
  ROUND(
    (COUNT(CASE WHEN a.outcome IN ('APPOINTMENT', 'DOCUMENT_SENT', 'CONTACT_SUCCESS') THEN 1 END)::DECIMAL 
     / NULLIF(COUNT(c.id), 0)) * 100, 
    2
  ) AS success_rate
FROM jobs j
LEFT JOIN audio_files af ON j.id = af.job_id
LEFT JOIN conversations c ON af.id = c.audio_file_id
LEFT JOIN analyses a ON c.id = a.conversation_id
GROUP BY j.id, af.id;
```

**使用例**
```sql
SELECT * FROM v_job_summary WHERE job_status = 'COMPLETED' ORDER BY job_created_at DESC;
```

---

### 5.2 v_conversation_details（会話詳細ビュー）

**目的**: 会話の詳細情報を1つのビューで取得

```sql
CREATE VIEW v_conversation_details AS
SELECT
  c.id AS conversation_id,
  c.audio_file_id,
  c.conversation_no,
  c.start_time_sec,
  c.end_time_sec,
  c.duration_seconds,
  c.transcript,
  c.speaker_info,
  a.outcome,
  a.confidence_score,
  a.outcome_reason,
  a.improvements,
  af.original_filename,
  j.id AS job_id
FROM conversations c
LEFT JOIN analyses a ON c.id = a.conversation_id
INNER JOIN audio_files af ON c.audio_file_id = af.id
INNER JOIN jobs j ON af.job_id = j.id;
```

**使用例**
```sql
SELECT * FROM v_conversation_details 
WHERE audio_file_id = 1 AND outcome = 'RECEPTION_FAILED'
ORDER BY conversation_no;
```

---

## 6. 関数・トリガー

### 6.1 update_updated_at() 関数

**目的**: updated_atを自動更新

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**トリガー設定**
```sql
CREATE TRIGGER trigger_jobs_updated_at
BEFORE UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
```

---

### 6.2 soft_delete_old_audio_files() 関数

**目的**: 24時間経過した音声ファイルを論理削除

```sql
CREATE OR REPLACE FUNCTION soft_delete_old_audio_files()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  UPDATE audio_files
  SET deleted_at = NOW()
  WHERE deleted_at IS NULL
    AND created_at < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
```

**Cronジョブ設定（Supabase）**
```sql
SELECT cron.schedule(
  'soft-delete-old-audio-files',
  '0 * * * *', -- 毎時0分に実行
  $$SELECT soft_delete_old_audio_files();$$
);
```

---

## 7. パフォーマンス最適化

### 7.1 インデックス戦略

| テーブル | カラム | 理由 |
|---------|-------|-----|
| jobs | status | ステータスによるフィルタが頻繁 |
| jobs | created_at | 作成日時の降順ソートが頻繁 |
| audio_files | job_id | ジョブとのJOINが頻繁 |
| audio_files | deleted_at | 削除されていないファイルの絞り込み |
| conversations | audio_file_id | 音声ファイルとのJOINが頻繁 |
| conversations | (audio_file_id, conversation_no) | 会話番号での検索が頻繁 |
| analyses | conversation_id | 会話とのJOINが頻繁 |
| analyses | outcome | 成果カテゴリでのフィルタが頻繁 |

### 7.2 パーティショニング（将来的に検討）

大量データになった場合、audio_filesテーブルをcreated_atでパーティショニング

```sql
-- 月次パーティショニング例
CREATE TABLE audio_files_2025_10 PARTITION OF audio_files
FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');
```

---

## 8. データ移行

### 8.1 初期マイグレーション（DDL）

```sql
-- テーブル作成
CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  error_message TEXT NULL
);

CREATE TABLE audio_files (
  id SERIAL PRIMARY KEY,
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL CHECK (file_size > 0),
  duration_seconds INTEGER NULL CHECK (duration_seconds IS NULL OR duration_seconds > 0),
  mime_type VARCHAR(50) NOT NULL,
  transcript TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  audio_file_id INTEGER NOT NULL REFERENCES audio_files(id) ON DELETE CASCADE,
  conversation_no INTEGER NOT NULL CHECK (conversation_no > 0),
  start_time_sec INTEGER NOT NULL CHECK (start_time_sec >= 0),
  end_time_sec INTEGER NOT NULL,
  duration_seconds INTEGER NOT NULL,
  transcript TEXT NOT NULL,
  speaker_info JSONB NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (audio_file_id, conversation_no),
  CHECK (end_time_sec > start_time_sec),
  CHECK (duration_seconds = end_time_sec - start_time_sec)
);

CREATE TABLE analyses (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL UNIQUE REFERENCES conversations(id) ON DELETE CASCADE,
  outcome VARCHAR(50) NOT NULL CHECK (outcome IN ('APPOINTMENT', 'DOCUMENT_SENT', 'CONTACT_SUCCESS', 'RECEPTION_FAILED')),
  confidence_score DECIMAL(5,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  outcome_reason TEXT NULL,
  improvements JSONB NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_audio_files_job_id ON audio_files(job_id);
CREATE INDEX idx_audio_files_created_at ON audio_files(created_at DESC);
CREATE INDEX idx_audio_files_deleted_at ON audio_files(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_conversations_audio_file_id ON conversations(audio_file_id);
CREATE INDEX idx_conversations_audio_file_conversation ON conversations(audio_file_id, conversation_no);
CREATE INDEX idx_analyses_conversation_id ON analyses(conversation_id);
CREATE INDEX idx_analyses_outcome ON analyses(outcome);

-- トリガー作成
CREATE TRIGGER trigger_jobs_updated_at
BEFORE UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
```

---

## 9. バックアップ・リカバリ

### 9.1 バックアップ戦略

| 種別 | 頻度 | 保持期間 | 方法 |
|-----|------|---------|-----|
| 自動バックアップ | 日次 | 7日間 | Supabase標準機能 |
| 手動バックアップ | 週次 | 30日間 | pg_dump |

### 9.2 リカバリ手順

1. Supabaseダッシュボードからバックアップ一覧を確認
2. リストア対象のバックアップを選択
3. リストア実行
4. アプリケーションの動作確認

---

## 10. セキュリティ

### 10.1 Row Level Security（RLS）

将来的にマルチテナント対応する場合、Supabase RLSを使用

```sql
-- 例：ユーザーごとにデータを分離
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY jobs_select_policy ON jobs
FOR SELECT
USING (auth.uid() = user_id);
```

### 10.2 データ暗号化

- **転送時**: SSL/TLS（Supabase標準）
- **保存時**: ディスク暗号化（Supabase標準）
- **機密情報**: PII（個人情報）は音声ファイル削除により最小化

---

## 11. 変更履歴

| バージョン | 日付 | 変更内容 | 担当者 |
|-----------|------|---------|-------|
| 1.0 | 2025-10-24 | 初版作成 | Kaisei Yamaguchi |

---

**以上**

