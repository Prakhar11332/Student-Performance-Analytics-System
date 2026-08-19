import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY as string;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { error } = await supabase.from('courses').insert({
    id: crypto.randomUUID(),
    code: 'TEST',
    name: 'TEST',
    teacher_id: 'efa05394-0d18-4797-a965-259e81ac2a0d',
    credits: 3
  });
  console.log("Insert course error:", error);
}
run();
