import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oynujisoukbavyaucuye.supabase.co';
const supabaseKey = 'sb_publishable_3XTjSjsmkJFrJIgQXPZ1uw_BwGLBlbI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing threads fetch with client_email...");
  const { data, error } = await supabase.from('threads').select('*').eq('client_email', 'test@test.com').limit(1);
  console.log("Threads data:", data);
  console.log("Threads error:", error);
}

test();
