import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oynujisoukbavyaucuye.supabase.co';
const supabaseKey = 'sb_publishable_3XTjSjsmkJFrJIgQXPZ1uw_BwGLBlbI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing threads fetch...");
  const { data, error } = await supabase.from('threads').select('*').limit(1);
  console.log("Threads data:", data);
  console.log("Threads error:", error);

  console.log("Testing messages fetch...");
  const { data: msgData, error: msgError } = await supabase.from('messages').select('*').limit(1);
  console.log("Messages data:", msgData);
  console.log("Messages error:", msgError);
}

test();
