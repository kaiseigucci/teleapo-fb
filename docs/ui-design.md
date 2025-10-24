# UI設計書：テレアポFB君

**バージョン**: 1.0  
**作成日**: 2025年10月24日  
**最終更新日**: 2025年10月24日

---

## 1. UI設計概要

### 1.1 デザインシステム

#### カラーパレット

**プライマリカラー**
- `primary`: hsl(221.2, 83.2%, 53.3%) - #3B82F6（青）
- `primary-foreground`: hsl(210, 40%, 98%) - #F8FAFC（白）

**セカンダリカラー**
- `secondary`: hsl(210, 40%, 96.1%) - #F1F5F9（淡い青灰色）
- `secondary-foreground`: hsl(222.2, 47.4%, 11.2%) - #1E293B（濃い青灰色）

**ステータスカラー**
- `success`: hsl(142, 76%, 36%) - #10B981（緑：アポ獲得、完了）
- `warning`: hsl(38, 92%, 50%) - #F59E0B（オレンジ：資料送付、処理中）
- `info`: hsl(199, 89%, 48%) - #3B82F6（青：担当者接続）
- `error`: hsl(0, 84%, 60%) - #EF4444（赤：受付突破失敗、エラー）
- `muted`: hsl(210, 40%, 96.1%) - #F1F5F9（グレー：処理待ち）

**背景カラー**
- `background`: hsl(0, 0%, 100%) - #FFFFFF（白）
- `card`: hsl(0, 0%, 100%) - #FFFFFF（白）
- `muted`: hsl(210, 40%, 96.1%) - #F1F5F9（淡いグレー）

**境界線・文字色**
- `border`: hsl(214.3, 31.8%, 91.4%) - #E2E8F0（境界線）
- `foreground`: hsl(222.2, 47.4%, 11.2%) - #1E293B（メインテキスト）
- `muted-foreground`: hsl(215.4, 16.3%, 46.9%) - #64748B（サブテキスト）

#### タイポグラフィ

**フォントファミリー**
```css
font-family: 'Inter', 'Noto Sans JP', system-ui, -apple-system, sans-serif;
```

**フォントサイズ**
- `text-xs`: 0.75rem (12px)
- `text-sm`: 0.875rem (14px)
- `text-base`: 1rem (16px)
- `text-lg`: 1.125rem (18px)
- `text-xl`: 1.25rem (20px)
- `text-2xl`: 1.5rem (24px)
- `text-3xl`: 1.875rem (30px)
- `text-4xl`: 2.25rem (36px)

**フォントウェイト**
- `font-normal`: 400
- `font-medium`: 500
- `font-semibold`: 600
- `font-bold`: 700

#### スペーシング

**基本単位**: 4px（0.25rem）

- `space-1`: 0.25rem (4px)
- `space-2`: 0.5rem (8px)
- `space-3`: 0.75rem (12px)
- `space-4`: 1rem (16px)
- `space-6`: 1.5rem (24px)
- `space-8`: 2rem (32px)
- `space-12`: 3rem (48px)
- `space-16`: 4rem (64px)

#### 角丸（Border Radius）

- `rounded-sm`: 0.125rem (2px)
- `rounded`: 0.25rem (4px)
- `rounded-md`: 0.375rem (6px)
- `rounded-lg`: 0.5rem (8px)
- `rounded-xl`: 0.75rem (12px)

#### シャドウ

- `shadow-sm`: 0 1px 2px 0 rgb(0 0 0 / 0.05)
- `shadow`: 0 1px 3px 0 rgb(0 0 0 / 0.1)
- `shadow-md`: 0 4px 6px -1px rgb(0 0 0 / 0.1)
- `shadow-lg`: 0 10px 15px -3px rgb(0 0 0 / 0.1)

### 1.2 コンポーネントライブラリ

**Shadcn/ui採用コンポーネント**

| コンポーネント | 用途 |
|--------------|------|
| Button | アクション、送信ボタン |
| Card | コンテンツカード、サマリー表示 |
| Badge | ステータス表示、カテゴリラベル |
| Table | 会話一覧、データ表示 |
| Tabs | タブ切り替え |
| Dialog | モーダルダイアログ |
| Select | ドロップダウン選択 |
| Progress | プログレスバー |
| Skeleton | ローディング状態 |
| Toast | 通知メッセージ |
| Separator | セクション区切り線 |
| ScrollArea | スクロール可能なエリア |

### 1.3 レスポンシブブレークポイント

| ブレークポイント | サイズ | 用途 |
|----------------|-------|------|
| `sm` | 640px | スマートフォン（縦） |
| `md` | 768px | タブレット（縦） |
| `lg` | 1024px | タブレット（横）、小型ノートPC |
| `xl` | 1280px | デスクトップ |
| `2xl` | 1536px | 大型ディスプレイ |

**対応方針**
- **優先**: デスクトップファースト（業務用途のため）
- **最小対応**: md (768px) 以上
- **推奨**: lg (1024px) 以上

---

## 2. 画面設計

### 2.1 画面一覧

| 画面ID | 画面名 | パス | 優先度 |
|-------|-------|------|-------|
| SC01 | ダッシュボード画面 | `/` | P0 |
| SC02 | 音声アップロードモーダル | `/` (Modal) | P0 |
| SC03 | 分析結果詳細画面 | `/analysis/[id]` | P0 |
| SC04 | 会話詳細画面 | `/conversations/[id]` | P0 |
| SC05 | 履歴一覧画面 | `/history` | P1 |

### 2.2 画面遷移図

```
┌─────────────────────────────────────────────────────┐
│                  SC01: ダッシュボード                 │
│                      (/)                             │
│                                                       │
│  - 分析済みファイル一覧                               │
│  - サマリーカード                                     │
│  - [アップロード] ボタン                              │
└─────────────────────────────────────────────────────┘
         │                           │
         │ クリック                   │ ファイル選択
         ↓                           ↓
┌─────────────────────┐    ┌─────────────────────────┐
│  SC02: アップロード   │    │  SC03: 分析結果詳細      │
│       モーダル        │    │  (/analysis/[id])       │
│                      │    │                         │
│  - ファイル選択       │    │  - サマリー統計          │
│  - ドラッグ&ドロップ  │    │  - 会話一覧              │
│  - アップロード実行   │    │  - フィルタリング        │
└─────────────────────┘    └─────────────────────────┘
         │                           │
         │ アップロード完了            │ 会話選択
         ↓                           ↓
┌─────────────────────────────────────────────────────┐
│               SC01: ダッシュボード                    │
│               (処理中表示)                           │
└─────────────────────────────────────────────────────┘
                                      │
                                      │
                                      ↓
                            ┌─────────────────────────┐
                            │  SC04: 会話詳細         │
                            │  (/conversations/[id])  │
                            │                         │
                            │  - 会話内容              │
                            │  - 成果判定              │
                            │  - 改善点分析            │
                            └─────────────────────────┘
```

