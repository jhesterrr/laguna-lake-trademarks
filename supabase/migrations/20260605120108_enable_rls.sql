-- Create an admin check function
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- Cases
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage all cases" ON cases FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Users can view own cases" ON cases FOR SELECT TO authenticated USING (client_id = auth.uid());

-- Inquiries
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage all inquiries" ON inquiries FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Users can view own inquiries" ON inquiries FOR SELECT TO authenticated USING (client_id = auth.uid());
CREATE POLICY "Users can insert own inquiries" ON inquiries FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid());

-- Threads
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage all threads" ON threads FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Users can view own threads" ON threads FOR SELECT TO authenticated USING (client_id = auth.uid());
CREATE POLICY "Users can insert own threads" ON threads FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid());

-- Messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage all messages" ON messages FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Users can view own messages" ON messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM threads WHERE threads.id = messages.thread_id AND threads.client_id = auth.uid())
);
CREATE POLICY "Users can insert own messages" ON messages FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM threads WHERE threads.id = messages.thread_id AND threads.client_id = auth.uid())
);

-- Payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage all payments" ON payments FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Users can view own payments" ON payments FOR SELECT TO authenticated USING (client_id = auth.uid());

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage all notifications" ON notifications FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT TO authenticated USING (client_id = auth.uid());
