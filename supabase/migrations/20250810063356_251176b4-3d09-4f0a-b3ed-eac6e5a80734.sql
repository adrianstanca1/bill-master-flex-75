-- Enable required extensions
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Unschedule existing job if present (no-op if missing)
select cron.unschedule('task-scheduler-daily-0600');

-- Schedule daily invocation at 06:00 UTC
select cron.schedule(
  'task-scheduler-daily-0600',
  '0 6 * * *',
  $$
  select net.http_post(
    url := 'https://tjgbyygllssqsywxpxqe.supabase.co/functions/v1/task-scheduler',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := '{"trigger":"cron"}'::jsonb
  );
  $$
);
