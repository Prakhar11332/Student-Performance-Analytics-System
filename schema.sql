-- 1. Create Subjects Table
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  branch TEXT NOT NULL,
  year TEXT NOT NULL,
  semester TEXT NOT NULL,
  credits INTEGER NOT NULL
);

-- 2. Create Student Academic Records Table
CREATE TABLE student_academic_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  attempt_number INTEGER DEFAULT 1,
  marks_obtained NUMERIC,
  max_marks NUMERIC NOT NULL,
  status TEXT CHECK (status IN ('passed', 'backlog', 'pending')),
  exam_date DATE
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_academic_records ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for student_academic_records

-- Students can read their own records
CREATE POLICY "Students can view own records" ON student_academic_records
  FOR SELECT
  USING (auth.uid() = student_id);

-- Teachers can read/write records for students in their branch
CREATE POLICY "Teachers can manage branch records" ON student_academic_records
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM teachers t
      JOIN students s ON s.branch = t.department -- assuming department/branch
      WHERE t.id = auth.uid() AND s.id = student_academic_records.student_id
    )
  );

-- Admins can read/write everything
CREATE POLICY "Admins can manage all records" ON student_academic_records
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin'); -- assuming roles are stored in JWT