---

## 3. 画面詳細設計

### 3.1 SC01: ダッシュボード画面

#### 3.1.1 画面概要

**目的**: 分析済み音声ファイルの一覧表示と新規アップロード

**URL**: `/`

**アクセス権限**: 全ユーザー（MVP: 認証なし）

#### 3.1.2 レイアウト構成

```
┌────────────────────────────────────────────────────────────┐
│  Header (高さ: 64px)                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 📱 テレアポFB君            [+ 音声をアップロード]     │  │
│  └──────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────┤
│  Main Content (padding: 32px)                               │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 📊 分析済みファイル一覧                               │  │
│  │                                                        │  │
│  │ ┌──────────────────────────────────────────────────┐ │  │
│  │ │ [最新] 2025-10-24_teleapo.mp3        ✅ 分析完了  │ │  │
│  │ │                                                    │ │  │
│  │ │ 📅 2025-10-24 14:30 | ⏱️ 3時間12分               │ │  │
│  │ │                                                    │ │  │
│  │ │ ┌────────────┬────────────┬────────────┬──────┐  │ │  │
│  │ │ │ 総会話数    │ アポ獲得   │ 資料送付   │ 成功率│  │ │  │
│  │ │ │    45件    │   3件(7%)  │  8件(18%)  │ 51%  │  │ │  │
│  │ │ │            │            │            │      │  │ │  │
│  │ │ │ 担当者接続  │ 受付失敗   │            │      │  │ │  │
│  │ │ │ 12件(27%)  │ 22件(49%)  │            │      │  │ │  │
│  │ │ └────────────┴────────────┴────────────┴──────┘  │ │  │
│  │ │                                                    │ │  │
│  │ │                                    [詳細を見る →] │ │  │
│  │ └──────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  │ ┌──────────────────────────────────────────────────┐ │  │
│  │ │ [処理中] 2025-10-23_teleapo.mp3      ⏳ 分析中    │ │  │
│  │ │                                                    │ │  │
│  │ │ 📅 2025-10-23 18:45 | ⏱️ 2時間48分               │ │  │
│  │ │                                                    │ │  │
│  │ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 65%         │ │  │
│  │ │                                                    │ │  │
│  │ │ 処理中... (音声認識完了、会話分割中)               │ │  │
│  │ └──────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  │ ┌──────────────────────────────────────────────────┐ │  │
│  │ │ 2025-10-22_teleapo.mp3               ✅ 分析完了  │ │  │
│  │ │                                                    │ │  │
│  │ │ 📅 2025-10-22 10:15 | ⏱️ 2時間56分               │ │  │
│  │ │                                                    │ │  │
│  │ │ ┌────────────┬────────────┬────────────┬──────┐  │ │  │
│  │ │ │ 総会話数    │ アポ獲得   │ 資料送付   │ 成功率│  │ │  │
│  │ │ │    38件    │   5件(13%) │  6件(16%)  │ 55%  │  │ │  │
│  │ │ └────────────┴────────────┴────────────┴──────┘  │ │  │
│  │ │                                                    │ │  │
│  │ │                                    [詳細を見る →] │ │  │
│  │ └──────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

#### 3.1.3 コンポーネント構成

```tsx
<DashboardPage>
  <Header>
    <Logo />
    <UploadButton onClick={openUploadModal} />
  </Header>
  
  <MainContent>
    <SectionTitle>📊 分析済みファイル一覧</SectionTitle>
    
    {jobs.map((job) => (
      <JobCard key={job.id} job={job}>
        {job.status === 'COMPLETED' ? (
          <CompletedJobContent>
            <JobMetadata />
            <SummaryGrid />
            <ViewDetailsButton />
          </CompletedJobContent>
        ) : (
          <ProcessingJobContent>
            <JobMetadata />
            <ProgressBar />
            <StatusMessage />
          </ProcessingJobContent>
        )}
      </JobCard>
    ))}
  </MainContent>
  
  <UploadModal isOpen={isModalOpen} onClose={closeModal} />
</DashboardPage>
```

#### 3.1.4 データ構造

**取得API**: `GET /api/jobs`

**レスポンス**:
```typescript
interface DashboardJob {
  id: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string; // ISO 8601
  updatedAt: string;
  errorMessage?: string;
  audioFile?: {
    id: number;
    originalFilename: string;
    durationSeconds: number;
    summary?: {
      totalConversations: number;
      appointmentCount: number;
      documentSentCount: number;
      contactSuccessCount: number;
      receptionFailedCount: number;
      successRate: number; // 0-100
    };
  };
  progress?: {
    percentage: number; // 0-100
    currentStep: string;
  };
}
```

#### 3.1.5 状態管理

```typescript
interface DashboardState {
  jobs: DashboardJob[];
  isLoading: boolean;
  error: string | null;
  isUploadModalOpen: boolean;
  
