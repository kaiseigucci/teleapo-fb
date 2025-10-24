'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils/cn'
import { validateAudioFile } from '@/lib/validations/upload'
import { formatFileSize } from '@/lib/utils/format'

interface FileUploadProps {
  onUploadSuccess?: (result: UploadResult) => void
  onUploadError?: (error: string) => void
}

interface UploadResult {
  jobId: number
  audioFileId: number
  filename: string
  originalFilename: string
  fileSize: number
  status: string
  createdAt: string
}

export function FileUpload({ onUploadSuccess, onUploadError }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }, [])

  const handleFileSelect = (selectedFile: File) => {
    setError(null)
    
    // ファイルバリデーション
    const validation = validateAudioFile(selectedFile)
    if (!validation.valid) {
      setError(validation.error!)
      setFile(null)
      if (onUploadError) {
        onUploadError(validation.error!)
      }
      return
    }

    setFile(selectedFile)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // アップロード進捗のシミュレーション
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'アップロードに失敗しました')
      }

      setUploadProgress(100)
      
      if (onUploadSuccess) {
        onUploadSuccess(result.data)
      }

      // リセット
      setTimeout(() => {
        setFile(null)
        setUploadProgress(0)
        setIsUploading(false)
      }, 1000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'アップロードに失敗しました'
      setError(errorMessage)
      setUploadProgress(0)
      setIsUploading(false)
      
      if (onUploadError) {
        onUploadError(errorMessage)
      }
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* ドラッグ&ドロップエリア */}
      <Card>
        <CardContent className="pt-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 hover:border-primary',
              isUploading && 'pointer-events-none opacity-50'
            )}
          >
            <input
              type="file"
              id="file-upload"
              accept="audio/mpeg,audio/wav,audio/m4a,audio/mp4"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={isUploading}
            />
            
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <svg
                    className="w-16 h-16 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    ファイルをドラッグ&ドロップ
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    または クリックして選択
                  </p>
                </div>
                
                <div className="text-xs text-gray-400">
                  <p>対応形式: MP3, WAV, M4A</p>
                  <p>最大サイズ: 1GB</p>
                </div>
              </div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* ファイル情報 */}
      {file && !isUploading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-sm">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              
              <Button onClick={handleUpload} disabled={isUploading}>
                アップロード
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* アップロード中 */}
      {isUploading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">アップロード中...</span>
                <span className="text-gray-500">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} max={100} />
              {file && (
                <p className="text-xs text-gray-500">{file.name}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* エラー表示 */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <svg
                className="w-5 h-5 text-red-500 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="font-medium text-red-800 text-sm">エラー</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

