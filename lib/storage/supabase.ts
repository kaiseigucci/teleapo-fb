import { createClient } from '@supabase/supabase-js'

// Supabaseクライアントの初期化
// サーバーサイドではサービスロールキーを使用（RLSをバイパス）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const BUCKET_NAME = 'audio-files'

/**
 * 音声ファイルをSupabase Storageにアップロード
 */
export async function uploadAudioFile(file: File): Promise<{
  pathname: string
  url: string
}> {
  // ファイル名にタイムスタンプを追加してユニークにする
  const timestamp = Date.now()
  const filename = `${timestamp}_${file.name}`
  const filepath = `uploads/${filename}`

  // アップロード
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filepath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Supabase Storage upload error:', error)
    throw new Error(`ファイルのアップロードに失敗しました: ${error.message}`)
  }

  // 公開URLを取得（実際にはプライベートバケットなので、後で署名付きURLを使う）
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filepath)

  return {
    pathname: data.path,
    url: urlData.publicUrl,
  }
}

/**
 * Supabase Storageからファイルを削除
 */
export async function deleteAudioFile(url: string): Promise<void> {
  // URLからファイルパスを抽出
  const urlParts = url.split(`/storage/v1/object/public/${BUCKET_NAME}/`)
  if (urlParts.length < 2) {
    console.error('Invalid URL format:', url)
    return
  }
  
  const filepath = urlParts[1]

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filepath])

  if (error) {
    console.error('Supabase Storage delete error:', error)
    throw new Error(`ファイルの削除に失敗しました: ${error.message}`)
  }
}

/**
 * バケットが存在するか確認、なければ作成
 */
export async function ensureBucketExists(): Promise<void> {
  const { data: buckets } = await supabase.storage.listBuckets()
  
  const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME)
  
  if (!bucketExists) {
    const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: false,
      fileSizeLimit: 1024 * 1024 * 1024, // 1GB
    })
    
    if (error) {
      console.error('Failed to create bucket:', error)
    }
  }
}

/**
 * Supabase Storageから署名付きURLを生成
 * プライベートバケットのファイルにアクセスするために使用
 * 
 * @param fileUrl - 公開URL（getPublicUrlで取得したURL）
 * @param expiresIn - 有効期限（秒）デフォルト: 1時間
 * @returns 署名付きURL
 */
export async function getSignedUrl(fileUrl: string, expiresIn: number = 3600): Promise<string> {
  // URLからファイルパスを抽出
  const urlParts = fileUrl.split(`/storage/v1/object/public/${BUCKET_NAME}/`)
  if (urlParts.length < 2) {
    // すでに署名付きURLかもしれない、そのまま返す
    return fileUrl
  }
  
  const filepath = urlParts[1]
  
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filepath, expiresIn)
  
  if (error) {
    console.error('Failed to create signed URL:', error)
    throw new Error(`署名付きURLの生成に失敗しました: ${error.message}`)
  }
  
  if (!data?.signedUrl) {
    throw new Error('署名付きURLが生成されませんでした')
  }
  
  return data.signedUrl
}

