-- Enable required extensions (idempotent)
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Schedule daily invocation at 06:00 UTC using a new job name to avoid permissions on cron.job
select cron.schedule(
  'task-scheduler-daily-0600-v2',
  '0 6 * * *',
  $$
  select net.http_post(
    url := 'https://tjgbyygllssqsywxpxqe.supabase.co/functions/v1/task-scheduler',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZ2J5eWdsbHNzcXN5d3hweHFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjU0OTQsImV4cCI6MjA2OTI0MTQ5NH0.FA1X97r-Y7nMcDqBQiGHYYE4yo46ZHOKHiw2AAM8pRA"}'::jsonb,
    body := '{"trigger":"cron"}'::jsonb
  );
  $$
);
