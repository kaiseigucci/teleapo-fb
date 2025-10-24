# API設計書：テレアポFB君

**バージョン**: 1.0  
**作成日**: 2025年10月24日  
**最終更新日**: 2025年10月24日

---

## 1. API概要

### 1.1 ベースURL
- **開発環境**: `http://localhost:3000/api`
- **本番環境**: `https://teleapo-fb.vercel.app/api`

### 1.2 認証
MVP段階では認証なし（将来的にJWT認証を実装）

### 1.3 レスポンス形式
すべてのAPIレスポンスはJSON形式

### 1.4 共通エラーレスポンス

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ",
    "details": {}
  }
}
```

---

## 2. エンドポイント一覧

| メソッド | パス | 説明 | 優先度 |
|---------|------|-----|-------|
| POST | /api/upload | 音声ファイルアップロード | P0 |
| GET | /api/jobs | ジョブ一覧取得 | P0 |
| GET | /api/jobs/:id | ジョブ詳細取得 | P0 |
| GET | /api/audio-files | 音声ファイル一覧 | P0 |
| GET | /api/audio-files/:id | 音声ファイル詳細 | P0 |
| GET | /api/audio-files/:id/conversations | 会話一覧 | P0 |
| GET | /api/conversations/:id | 会話詳細 | P0 |
| GET | /api/conversations/:id/analysis | 会話の分析結果 | P0 |
| DELETE | /api/audio-files/:id | 音声ファイル削除 | P1 |

---

## 3. エンドポイント詳細

### 3.1 POST /api/upload

**概要**: 音声ファイルをアップロードし、分析ジョブを作成する

**リクエスト**

```http
POST /api/upload
Content-Type: multipart/form-data

