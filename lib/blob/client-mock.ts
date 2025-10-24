/**
 * Vercel Blob のモック実装
 * BLOB_READ_WRITE_TOKEN が未設定の場合に使用
 */

let mockFiles: Map<string, { url: string; name: string }> = new Map()

export async function uploadAudioFile(file: File): Promise<{
  url: string
  downloadUrl: string
}> {
  // ファイル名にタイムスタンプを追加
  const filename = `${Date.now()}_${file.name}`
  const mockUrl = `http://localhost:3000/mock-storage/${filename}`
  
  mockFiles.set(filename, {
    url: mockUrl,
    name: file.name,
  })
  
  console.log(`[Mock] Uploaded file: ${filename}`)
  
  return {
    url: mockUrl,
    downloadUrl: mockUrl,
  }
}

export async function deleteAudioFile(url: string): Promise<void> {
  const filename = url.split('/').pop()
  if (filename) {
    mockFiles.delete(filename)
    console.log(`[Mock] Deleted file: ${filename}`)
  }
}

export function getMockFiles() {
  return Array.from(mockFiles.values())
}

