'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime, formatDuration, formatPercentage } from '@/lib/utils/format'
import type { JobStatus } from '@/types'

interface Job {
  id: number
  status: JobStatus
  createdAt: string
  updatedAt: string
  audioFile: {
    id: number
    originalFilename: string
    duration: number | null
    conversationCount: number
    appointmentCount: number
    documentSentCount: number
    contactSuccessCount: number
    receptionFailedCount: number
  } | null
}

export function JobList() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchJobs()
    
    // 5秒ごとに自動更新（PENDING/PROCESSING中のジョブがある場合）
    const interval = setInterval(() => {
      if (jobs.some((job) => job.status === 'PENDING' || job.status === 'PROCESSING')) {
        fetchJobs()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs?limit=20')
      const result = await response.json()

      if (result.success) {
        setJobs(result.data.jobs)
      } else {
        setError(result.error?.message || 'データの取得に失敗しました')
      }
    } catch (err) {
      setError('データの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary">処理待ち</Badge>
      case 'PROCESSING':
        return <Badge variant="warning">処理中</Badge>
      case 'COMPLETED':
        return <Badge variant="success">完了</Badge>
      case 'FAILED':
        return <Badge variant="destructive">失敗</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const startProcessing = async (jobId: number) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/process`, {
        method: 'POST',
      })
      
      const result = await response.json()
      
      if (result.success) {
        // ジョブリストを再取得
        fetchJobs()
      } else {
        alert(`エラー: ${result.error?.message || '処理の開始に失敗しました'}`)
      }
    } catch (error) {
      alert('処理の開始に失敗しました')
    }
  }

  const calculateSuccessRate = (job: Job) => {
    if (!job.audioFile) return 0
    const { appointmentCount, documentSentCount, contactSuccessCount, conversationCount } = job.audioFile
    if (conversationCount === 0) return 0
    const successCount = appointmentCount + documentSentCount + contactSuccessCount
    return (successCount / conversationCount) * 100
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-600 text-center">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="mt-4 text-gray-500">まだ音声ファイルがアップロードされていません</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Card key={job.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">
                  {job.audioFile?.originalFilename || `ジョブ #${job.id}`}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDateTime(job.createdAt)}
                </p>
              </div>
              {getStatusBadge(job.status)}
            </div>
          </CardHeader>
          
          {job.audioFile && job.status === 'COMPLETED' && (
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-xs text-gray-500">会話数</p>
                  <p className="text-lg font-semibold">{job.audioFile.conversationCount}件</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">アポ獲得</p>
                  <p className="text-lg font-semibold text-green-600">
                    {job.audioFile.appointmentCount}件
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">資料送付</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {job.audioFile.documentSentCount}件
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">担当者接続</p>
                  <p className="text-lg font-semibold text-purple-600">
                    {job.audioFile.contactSuccessCount}件
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">成功率</p>
                  <p className="text-lg font-semibold">
                    {formatPercentage(calculateSuccessRate(job))}
                  </p>
                </div>
              </div>
              
              {job.audioFile.duration && (
                <div className="mt-4 text-sm text-gray-500">
                  音声時間: {formatDuration(job.audioFile.duration)}
                </div>
              )}
            </CardContent>
          )}
          
          {job.status === 'PENDING' && (
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">処理を開始してください</p>
                <button
                  onClick={() => startProcessing(job.id)}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 text-sm font-medium"
                >
                  処理を開始
                </button>
              </div>
            </CardContent>
          )}
          
          {job.status === 'PROCESSING' && (
            <CardContent>
              <p className="text-sm text-gray-500">音声を分析中です...</p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}

