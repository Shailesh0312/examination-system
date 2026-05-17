-- =============================================
-- University Examination System - Database Setup
-- Run this in Supabase SQL Editor
-- =============================================

-- ---------------------------------------------
-- 1. EXAM DUTIES TABLE
-- ---------------------------------------------
DROP TABLE IF EXISTS exam_duties;
CREATE TABLE exam_duties (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  slot TEXT NOT NULL,
  faculty_id TEXT,
  faculty_name TEXT,
  dept TEXT,
  designation TEXT,
  mobile TEXT,
  room TEXT,
  duty_type TEXT DEFAULT 'Invigilation',
  students INTEGER DEFAULT 0,
  is_reserved BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'present',
  substitute_for TEXT,
  incident JSONB,
  control_role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------
-- 2. FACULTY MASTER TABLE
-- ---------------------------------------------
DROP TABLE IF EXISTS faculty_master;
CREATE TABLE faculty_master (
  faculty_id TEXT PRIMARY KEY,
  faculty_name TEXT NOT NULL,
  dept TEXT,
  designation TEXT,
  mobile TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------
-- 3. APP CONFIG TABLE
-- ---------------------------------------------
DROP TABLE IF EXISTS app_config;
CREATE TABLE app_config (
  key TEXT PRIMARY KEY,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------
-- 4. UFM CASES TABLE
-- ---------------------------------------------
DROP TABLE IF EXISTS ufm_cases;
CREATE TABLE ufm_cases (
  id TEXT PRIMARY KEY,
  date TEXT,
  slot TEXT,
  shift TEXT,
  roll_no TEXT,
  student_name TEXT,
  room_no TEXT,
  school TEXT,
  doc_link TEXT,
  ts TIMESTAMPTZ,
  authority_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------
-- 5. PROCTORIAL BOARD TABLE
-- ---------------------------------------------
DROP TABLE IF EXISTS proctorial_board;
CREATE TABLE proctorial_board (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  designation TEXT,
  department TEXT,
  mobile TEXT,
  school TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------
-- 6. CONTROL ROOM TABLE
-- ---------------------------------------------
DROP TABLE IF EXISTS control_room;
CREATE TABLE control_room (
  id TEXT PRIMARY KEY,
  date TEXT,
  slot TEXT,
  faculty_id TEXT,
  faculty_name TEXT,
  dept TEXT,
  designation TEXT,
  mobile TEXT,
  control_role TEXT,
  status TEXT DEFAULT 'present',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS) - Enable all tables
-- =============================================

-- Enable RLS on all tables
ALTER TABLE exam_duties ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE ufm_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE proctorial_board ENABLE ROW LEVEL SECURITY;
ALTER TABLE control_room ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for all tables (public access for anon key)
DROP POLICY IF EXISTS "Allow all access" ON exam_duties;
DROP POLICY IF EXISTS "Allow all access" ON faculty_master;
DROP POLICY IF EXISTS "Allow all access" ON app_config;
DROP POLICY IF EXISTS "Allow all access" ON ufm_cases;
DROP POLICY IF EXISTS "Allow all access" ON proctorial_board;
DROP POLICY IF EXISTS "Allow all access" ON control_room;

CREATE POLICY "Allow all access" ON exam_duties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON faculty_master FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON app_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON ufm_cases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON proctorial_board FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON control_room FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- STORAGE BUCKET FOR UFM DOCUMENTS
-- =============================================

-- Create storage bucket for UFM documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ufm-docs', 'ufm-docs', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policy for public access
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects 
FOR ALL USING ( bucket_id = 'ufm-docs' );

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Check tables created
SELECT 'exam_duties' as table_name FROM exam_duties LIMIT 1
UNION ALL
SELECT 'faculty_master' FROM faculty_master LIMIT 1
UNION ALL
SELECT 'app_config' FROM app_config LIMIT 1
UNION ALL
SELECT 'ufm_cases' FROM ufm_cases LIMIT 1
UNION ALL
SELECT 'proctorial_board' FROM proctorial_board LIMIT 1
UNION ALL
SELECT 'control_room' FROM control_room LIMIT 1;