  // Actions
  fetchJobs: () => Promise<void>;
  openUploadModal: () => void;
  closeUploadModal: () => void;
  refreshJob: (jobId: number) => Promise<void>;
}
```

#### 3.1.6 インタラクション

| 要素 | イベント | アクション |
|-----|---------|----------|
| [アップロード] ボタン | クリック | アップロードモーダルを開く |
| [詳細を見る] ボタン | クリック | `/analysis/[id]` に遷移 |
| ジョブカード（処理中） | 5秒ごと | 自動リフレッシュ（ポーリング） |

#### 3.1.7 UI要素詳細

**ヘッダー**
- 高さ: 64px
- 背景: `bg-white`
- ボーダー: `border-b border-gray-200`
- パディング: `px-8 py-4`
- ロゴ: テキストロゴ + アイコン（📱）
- ボタン: `Button` コンポーネント（primary variant）

**ジョブカード（完了）**
- コンポーネント: `Card`
- パディング: `p-6`
- シャドウ: `shadow-md`
- ボーダー: `border border-gray-200`
- マージン: `mb-6`
- 角丸: `rounded-lg`

**ジョブカード（処理中）**
- 背景: `bg-blue-50`（淡い青）
- ボーダー: `border border-blue-200`
- アニメーション: パルス効果

**サマリーグリッド**
- グリッド: 4列（デスクトップ）、2列（タブレット）
- 各セル: 数値 + ラベル + パーセンテージ
- アイコン: ステータスに応じた絵文字またはアイコン

**成功率表示**
- 大きなフォント: `text-3xl font-bold`
- カラー: 
  - 60%以上: `text-green-600`
  - 40-60%: `text-yellow-600`
  - 40%未満: `text-red-600`

**プログレスバー**
- コンポーネント: `Progress`
- 高さ: 8px
- カラー: `bg-blue-600`
- アニメーション: インディケータ

---

### 3.2 SC02: 音声アップロードモーダル

#### 3.2.1 画面概要

**目的**: 音声ファイルのアップロードとバリデーション

**表示方法**: モーダルダイアログ

#### 3.2.2 レイアウト構成

```
┌────────────────────────────────────────────────────┐
│  音声ファイルをアップロード                    [✕]  │
├────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │                                                │ │
│  │          🎤                                    │ │
│  │                                                │ │
│  │    ファイルをドラッグ&ドロップ                  │ │
│  │           または                                │ │
│  │      [ファイルを選択]                           │ │
│  │                                                │ │
│  │  対応形式: MP3, WAV, M4A                       │ │
│  │  最大サイズ: 1GB                               │ │
│  │  最大録音時間: 3時間                            │ │
│  │                                                │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  【ファイル選択後】                                  │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ 📁 2025-10-24_teleapo.mp3                      │ │
│  │    サイズ: 256.4 MB | 時間: 3時間12分          │ │
│  │                                          [削除] │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ ℹ️ アップロード後、自動で分析を開始します。      │ │
│  │   分析には5〜10分程度かかります。               │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│                        [キャンセル]  [アップロード] │
└────────────────────────────────────────────────────┘

【アップロード中】

┌────────────────────────────────────────────────────┐
│  音声ファイルをアップロード中...              [✕]  │
├────────────────────────────────────────────────────┤
│                                                     │
│  📁 2025-10-24_teleapo.mp3                         │
│                                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 45%    │
│                                                     │
│  アップロード中... (115.4 MB / 256.4 MB)           │
│                                                     │
│  ⚠️ この画面を閉じないでください                    │
│                                                     │
└────────────────────────────────────────────────────┘
```

#### 3.2.3 コンポーネント構成

```tsx
<Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>音声ファイルをアップロード</DialogTitle>
    </DialogHeader>
    
    {!selectedFile ? (
      <DropZone
        onFileDrop={handleFileDrop}
        onFileSelect={handleFileSelect}
        acceptedFormats={['audio/mpeg', 'audio/wav', 'audio/m4a']}
        maxSize={1024 * 1024 * 1024} // 1GB
      >
        <DropZoneIcon />
        <DropZoneText />
        <SelectFileButton />
        <FormatInfo />
      </DropZone>
    ) : (
      <SelectedFileInfo>
        <FileIcon />
        <FileName />
        <FileMetadata />
        <RemoveButton />
      </SelectedFileInfo>
    )}
    
    {uploadProgress ? (
      <UploadProgress>
        <Progress value={uploadProgress.percentage} />
        <ProgressText />
        <WarningMessage />
      </UploadProgress>
    ) : (
      <InfoMessage />
    )}
    
    <DialogFooter>
      <Button variant="outline" onClick={onClose}>
        キャンセル
      </Button>
      <Button 
        onClick={handleUpload} 
        disabled={!selectedFile || isUploading}
      >
        {isUploading ? 'アップロード中...' : 'アップロード'}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### 3.2.4 データ構造

**アップロードAPI**: `POST /api/upload`

**リクエスト**:
```typescript
// FormData
interface UploadRequest {
  file: File; // audio file
}
```

**レスポンス**:
```typescript
interface UploadResponse {
  success: boolean;
  jobId: number;
  audioFileId: number;
  message: string;
}
```

#### 3.2.5 状態管理

```typescript
interface UploadModalState {
  isOpen: boolean;
  selectedFile: File | null;
  uploadProgress: {
    percentage: number;
    bytesUploaded: number;
    totalBytes: number;
  } | null;
  isUploading: boolean;
  error: string | null;
  
  // Actions
  open: () => void;
  close: () => void;
  selectFile: (file: File) => void;
  removeFile: () => void;
  upload: () => Promise<void>;
}
```

#### 3.2.6 バリデーション

