import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oynujisoukbavyaucuye.supabase.co';
const supabaseKey = 'sb_publishable_3XTjSjsmkJFrJIgQXPZ1uw_BwGLBlbI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing thread insert...");
  const { data, error } = await supabase.from('threads').insert({
    client_id: '123e4567-e89b-12d3-a456-426614174000',
    client_email: 'test@example.com',
    client_name: 'Test Client',
    status: 'active'
  }).select();
  
  console.log("Insert result:", data);
  console.log("Insert error:", error);

  // Clean up
  if (data && data[0]) {
    await supabase.from('threads').delete().eq('id', data[0].id);
  }
}

test();
