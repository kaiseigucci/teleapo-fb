import { NextResponse } from 'next/server'
import type { ApiResponse } from '@/types'

/**
 * 成功レスポンスを返す
 */
export function successResponse<T>(data: T, status: number = 200) {
  const response: ApiResponse<T> = {
    success: true,
    data,
  }
  return NextResponse.json(response, { status })
}

/**
 * エラーレスポンスを返す
 */
export function errorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: Record<string, unknown>
) {
  const response: ApiResponse<never> = {
    success: false,
    error: {
      code,
      message,
      details,
    },
  }
  return NextResponse.json(response, { status })
}

/**
 * 共通エラーコード
 */
export const ErrorCodes = {
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  MISSING_FILE: 'MISSING_FILE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const