| 項目 | 検証内容 | エラーメッセージ |
|-----|---------|----------------|
| ファイル形式 | MP3, WAV, M4A | 対応していないファイル形式です |
| ファイルサイズ | 1GB以下 | ファイルサイズが大きすぎます（最大1GB） |
| MIMEタイプ | audio/* | 音声ファイルを選択してください |

#### 3.2.7 インタラクション

| 要素 | イベント | アクション |
|-----|---------|----------|
| ドロップゾーン | ファイルドロップ | ファイル選択 + バリデーション |
| [ファイルを選択] | クリック | ファイル選択ダイアログを開く |
| [削除] | クリック | 選択したファイルをクリア |
| [アップロード] | クリック | アップロード実行 |
| アップロード完了 | - | モーダルを閉じる + ダッシュボードをリフレッシュ |

#### 3.2.8 UI要素詳細

**モーダル**
- コンポーネント: `Dialog`
- 幅: `max-w-2xl`
- 背景オーバーレイ: 半透明黒（`bg-black/50`）
- 角丸: `rounded-lg`

**ドロップゾーン**
- 高さ: 256px
- ボーダー: `border-2 border-dashed border-gray-300`
- ホバー: `border-blue-500 bg-blue-50`
- ドラッグオーバー: `border-blue-600 bg-blue-100`

**ファイル情報カード**
- 背景: `bg-gray-50`
- パディング: `p-4`
- ボーダー: `border border-gray-200`
- 角丸: `rounded-md`

**プログレスバー**
- 高さ: 12px
- カラー: `bg-blue-600`
- 背景: `bg-gray-200`

---

### 3.3 SC03: 分析結果詳細画面

#### 3.3.1 画面概要

**目的**: 1つの音声ファイルの分析結果詳細と会話一覧の表示

**URL**: `/analysis/[id]`（idはaudio_file_id）

#### 3.3.2 レイアウト構成

```
┌────────────────────────────────────────────────────────────┐
│  Header                                                     │
│  [← 戻る]  2025-10-24_teleapo.mp3                          │
└────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────┐
│  サマリーセクション                                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 📈 分析サマリー                                       │  │
│  │                                                        │  │
│  │  📅 分析日時: 2025-10-24 14:30                        │  │
│  │  ⏱️ 総録音時間: 3時間12分                             │  │
│  │  💬 総会話数: 45件                                    │  │
│  │                                                        │  │
│  │  ┌──────────┬──────────┬──────────┬──────────┐      │  │
│  │  │ ✅ アポ獲得│ 📄 資料送付│ 📞 担当者接続│❌ 受付失敗│      │  │
│  │  │   3件     │   8件     │  12件     │  22件    │      │  │
│  │  │   (7%)   │  (18%)   │  (27%)   │  (49%)  │      │  │
│  │  └──────────┴──────────┴──────────┴──────────┘      │  │
│  │                                                        │  │
│  │  🎯 成功率: 51% (23/45件)                             │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────┐
│  会話一覧セクション                                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🗣️ 会話一覧 (45件)                                    │  │
│  │                                                        │  │
│  │  [フィルタ: すべて ▼]  [並び替え: 会話番号 ▼]         │  │
│  │  ─────────────────────────────────────────────────   │  │
│  │                                                        │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ #1  09:00:15 - 09:02:38 (2分23秒)   ✅ アポ獲得│  │  │
│  │  │     [詳細を見る →]                              │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ #2  09:03:42 - 09:05:18 (1分36秒) ❌ 受付突破失敗│  │  │
│  │  │     💡 改善点あり (2件)                         │  │  │
│  │  │     [詳細を見る →]                              │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ #3  09:08:10 - 09:11:45 (3分35秒) 📞 担当者接続 │  │  │
│  │  │     [詳細を見る →]                              │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │  ... (42件を表示)                                      │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │         [さらに表示 (20件)]                   │    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

#### 3.3.3 コンポーネント構成

```tsx
<AnalysisDetailPage>
  <Header>
    <BackButton />
    <Title>{audioFile.originalFilename}</Title>
  </Header>
  
  <SummarySection>
    <Card>
      <CardHeader>
        <CardTitle>📈 分析サマリー</CardTitle>
      </CardHeader>
      <CardContent>
        <MetadataGrid>
          <MetadataItem label="分析日時" value={audioFile.createdAt} />
          <MetadataItem label="総録音時間" value={formatDuration(audioFile.durationSeconds)} />
          <MetadataItem label="総会話数" value={summary.totalConversations} />
        </MetadataGrid>
        
        <OutcomeGrid>
          <OutcomeCard 
            icon="✅" 
            label="アポ獲得" 
            count={summary.appointmentCount}
            percentage={calculatePercentage(summary.appointmentCount, summary.totalConversations)}
            variant="success"
          />
          {/* 他の成果カードも同様 */}
        </OutcomeGrid>
        
        <SuccessRate rate={summary.successRate} />
      </CardContent>
    </Card>
  </SummarySection>
  
  <ConversationsSection>
    <Card>
      <CardHeader>
        <CardTitle>🗣️ 会話一覧 ({conversations.length}件)</CardTitle>
        <FilterControls>
          <OutcomeFilter />
          <SortSelect />
        </FilterControls>
      </CardHeader>
      <CardContent>
        <ConversationList>
          {conversations.map((conversation) => (
            <ConversationCard 
              key={conversation.id} 
              conversation={conversation}
              onClick={() => navigateToConversation(conversation.id)}
            />
          ))}
        </ConversationList>
        
        {hasMore && <LoadMoreButton />}
      </CardContent>
    </Card>
  </ConversationsSection>
</AnalysisDetailPage>
```

#### 3.3.4 データ構造

**取得API**: `GET /api/audio-files/[id]` + `GET /api/audio-files/[id]/conversations`

**レスポンス**:
```typescript
interface AnalysisDetail {
  audioFile: {
    id: number;
    originalFilename: string;
    durationSeconds: number;
    createdAt: string;
  };
  summary: {
    totalConversations: number;
    appointmentCount: number;
    documentSentCount: number;
    contactSuccessCount: number;
    receptionFailedCount: number;
    successRate: number;
  };
  conversations: ConversationListItem[];
}

