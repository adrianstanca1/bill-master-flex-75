-- Enable RLS on all tables that currently have it disabled
ALTER TABLE public."Chat" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Document" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Message_v2" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Stream" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Suggestion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Vote" ENABLE ROW LEVEL SECURITY;

-- Create secure RLS policies for Chat table
CREATE POLICY "Users can view their own chats" ON public."Chat"
FOR SELECT USING (auth.uid() = "userId");

CREATE POLICY "Users can insert their own chats" ON public."Chat"
FOR INSERT WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update their own chats" ON public."Chat"
FOR UPDATE USING (auth.uid() = "userId");

CREATE POLICY "Users can delete their own chats" ON public."Chat"
FOR DELETE USING (auth.uid() = "userId");

-- Create secure RLS policies for Document table
CREATE POLICY "Users can view their own documents" ON public."Document"
FOR SELECT USING (auth.uid() = "userId");

CREATE POLICY "Users can insert their own documents" ON public."Document"
FOR INSERT WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update their own documents" ON public."Document"
FOR UPDATE USING (auth.uid() = "userId");

CREATE POLICY "Users can delete their own documents" ON public."Document"
FOR DELETE USING (auth.uid() = "userId");

-- Create secure RLS policies for Message table (based on chat ownership)
CREATE POLICY "Users can view messages from their chats" ON public."Message"
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public."Chat" 
    WHERE public."Chat".id = public."Message"."chatId" 
    AND public."Chat"."userId" = auth.uid()
  )
);

CREATE POLICY "Users can insert messages to their chats" ON public."Message"
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public."Chat" 
    WHERE public."Chat".id = public."Message"."chatId" 
    AND public."Chat"."userId" = auth.uid()
  )
);

-- Create secure RLS policies for Message_v2 table (based on chat ownership)
CREATE POLICY "Users can view messages from their chats v2" ON public."Message_v2"
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public."Chat" 
    WHERE public."Chat".id = public."Message_v2"."chatId" 
    AND public."Chat"."userId" = auth.uid()
  )
);

CREATE POLICY "Users can insert messages to their chats v2" ON public."Message_v2"
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public."Chat" 
    WHERE public."Chat".id = public."Message_v2"."chatId" 
    AND public."Chat"."userId" = auth.uid()
  )
);

-- Create secure RLS policies for Stream table (based on chat ownership)
CREATE POLICY "Users can view streams from their chats" ON public."Stream"
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public."Chat" 
    WHERE public."Chat".id = public."Stream"."chatId" 
    AND public."Chat"."userId" = auth.uid()
  )
);

CREATE POLICY "Users can insert streams to their chats" ON public."Stream"
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public."Chat" 
    WHERE public."Chat".id = public."Stream"."chatId" 
    AND public."Chat"."userId" = auth.uid()
  )
);

-- Create secure RLS policies for Suggestion table
CREATE POLICY "Users can view their own suggestions" ON public."Suggestion"
FOR SELECT USING (auth.uid() = "userId");

CREATE POLICY "Users can insert their own suggestions" ON public."Suggestion"
FOR INSERT WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update their own suggestions" ON public."Suggestion"
FOR UPDATE USING (auth.uid() = "userId");

CREATE POLICY "Users can delete their own suggestions" ON public."Suggestion"
FOR DELETE USING (auth.uid() = "userId");

-- Create secure RLS policies for Vote table (based on chat ownership)
CREATE POLICY "Users can view votes from their chats" ON public."Vote"
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public."Chat" 
    WHERE public."Chat".id = public."Vote"."chatId" 
    AND public."Chat"."userId" = auth.uid()
  )
);

CREATE POLICY "Users can insert votes to their chats" ON public."Vote"
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public."Chat" 
    WHERE public."Chat".id = public."Vote"."chatId" 
    AND public."Chat"."userId" = auth.uid()
  )
);

CREATE POLICY "Users can update votes in their chats" ON public."Vote"
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public."Chat" 
    WHERE public."Chat".id = public."Vote"."chatId" 
    AND public."Chat"."userId" = auth.uid()
  )
);

CREATE POLICY "Users can delete votes from their chats" ON public."Vote"
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public."Chat" 
    WHERE public."Chat".id = public."Vote"."chatId" 
    AND public."Chat"."userId" = auth.uid()
  )
);

-- Fix User table policies - remove overly permissive policies and add secure ones
DROP POLICY IF EXISTS "Allow all operations on User" ON public."User";

CREATE POLICY "Users can view their own profile" ON public."User"
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public."User"
FOR UPDATE USING (auth.uid() = id);

-- Users should not be able to insert directly into User table (handled by auth)
-- Users should not be able to delete their own User record (use Supabase auth for this)