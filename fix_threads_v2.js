import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oynujisoukbavyaucuye.supabase.co';
const supabaseKey = 'sb_publishable_3XTjSjsmkJFrJIgQXPZ1uw_BwGLBlbI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixThreads() {
  const { data: threads } = await supabase.from('threads').select('*').eq('client_name', 'Jhester Cayetano');
  const { data: messages } = await supabase.from('messages').select('thread_id');
  
  const msgThreadIds = messages.map(m => m.thread_id);
  
  // Find the thread that has messages
  const activeThread = threads.find(t => msgThreadIds.includes(t.id));
  
  if (activeThread) {
    console.log("Found thread with messages:", activeThread.id);
    // Update it with the client email so ClientMessagesPage finds it!
    await supabase.from('threads').update({
      client_email: 'jhestercruzcayetano@gmail.com'
    }).eq('id', activeThread.id);
    console.log("Updated active thread with email.");
    
    // Delete the empty ones
    for (const t of threads) {
      if (t.id !== activeThread.id) {
        console.log("Deleting empty thread:", t.id);
        await supabase.from('threads').delete().eq('id', t.id);
      }
    }
  } else {
    console.log("No thread has messages.");
  }
}

fixThreads();
