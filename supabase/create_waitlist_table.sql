-- Create waitlist table for Pettabl
CREATE TABLE IF NOT EXISTS public.waitlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  source text DEFAULT 'web',
  context text,
  created_at timestamptz DEFAULT now() NOT NULL,
  notified boolean DEFAULT false,
  notes text
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON public.waitlist(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (join waitlist)
CREATE POLICY "Anyone can join waitlist"
  ON public.waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Only authenticated users can view waitlist (for admin purposes)
CREATE POLICY "Authenticated users can view waitlist"
  ON public.waitlist
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only authenticated users can update waitlist (for admin purposes)
CREATE POLICY "Authenticated users can update waitlist"
  ON public.waitlist
  FOR UPDATE
  TO authenticated
  USING (true);

-- Add comment to table
COMMENT ON TABLE public.waitlist IS 'Stores waitlist signups for Pettabl launch';