file: (binary)
```

**リクエストパラメータ**

| パラメータ | 型 | 必須 | 説明 |
|-----------|---|-----|-----|
| file | File | ✓ | 音声ファイル（MP3, WAV, M4A） |

**バリデーション**
- ファイルサイズ: 最大1GB
- ファイル形式: audio/mpeg, audio/wav, audio/m4a
- ファイル名: 255文字以内

**レスポンス（成功）**

```json
{
  "success": true,
  "data": {
    "jobId": 1,
    "audioFileId": 1,
    "filename": "550e8400-e29b-41d4-a716-446655440000.mp3",
    "originalFilename": "teleapo_2025-10-24.mp3",
    "fileSize": 104857600,
    "status": "PENDING",
    "createdAt": "2025-10-24T10:00:00Z"
  }
}
```

**レスポンス（エラー）**

```json
{
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "ファイルサイズが1GBを超えています",
    "details": {
      "maxSize": 1073741824,
      "actualSize": 1200000000
    }
  }
}
```

**ステータスコード**
- `200`: 成功
- `400`: バリデーションエラー
- `413`: ファイルサイズ超過
- `500`: サーバーエラー

---

### 3.2 GET /api/jobs

**概要**: ジョブの一覧を取得する

**リクエスト**

```http
GET /api/jobs?status=COMPLETED&limit=10&offset=0
```

**クエリパラメータ**

| パラメータ | 型 | 必須 | デフォルト | 説明 |
|-----------|---|-----|----------|-----|
| status | string | - | - | ジョブステータス（PENDING, PROCESSING, COMPLETED, FAILED） |
| limit | number | - | 20 | 取得件数（最大100） |
| offset | number | - | 0 | オフセット |

**レスポンス（成功）**

```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": 1,
        "status": "COMPLETED",
        "createdAt": "2025-10-24T10:00:00Z",
        "updatedAt": "2025-10-24T10:15:00Z",
        "audioFile": {
          "id": 1,
          "originalFilename": "teleapo_2025-10-24.mp3",
          "duration": 10800,
          "conversationCount": 45
        }
      }
    ],
    "pagination": {
      "total": 100,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

**ステータスコード**
- `200`: 成功
- `400`: パラメータエラー
- `500`: サーバーエラー

---

### 3.3 GET /api/jobs/:id

**概要**: ジョブの詳細を取得する

**リクエスト**

```http
GET /api/jobs/1
```

**パスパラメータ**

| パラメータ | 型 | 説明 |
|-----------|---|-----|
| id | number | ジョブID |

**レスポンス（成功）**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "COMPLETED",
    "createdAt": "2025-10-24T10:00:00Z",
    "updatedAt": "2025-10-24T10:15:00Z",
    "errorMessage": null,
    "audioFile": {
      "id": 1,
      "filename": "550e8400-e29b-41d4-a716-446655440000.mp3",
      "originalFilename": "teleapo_2025-10-24.mp3",
      "fileSize": 104857600,
      "duration": 10800,
      "mimeType": "audio/mpeg",
      "createdAt": "2025-10-24T10:00:00Z"
    },
    "progress": {
      "totalSteps": 4,
      "completedSteps": 4,
      "currentStep": "完了",
      "percentage": 100
    }
  }
}
```

**ステータスコード**
- `200`: 成功
- `404`: ジョブが見つからない
- `500`: サーバーエラー

---

### 3.4 GET /api/audio-files

**概要**: 音声ファイルの一覧を取得する

**リクエスト**

```http
GET /api/audio-files?limit=10&offset=0
```

**クエリパラメータ**

| パラメータ | 型 | 必須 | デフォルト | 説明 |
|-----------|---|-----|----------|-----|
| limit | number | - | 20 | 取得件数（最大100） |
| offset | number | - | 0 | オフセット |

**レスポンス（成功）**

```json
{
  "success": true,
  "data": {
    "audioFiles": [
      {
        "id": 1,
        "originalFilename": "teleapo_2025-10-24.mp3",
        "duration": 10800,
        "createdAt": "2025-10-24T10:00:00Z",
        "job": {
          "id": 1,
          "status": "COMPLETED"
        },
        "summary": {
          "totalConversations": 45,
          "appointmentCount": 3,
          "documentSentCount": 8,
          "contactSuccessCount": 12,
          "receptionFailedCount": 22,
          "successRate": 51.11
        }
      }
    ],
    "pagination": {
      "total": 50,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

**ステータスコード**
- `200`: 成功
- `400`: パラメータエラー
- `500`: サーバーエラー

---

### 3.5 GET /api/audio-files/:id

**概要**: 音声ファイルの詳細を取得する

**リクエスト**

```http
GET /api/audio-files/1
```

**パスパラメータ**

| パラメータ | 型 | 説明 |
|-----------|---|-----|
| id | number | 音声ファイルID |

**レスポンス（成功）**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "filename": "550e8400-e29b-41d4-a716-446655440000.mp3",
    "originalFilename": "teleapo_2025-10-24.mp3",
    "fileUrl": "https://blob.vercel-storage.com/...",
    "fileSize": 104857600,
    "duration": 10800,
    "mimeType": "audio/mpeg",
    "transcript": "全文字起こしテキスト...",
    "createdAt": "2025-10-24T10:00:00Z",
    "deletedAt": null,
    "job": {
      "id": 1,
      "status": "COMPLETED"
    },
    "summary": {
      "totalConversations": 45,
      "appointmentCount": 3,
      "documentSentCount": 8,
      "contactSuccessCount": 12,
      "receptionFailedCount": 22,
      "successRate": 51.11
    }
  }
}
```

**ステータスコード**
- `200`: 成功
- `404`: 音声ファイルが見つからない
- `500`: サーバーエラー

---

### 3.6 GET /api/audio-files/:id/conversations

**概要**: 音声ファイルに紐づく会話一覧を取得する

**リクエスト**

```http
GET /api/audio-files/1/conversations?outcome=RECEPTION_FAILED&limit=10&offset=0
```

**パスパラメータ**

| パラメータ | 型 | 説明 |
|-----------|---|-----|
| id | number | 音声ファイルID |

**クエリパラメータ**

| パラメータ | 型 | 必須 | デフォルト | 説明 |
|-----------|---|-----|----------|-----|
| outcome | string | - | - | 成果カテゴリ（APPOINTMENT, DOCUMENT_SENT, CONTACT_SUCCESS, RECEPTION_FAILED） |
| limit | number | - | 20 | 取得件数（最大100） |
| offset | number | - | 0 | オフセット |

**レスポンス（成功）**

```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": 1,
        "conversationNo": 1,
        "startTime": 0,
        "endTime": 95,
        "duration": 95,
        "transcript": "[担当者] お世話になっております...",
        "analysis": {
          "outcome": "APPOINTMENT",
          "confidenceScore": 92.5,
          "hasImprovements": false
        }
      },
      {
        "id": 2,
        "conversationNo": 2,
        "startTime": 222,
        "endTime": 318,
        "duration": 96,
        "transcript": "[担当者] お世話になっております...",
        "analysis": {
          "outcome": "RECEPTION_FAILED",
          "confidenceScore": 85.5,
          "hasImprovements": true
        }
      }
    ],
    "pagination": {
      "total": 45,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

**ステータスコード**
- `200`: 成功
- `404`: 音声ファイルが見つからない
- `400`: パラメータエラー
- `500`: サーバーエラー

---

### 3.7 GET /api/conversations/:id

**概要**: 会話の詳細を取得する

**リクエスト**

```http
GET /api/conversations/1
```

**パスパラメータ**

| パラメータ | 型 | 説明 |
|-----------|---|-----|
| id | number | 会話ID |

**レスポンス（成功）**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "audioFileId": 1,
    "conversationNo": 1,
    "startTime": 0,
    "endTime": 95,
    "duration": 95,
    "transcript": "[担当者] お世話になっております。株式会社〇〇の山田と申します。\n[顧客] はい。\n[担当者] ...",
    "speakerInfo": {
      "speakers": [
        {
          "speakerId": 1,
          "label": "テレアポ担当者",
          "utterances": 8
        },
        {
          "speakerId": 2,
          "label": "顧客",
          "utterances": 6
        }
      ]
    },
    "createdAt": "2025-10-24T10:10:00Z",
    "audioFile": {
      "id": 1,
      "originalFilename": "teleapo_2025-10-24.mp3"
    }
  }
}
```

**ステータスコード**
- `200`: 成功
- `404`: 会話が見つからない
- `500`: サーバーエラー

---

### 3.8 GET /api/conversations/:id/analysis

**概要**: 会話の分析結果を取得する

**リクエスト**

```http
GET /api/conversations/2/analysis
```

**パスパラメータ**

| パラメータ | 型 | 説明 |
|-----------|---|-----|
| id | number | 会話ID |

**レスポンス（成功）**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "conversationId": 2,
    "outcome": "RECEPTION_FAILED",
    "confidenceScore": 85.5,
    "outcomeReason": "受付担当者が「そういったお電話はお断りしております」と明確に断っているため。",
    "improvements": {
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
    },
    "createdAt": "2025-10-24T10:12:00Z"
  }
}
```