interface ConversationListItem {
  id: number;
  conversationNo: number;
  startTimeSec: number;
  endTimeSec: number;
  durationSeconds: number;
  outcome: 'APPOINTMENT' | 'DOCUMENT_SENT' | 'CONTACT_SUCCESS' | 'RECEPTION_FAILED';
  hasImprovements: boolean;
  improvementCount: number;
}
```

#### 3.3.5 フィルタリング・ソート

**フィルタオプション**
- すべて
- ✅ アポ獲得
- 📄 資料送付
- 📞 担当者接続
- ❌ 受付突破失敗
- 💡 改善点あり

**ソートオプション**
- 会話番号（昇順）
- 会話番号（降順）
- 時間（長い順）
- 時間（短い順）

#### 3.3.6 インタラクション

| 要素 | イベント | アクション |
|-----|---------|----------|
| [← 戻る] | クリック | ダッシュボードに戻る |
| 会話カード | クリック | `/conversations/[id]` に遷移 |
| フィルタ選択 | 変更 | 会話一覧を再フィルタ |
| ソート選択 | 変更 | 会話一覧を再ソート |
| [さらに表示] | クリック | 次の20件を読み込み |

#### 3.3.7 UI要素詳細

**アウトカムグリッド**
- グリッド: 4列（デスクトップ）、2列（タブレット）
- 各カード:
  - 背景カラー: 成果に応じた淡い色
  - ボーダー: 同系色の濃い色
  - アイコン: 大きめ（text-3xl）
  - 数値: 太字（font-bold）
  - パーセンテージ: やや小さめ（text-sm）

**会話カード**
- パディング: `p-4`
- ボーダー: `border border-gray-200`
- ホバー: `shadow-md bg-gray-50`
- カーソル: `cursor-pointer`
- トランジション: `transition-all duration-200`

**成果バッジ**
- コンポーネント: `Badge`
- サイズ: `text-sm`
- カラー:
  - APPOINTMENT: `bg-green-100 text-green-800`
  - DOCUMENT_SENT: `bg-yellow-100 text-yellow-800`
  - CONTACT_SUCCESS: `bg-blue-100 text-blue-800`
  - RECEPTION_FAILED: `bg-red-100 text-red-800`

---

### 3.4 SC04: 会話詳細画面

#### 3.4.1 画面概要

**目的**: 1つの会話の詳細内容、成果判定、改善点の表示

**URL**: `/conversations/[id]`（idはconversation_id）

#### 3.4.2 レイアウト構成

```
┌────────────────────────────────────────────────────────────┐
│  Header                                                     │
│  [← 戻る]  会話 #2 の詳細                                   │
└────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────┐
│  メタデータセクション                                        │
│                                                              │
│  ⏱️ 09:03:42 - 09:05:18 (1分36秒)                          │
│  📊 成果: [❌ 受付突破失敗]  信頼度: 85%                    │
└────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────┐
│  会話内容セクション                                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 💬 会話内容                                           │  │
│  │                                                        │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ [担当者] 00:00                                  │  │  │
│  │  │ お世話になっております。株式会社〇〇の山田と申 │  │  │
│  │  │ します。                                        │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ [顧客] 00:05                                    │  │  │
│  │  │ はい。                                          │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ [担当者] 00:08                                  │  │  │
│  │  │ 今回、新規のご提案でお電話させていただきました。│  │  │
│  │  │ 営業部の責任者の方はいらっしゃいますでしょうか？│  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ [顧客] 00:18                                    │  │  │
│  │  │ 営業の者はおりますが、そういったお電話はお断り │  │  │
│  │  │ しております。                                  │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ [担当者] 00:25                                  │  │  │
│  │  │ そうですか...わかりました。失礼いたします。     │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ [顧客] 00:30                                    │  │  │
│  │  │ 失礼します。                                    │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────┐
│  判定理由セクション                                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 📊 判定理由                                           │  │
│  │                                                        │  │
│  │  受付担当者が「そういったお電話はお断りしております」│  │
│  │  と明確に断っているため、受付突破に失敗しています。  │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────┐
│  改善点セクション（受付失敗の場合のみ表示）                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 💡 改善点                                             │  │
│  │                                                        │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ 🔴 冒頭トーク [優先度: 高]                      │  │  │
│  │  │                                                  │  │  │
│  │  │ 【問題点】                                       │  │  │
│  │  │ 「新規のご提案」という表現が警戒感を与えている │  │  │
│  │  │ 可能性があります。                             │  │  │
│  │  │                                                  │  │  │
│  │  │ 【改善案】                                       │  │  │
│  │  │ 具体的なメリットや業界実績を最初に伝えること   │  │  │
│  │  │ で、興味を引きやすくなります。                 │  │  │
│  │  │                                                  │  │  │
│  │  │ 例: 「〇〇業界で導入実績No.1のサービスについて、│  │  │
│  │  │      御社にもご活用いただけるかと思い...」    │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ 🟡 反論処理 [優先度: 中]                        │  │  │
│  │  │                                                  │  │  │
│  │  │ 【問題点】                                       │  │  │
│  │  │ 「そうですか」とすぐに引き下がってしまってい   │  │  │
│  │  │ ます。                                         │  │  │
│  │  │                                                  │  │  │
│  │  │ 【改善案】                                       │  │  │
│  │  │ 「1分だけお時間いただけませんか」等、粘り強く  │  │  │
│  │  │ 対応することが重要です。                       │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

#### 3.4.3 コンポーネント構成

```tsx
<ConversationDetailPage>
  <Header>
    <BackButton />
    <Title>会話 #{conversation.conversationNo} の詳細</Title>
  </Header>
  
  <MetadataSection>
    <TimeRange 
      start={conversation.startTimeSec} 
      end={conversation.endTimeSec}
      duration={conversation.durationSeconds}
    />
    <OutcomeBadge outcome={analysis.outcome} />
    <ConfidenceScore score={analysis.confidenceScore} />
  </MetadataSection>
  
  <TranscriptSection>
    <Card>
      <CardHeader>
        <CardTitle>💬 会話内容</CardTitle>
      </CardHeader>
      <CardContent>
        <TranscriptList>
          {transcript.map((utterance, index) => (
            <UtteranceBubble 
              key={index}
              speaker={utterance.speaker}
              text={utterance.text}
              timestamp={utterance.timestamp}
            />
          ))}
        </TranscriptList>
      </CardContent>
    </Card>
  </TranscriptSection>
  
  <OutcomeReasonSection>
    <Card>
      <CardHeader>
        <CardTitle>📊 判定理由</CardTitle>
      </CardHeader>
      <CardContent>
        <ReasonText>{analysis.outcomeReason}</ReasonText>
      </CardContent>
    </Card>
  </OutcomeReasonSection>
  
  {analysis.improvements && (
    <ImprovementsSection>
      <Card>
        <CardHeader>
          <CardTitle>💡 改善点</CardTitle>
        </CardHeader>
        <CardContent>
          {analysis.improvements.categories.map((improvement, index) => (
            <ImprovementCard 
              key={index}
              category={improvement.category}
              priority={improvement.priority}
              problem={improvement.problem}
              suggestion={improvement.suggestion}
            />
          ))}
        </CardContent>
      </Card>
    </ImprovementsSection>
  )}
</ConversationDetailPage>
```

#### 3.4.4 データ構造

**取得API**: `GET /api/conversations/[id]`

