'use client'

import { useState } from 'react'
import { FileUpload } from '@/components/upload/file-upload'
import { JobList } from '@/components/dashboard/job-list'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUploadSuccess = () => {
    // ジョブリストを再取得
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">テレアポFB君</h1>
          <p className="text-gray-600 mt-1">
            テレアポの音声を分析し、改善点をフィードバックするAIシステム
          </p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8">
          {/* アップロードセクション */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle>音声ファイルをアップロード</CardTitle>
                <CardDescription>
                  テレアポの音声ファイル（MP3, WAV, M4A）をアップロードしてください
                </CardDescription>
              </CardHeader>
              <div className="px-6 pb-6">
                <FileUpload 
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={(error) => console.error('Upload error:', error)}
                />
              </div>
            </Card>
          </section>

          {/* ジョブ一覧セクション */}
          <section>
            <h2 className="text-2xl font-bold mb-4">分析履歴</h2>
            <JobList key={refreshKey} />
          </section>
        </div>
      </main>
    </div>
  )
}

