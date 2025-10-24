-- テスト用のジョブを作成するSQL
-- Supabase Dashboard の SQL Editor で実行してください

-- 1. ジョブを作成
INSERT INTO jobs (status) VALUES ('PENDING') RETURNING id;

-- 2. 音声ファイル情報を登録（上記で取得したjob_idに置き換えてください）
-- 例: job_id = 1 の場合
INSERT INTO audio_files (
  job_id,
  filename,
  original_filename,
  file_url,
  file_size,
  mime_type
) VALUES (
  1,  -- ←ここを実際のjob_idに置き換え
  'test-audio.mp3',
  'test-audio.mp3',
  'https://example.com/test.mp3',  -- ダミーURL
  1024000,
  'audio/mpeg'
) RETURNING id;

-- 3. 確認
SELECT 
  j.id as job_id,
  j.status,
  af.id as audio_file_id,
  af.original_filename
FROM jobs j
LEFT JOIN audio_files af ON j.id = af.job_id
ORDER BY j.created_at DESC
LIMIT 5;