**レスポンス**:
```typescript
interface ConversationDetail {
  conversation: {
    id: number;
    conversationNo: number;
    startTimeSec: number;
    endTimeSec: number;
    durationSeconds: number;
    transcript: string; // テキスト全体
    speakerInfo: {
      speakers: Array<{
        speakerId: number;
        label: string;
        utterances: number;
      }>;
    };
  };
  analysis: {
    outcome: 'APPOINTMENT' | 'DOCUMENT_SENT' | 'CONTACT_SUCCESS' | 'RECEPTION_FAILED';
    confidenceScore: number;
    outcomeReason: string;
    improvements?: {
      categories: Array<{
        category: string;
        priority: '高' | '中' | '低';
        problem: string;
        suggestion: string;
      }>;
    };
  };
  // パースされた発話データ
  utterances: Array<{
    speaker: string;
    text: string;
    timestamp: number; // 相対時間（秒）
  }>;
}
```

#### 3.4.5 インタラクション

| 要素 | イベント | アクション |
|-----|---------|----------|
| [← 戻る] | クリック | 分析結果詳細画面に戻る |
| 発話バブル | ホバー | タイムスタンプをハイライト |

#### 3.4.6 UI要素詳細

**発話バブル（担当者）**
- 背景: `bg-blue-100`
- ボーダー: `border-l-4 border-blue-500`
- パディング: `p-3`
- マージン: `mb-3`
- テキスト: `text-gray-900`
- ラベル: `text-sm font-semibold text-blue-700`

**発話バブル（顧客）**
- 背景: `bg-gray-100`
- ボーダー: `border-l-4 border-gray-400`
- パディング: `p-3`
- マージン: `mb-3`
- テキスト: `text-gray-900`
- ラベル: `text-sm font-semibold text-gray-700`

**改善点カード**
- パディング: `p-5`
- 背景: 優先度に応じた淡い色
  - 高: `bg-red-50`
  - 中: `bg-yellow-50`
  - 低: `bg-blue-50`
- ボーダー: 同系色の濃い色
  - 高: `border-l-4 border-red-500`
  - 中: `border-l-4 border-yellow-500`
  - 低: `border-l-4 border-blue-500`
- マージン: `mb-4`

**優先度バッジ**
- 高: `🔴` + `text-red-700 font-bold`
- 中: `🟡` + `text-yellow-700 font-bold`
- 低: `🔵` + `text-blue-700 font-bold`

**セクション見出し**
- フォントサイズ: `text-lg font-semibold`
- マージン: `mb-2`
- カラー: `text-gray-800`

---

## 4. コンポーネント設計

### 4.1 共通コンポーネント

#### 4.1.1 Button

**使用箇所**: 全画面

**Props**:
```typescript
interface ButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}
```

**バリアント**:
- `default`: プライマリカラー、白文字
- `outline`: 透明背景、プライマリカラーのボーダー
- `ghost`: 透明背景、ホバーで淡い背景
- `destructive`: 赤背景、白文字

#### 4.1.2 Card

**使用箇所**: 全画面

**Props**:
```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}
```

**構成**:
- `Card`: ルートコンテナ
- `CardHeader`: ヘッダー部分
- `CardTitle`: タイトル
- `CardDescription`: 説明文
- `CardContent`: メインコンテンツ
- `CardFooter`: フッター

#### 4.1.3 Badge

**使用箇所**: 成果表示、ステータス表示

**Props**:
```typescript
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
}
```

#### 4.1.4 Progress

**使用箇所**: アップロード進捗、処理進捗

**Props**:
```typescript
interface ProgressProps {
  value: number; // 0-100
  max?: number;
  className?: string;
}
```

#### 4.1.5 Select

**使用箇所**: フィルタ、ソート

**Props**:
```typescript
interface SelectProps {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}
```

#### 4.1.6 Dialog (Modal)

**使用箇所**: アップロードモーダル

**Props**:
```typescript
interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}
```

### 4.2 ドメイン固有コンポーネント

#### 4.2.1 JobCard

**使用箇所**: ダッシュボード

**Props**:
```typescript
interface JobCardProps {
  job: DashboardJob;
  onViewDetails: (audioFileId: number) => void;
}
```

**内部構成**:
- ステータスによる条件分岐
- 完了: サマリーグリッド + 詳細ボタン
- 処理中: プログレスバー + ステータスメッセージ
- 失敗: エラーメッセージ

#### 4.2.2 OutcomeCard

**使用箇所**: 分析結果詳細

**Props**:
```typescript
interface OutcomeCardProps {
  icon: string;
  label: string;
  count: number;
  percentage: number;
  variant: 'success' | 'warning' | 'info' | 'error';
}
```

#### 4.2.3 ConversationCard

**使用箇所**: 会話一覧

**Props**:
```typescript
interface ConversationCardProps {
  conversation: ConversationListItem;
  onClick: () => void;
}
```

#### 4.2.4 UtteranceBubble

**使用箇所**: 会話詳細

**Props**:
```typescript
interface UtteranceBubbleProps {
  speaker: string;
  text: string;
  timestamp: number;
}
```

#### 4.2.5 ImprovementCard

**使用箇所**: 会話詳細

**Props**:
```typescript
interface ImprovementCardProps {
  category: string;
  priority: '高' | '中' | '低';
  problem: string;
  suggestion: string;
}
```

#### 4.2.6 DropZone

**使用箇所**: アップロードモーダル

**Props**:
```typescript
interface DropZoneProps {
  onFileDrop: (file: File) => void;
  onFileSelect: (file: File) => void;
  acceptedFormats: string[];
  maxSize: number;
  children: React.ReactNode;
}
```

---

## 5. データフロー設計

### 5.1 ダッシュボード画面のデータフロー

```
[初回レンダリング]
  ↓
useEffect: fetchJobs()
  ↓
GET /api/jobs
  ↓
[jobs] state更新
  ↓
画面描画

[ポーリング（処理中ジョブがある場合）]
  ↓
setInterval (5秒ごと)
  ↓
GET /api/jobs/:id (処理中のジョブのみ)
  ↓
[jobs] state更新（該当ジョブのみ）
  ↓
画面再描画
```

### 5.2 アップロードのデータフロー

```
[ファイル選択]
  ↓
バリデーション
  ↓
[selectedFile] state更新
  ↓
[アップロード] ボタンクリック
  ↓
POST /api/upload (FormData)
  ↓
onUploadProgress: [uploadProgress] state更新
  ↓
レスポンス: { jobId, audioFileId }
  ↓
モーダルを閉じる
  ↓
ダッシュボードをリフレッシュ
  ↓
新しいジョブが「処理中」で表示される
```

