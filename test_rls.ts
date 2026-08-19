import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY as string;

// Note: This uses anon key. If no session is active, auth.uid() is null.
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data: students } = await supabase.from('students').select('*').limit(1);
  const { data: subjects } = await supabase.from('subjects').select('*').limit(1);
  
  if (!students || !students.length || !subjects || !subjects.length) {
      console.log("No students or subjects");
      return;
  }
  
  const studentId = students[0].id;
  const subjectId = subjects[0].id;
  
  const { data, error } = await supabase.from('student_academic_records').upsert({
      student_id: studentId,
      subject_id: subjectId,
      attempt_number: 1,
      marks_obtained: 85,
      max_marks: 100,
      status: 'passed'
  });
  
  console.log("Upsert result:", { data, error });
}
run();
