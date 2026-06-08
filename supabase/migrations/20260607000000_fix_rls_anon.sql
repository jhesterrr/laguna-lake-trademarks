-- Fix RLS: Allow anon key to insert cases, threads, and messages
-- (Used by admin panel which runs with the anon key)
-- This is safe for prototyping — lock down with service_role key before going to production

-- Cases: allow inserts from anon (admin panel)
DROP POLICY IF EXISTS "Allow all cases" ON public.cases;
CREATE POLICY "Allow all cases" ON public.cases FOR ALL USING (true) WITH CHECK (true);

-- Threads: allow inserts from anon (admin panel)  
DROP POLICY IF EXISTS "Allow all threads" ON public.threads;
CREATE POLICY "Allow all threads" ON public.threads FOR ALL USING (true) WITH CHECK (true);

-- Messages: allow inserts from anon (admin panel)
DROP POLICY IF EXISTS "Allow all messages" ON public.messages;
CREATE POLICY "Allow all messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);

-- Inquiries: allow updates from anon (admin panel needs to update status)
DROP POLICY IF EXISTS "Allow all inquiries" ON public.inquiries;
CREATE POLICY "Allow all inquiries" ON public.inquiries FOR ALL USING (true) WITH CHECK (true);