### 5.3 分析結果詳細のデータフロー

```
[画面遷移: /analysis/:id]
  ↓
useEffect: fetchAnalysisDetail(id)
  ↓
Promise.all([
  GET /api/audio-files/:id,
  GET /api/audio-files/:id/conversations
])
  ↓
[audioFile, conversations] state更新
  ↓
画面描画

[フィルタ変更]
  ↓
[filter] state更新
  ↓
クライアントサイドフィルタリング
  ↓
[filteredConversations] 再計算
  ↓
画面再描画
```

### 5.4 会話詳細のデータフロー

```
[画面遷移: /conversations/:id]
  ↓
useEffect: fetchConversationDetail(id)
  ↓
GET /api/conversations/:id
  ↓
レスポンスをパース:
  - transcript → utterances配列
  - analysis → 判定結果 + 改善点
  ↓
[conversation, analysis, utterances] state更新
  ↓
画面描画
```

---

## 6. 状態管理設計

### 6.1 状態管理方針

**採用**: Zustand（軽量、シンプル）

**理由**:
- 小規模アプリケーションに適している
- ボイラープレートが少ない
- TypeScript サポートが優れている
- React Context よりもパフォーマンスが良い

### 6.2 ストア設計

#### 6.2.1 Dashboard Store

```typescript
interface DashboardStore {
  // State
  jobs: DashboardJob[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchJobs: () => Promise<void>;
  refreshJob: (jobId: number) => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
}
```

#### 6.2.2 Upload Store

```typescript
interface UploadStore {
  // State
  isModalOpen: boolean;
  selectedFile: File | null;
  uploadProgress: UploadProgress | null;
  isUploading: boolean;
  error: string | null;
  
  // Actions
  openModal: () => void;
  closeModal: () => void;
  selectFile: (file: File) => void;
  removeFile: () => void;
  upload: () => Promise<UploadResponse>;
  reset: () => void;
}
```

#### 6.2.3 Analysis Store

```typescript
interface AnalysisStore {
  // State
  audioFile: AudioFile | null;
  summary: Summary | null;
  conversations: ConversationListItem[];
  filter: OutcomeFilter;
  sort: SortOption;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchAnalysisDetail: (audioFileId: number) => Promise<void>;
  setFilter: (filter: OutcomeFilter) => void;
  setSort: (sort: SortOption) => void;
  
  // Computed
  filteredConversations: ConversationListItem[];
}
```

#### 6.2.4 Conversation Store

```typescript
interface ConversationStore {
  // State
  conversation: Conversation | null;
  analysis: Analysis | null;
  utterances: Utterance[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchConversationDetail: (conversationId: number) => Promise<void>;
  reset: () => void;
}
```

---

## 7. API連携設計

### 7.1 APIクライアント設計

**ライブラリ**: SWR または TanStack Query

**採用**: SWR（推奨）

**理由**:
- Next.js と相性が良い
- キャッシング、リトライ、ポーリングが簡単
- 軽量

### 7.2 API Hooks

#### 7.2.1 useJobs

```typescript
function useJobs() {
  const { data, error, isLoading, mutate } = useSWR<DashboardJob[]>(
    '/api/jobs',
    fetcher,
    {
      refreshInterval: (data) => {
        // 処理中のジョブがあれば5秒ごとにポーリング
        const hasProcessing = data?.some(j => j.status === 'PROCESSING');
        return hasProcessing ? 5000 : 0;
      }
    }
  );
  
  return {
    jobs: data ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}
```

#### 7.2.2 useAnalysisDetail

```typescript
function useAnalysisDetail(audioFileId: number) {
  const { data, error, isLoading } = useSWR<AnalysisDetail>(
    audioFileId ? `/api/audio-files/${audioFileId}` : null,
    fetcher
  );
  
  return {
    audioFile: data?.audioFile,
    summary: data?.summary,
    conversations: data?.conversations ?? [],
    isLoading,
    error,
  };
}
```

#### 7.2.3 useConversationDetail

```typescript
function useConversationDetail(conversationId: number) {
  const { data, error, isLoading } = useSWR<ConversationDetail>(
    conversationId ? `/api/conversations/${conversationId}` : null,
    fetcher
  );
  
  return {
    conversation: data?.conversation,
    analysis: data?.analysis,
    utterances: data?.utterances ?? [],
    isLoading,
    error,
  };
}
```

#### 7.2.4 useUpload

```typescript
function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const upload = async (file: File): Promise<UploadResponse> => {
    setIsUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        // onUploadProgress でプログレスを更新
      });
      
      if (!response.ok) {
        throw new Error('アップロードに失敗しました');
      }
      
      const result = await response.json();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };
  
  return {
    upload,
    isUploading,
    progress,
    error,
  };
}
```

---

## 8. レスポンシブデザイン

### 8.1 ブレークポイント戦略

| 画面サイズ | レイアウト | 主な変更点 |
|----------|----------|----------|
| < 768px | モバイル | サポート外（警告表示） |
| 768px - 1023px | タブレット | 2カラムグリッド、フォント縮小 |
| 1024px - 1279px | 小型デスクトップ | 3カラムグリッド |
| ≥ 1280px | デスクトップ | 4カラムグリッド（推奨） |

### 8.2 レスポンシブコンポーネント例

#### ダッシュボードのジョブカード

```tsx
<div className="
  grid 
  grid-cols-1          /* モバイル: 1列 */
  md:grid-cols-1       /* タブレット: 1列 */
  lg:grid-cols-1       /* デスクトップ: 1列 */
  gap-6
">
  {jobs.map(job => <JobCard key={job.id} job={job} />)}
</div>
```

#### アウトカムグリッド

```tsx
<div className="
  grid 
  grid-cols-2          /* モバイル: 2列 */
  md:grid-cols-2       /* タブレット: 2列 */
  lg:grid-cols-4       /* デスクトップ: 4列 */
  gap-4
">
  {outcomes.map(outcome => <OutcomeCard key={outcome.label} {...outcome} />)}
</div>
```

#### ヘッダー

```tsx
<header className="
  flex 
  flex-col            /* モバイル: 縦並び */
  md:flex-row         /* タブレット以上: 横並び */
  items-center 
  justify-between
  px-4 md:px-8        /* パディング調整 */
  py-4
">
  <Logo />
  <UploadButton />
</header>
```