**レスポンス（分析結果がない場合）**

```json
{
  "success": true,
  "data": null
}
```

**ステータスコード**
- `200`: 成功
- `404`: 会話が見つからない
- `500`: サーバーエラー

---

### 3.9 DELETE /api/audio-files/:id

**概要**: 音声ファイルを削除する（論理削除）

**リクエスト**

```http
DELETE /api/audio-files/1
```

**パスパラメータ**

| パラメータ | 型 | 説明 |
|-----------|---|-----|
| id | number | 音声ファイルID |

**レスポンス（成功）**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "deletedAt": "2025-10-24T15:00:00Z"
  }
}
```

**ステータスコード**
- `200`: 成功
- `404`: 音声ファイルが見つからない
- `500`: サーバーエラー

---

## 4. エラーコード一覧

| エラーコード | HTTPステータス | 説明 |
|------------|--------------|-----|
| INVALID_FILE_TYPE | 400 | サポートされていないファイル形式 |
| FILE_TOO_LARGE | 413 | ファイルサイズが制限を超過 |
| MISSING_FILE | 400 | ファイルが指定されていない |
| INVALID_PARAMETERS | 400 | パラメータが不正 |
| NOT_FOUND | 404 | リソースが見つからない |
| JOB_NOT_FOUND | 404 | ジョブが見つからない |
| AUDIO_FILE_NOT_FOUND | 404 | 音声ファイルが見つからない |
| CONVERSATION_NOT_FOUND | 404 | 会話が見つからない |
| UPLOAD_FAILED | 500 | アップロード失敗 |
| TRANSCRIPTION_FAILED | 500 | 文字起こし失敗 |
| ANALYSIS_FAILED | 500 | 分析失敗 |
| INTERNAL_SERVER_ERROR | 500 | サーバー内部エラー |
| DATABASE_ERROR | 500 | データベースエラー |
| EXTERNAL_API_ERROR | 500 | 外部API呼び出しエラー |

---

## 5. レート制限

MVP段階ではレート制限なし（将来的に実装）

---

## 6. Webhooks（将来実装）

ジョブの完了時に外部URLに通知する機能（Phase 2で実装予定）

---

## 7. 変更履歴

| バージョン | 日付 | 変更内容 | 担当者 |
|-----------|------|---------|-------|
| 1.0 | 2025-10-24 | 初版作成 | Kaisei Yamaguchi |

---

**以上**

