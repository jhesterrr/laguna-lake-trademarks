import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oynujisoukbavyaucuye.supabase.co';
const supabaseKey = 'sb_publishable_3XTjSjsmkJFrJIgQXPZ1uw_BwGLBlbI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixThreads() {
  console.log("Fetching threads...");
  const { data: threads } = await supabase.from('threads').select('*');
  console.log("All threads:", threads);

  if (!threads) return;

  // Find the old thread with messages (client_id null)
  const oldThread = threads.find(t => t.client_name === 'Jhester Cayetano' && t.client_id === null);
  
  // Find the newly created thread (has client_id)
  const newThread = threads.find(t => t.client_id !== null);

  if (oldThread && newThread) {
    console.log("Updating old thread with user details...");
    await supabase.from('threads').update({
      client_id: newThread.client_id,
      client_email: newThread.client_email
    }).eq('id', oldThread.id);

    console.log("Deleting the empty new thread...");
    await supabase.from('threads').delete().eq('id', newThread.id);
    
    console.log("Done! The old conversation is now linked to the client.");
  } else {
    console.log("Could not find the exact threads to swap.");
  }
}

fixThreads();