---

## 9. アクセシビリティ

### 9.1 WAI-ARIA対応

| 要素 | ARIA属性 |
|-----|---------|
| ボタン | `role="button"`, `aria-label` |
| モーダル | `role="dialog"`, `aria-modal="true"` |
| プログレスバー | `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |
| ステータスバッジ | `role="status"`, `aria-label` |

### 9.2 キーボードナビゲーション

| キー | アクション |
|-----|----------|
| Tab | フォーカス移動 |
| Enter | アクティブ化（ボタン、リンク） |
| Esc | モーダルを閉じる |
| Space | ボタンのアクティブ化 |

### 9.3 カラーコントラスト

- **WCAG AA準拠**: コントラスト比 4.5:1 以上（通常テキスト）
- **重要な情報**: コントラスト比 7:1 以上

### 9.4 フォーカスインジケーター

- すべてのインタラクティブ要素に視覚的なフォーカス状態
- `focus-visible:ring-2 focus-visible:ring-blue-500`

---

## 10. エラーハンドリング

### 10.1 エラー表示パターン

#### 10.1.1 インラインエラー（フォーム）

```tsx
{error && (
  <div className="text-sm text-red-600 mt-2">
    {error}
  </div>
)}
```

#### 10.1.2 トースト通知（一時的なエラー）

```tsx
toast.error('アップロードに失敗しました', {
  description: error.message,
  action: {
    label: '再試行',
    onClick: () => retry(),
  },
});
```

#### 10.1.3 エラーページ（致命的なエラー）

```tsx
<ErrorBoundary
  fallback={
    <ErrorPage 
      title="エラーが発生しました" 
      message={error.message}
      onRetry={() => location.reload()}
    />
  }
>
  {children}
</ErrorBoundary>
```

### 10.2 エラーメッセージ一覧

| エラーケース | メッセージ |
|------------|----------|
| ファイル形式エラー | 対応していないファイル形式です。MP3、WAV、M4Aのみ対応しています。 |
| ファイルサイズ超過 | ファイルサイズが大きすぎます。最大1GBまでアップロード可能です。 |
| ネットワークエラー | ネットワークエラーが発生しました。接続を確認してください。 |
| サーバーエラー | サーバーエラーが発生しました。しばらくしてから再試行してください。 |
| データ取得失敗 | データの取得に失敗しました。ページを再読み込みしてください。 |
| 処理失敗 | 音声の分析に失敗しました。ファイルが破損している可能性があります。 |

---

## 11. ローディング状態

### 11.1 ローディングパターン

#### 11.1.1 Skeleton（コンテンツローディング）

```tsx
{isLoading ? (
  <Skeleton className="h-32 w-full" />
) : (
  <JobCard job={job} />
)}
```

#### 11.1.2 Spinner（アクション実行中）

```tsx
<Button disabled={isUploading}>
  {isUploading && <Spinner className="mr-2" />}
  {isUploading ? 'アップロード中...' : 'アップロード'}
</Button>
```

#### 11.1.3 Progress Bar（進捗表示）

```tsx
<Progress value={uploadProgress.percentage} />
<p className="text-sm text-gray-600 mt-2">
  アップロード中... ({uploadProgress.percentage}%)
</p>
```

---

## 12. パフォーマンス最適化

### 12.1 コード分割

```typescript
// 動的インポート
const AnalysisDetailPage = dynamic(() => import('@/components/AnalysisDetailPage'), {
  loading: () => <PageSkeleton />,
});
```

### 12.2 画像最適化

```tsx
import Image from 'next/image';

<Image 
  src="/logo.png" 
  alt="Logo" 
  width={200} 
  height={50}
  priority // Above the fold
/>
```

### 12.3 メモ化

```typescript
// useMemo: 計算コストの高い処理
const filteredConversations = useMemo(() => {
  return conversations.filter(c => c.outcome === filter);
}, [conversations, filter]);

// useCallback: 関数の再生成を防ぐ
const handleUpload = useCallback(async () => {
  await upload(selectedFile);
}, [selectedFile, upload]);
```

### 12.4 仮想スクロール（大量データ）

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

// 100件以上の会話がある場合
const virtualizer = useVirtualizer({
  count: conversations.length,
  getScrollElement: () => scrollRef.current,
  estimateSize: () => 100, // 各アイテムの高さ
});
```

---

## 13. テスト戦略

### 13.1 テスト種別

| テスト種別 | ツール | 対象 |
|----------|-------|-----|
| 単体テスト | Vitest + React Testing Library | コンポーネント、ユーティリティ関数 |
| 統合テスト | Vitest + MSW | API連携、データフロー |
| E2Eテスト | Playwright | ユーザーシナリオ |

### 13.2 テストケース例

#### コンポーネントテスト

```typescript
describe('JobCard', () => {
  it('完了したジョブの場合、サマリーを表示する', () => {
    const job = createMockJob({ status: 'COMPLETED' });
    render(<JobCard job={job} />);
    
    expect(screen.getByText('総会話数: 45件')).toBeInTheDocument();
    expect(screen.getByText('成功率: 51%')).toBeInTheDocument();
  });
  
  it('処理中のジョブの場合、プログレスバーを表示する', () => {
    const job = createMockJob({ status: 'PROCESSING' });
    render(<JobCard job={job} />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
```

#### E2Eテスト

```typescript
test('音声ファイルをアップロードして分析結果を確認できる', async ({ page }) => {
  await page.goto('/');
  
  // アップロードボタンをクリック
  await page.click('text=音声をアップロード');
  
  // ファイルを選択
  await page.setInputFiles('input[type="file"]', 'test-audio.mp3');
  
  // アップロード
  await page.click('text=アップロード');
  
  // 処理完了を待つ
  await page.waitForSelector('text=分析完了', { timeout: 600000 });
  
  // 詳細を確認
  await page.click('text=詳細を見る');
  await expect(page).toHaveURL(/\/analysis\/\d+/);
  
  // サマリーが表示される
  await expect(page.locator('text=総会話数')).toBeVisible();
});
```

---

## 14. 変更履歴

| バージョン | 日付 | 変更内容 | 担当者 |
|-----------|------|---------|-------|
| 1.0 | 2025-10-24 | 初版作成 | Kaisei Yamaguchi |

---

**以上**

