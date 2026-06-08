-- Add 'archived' to inquiries status
ALTER TABLE public.inquiries DROP CONSTRAINT inquiries_status_check;
ALTER TABLE public.inquiries ADD CONSTRAINT inquiries_status_check CHECK (status in ('new', 'reviewed', 'contacted', 'converted', 'archived'));

-- Add 'archived' to cases status
ALTER TABLE public.cases DROP CONSTRAINT cases_status_check;
ALTER TABLE public.cases ADD CONSTRAINT cases_status_check CHECK (status in ('draft', 'review', 'filed', 'published', 'registered', 'rejected', 'archived'));
