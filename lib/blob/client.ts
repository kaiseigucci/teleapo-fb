import { put, del } from '@vercel/blob'

/**
 * 音声ファイルをVercel Blobにアップロード
 */
export async function uploadAudioFile(file: File): Promise<{
  url: string
  downloadUrl: string
}> {
  const blob = await put(file.name, file, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })

  return {
    url: blob.url,
    downloadUrl: blob.downloadUrl,
  }
}

/**
 * Vercel Blobからファイルを削除
 */
export async function deleteAudioFile(url: string): Promise<void> {
  await del(url, {
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })
}

