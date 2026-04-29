-- Re-point the daily task-scheduler cron job at the local Supabase
-- instance instead of the hardcoded cloud project URL that earlier
-- migrations baked in.
--
-- The target URL is read from a Postgres setting (`app.functions_url`)
-- so each self-hosted deployment can override it via:
--   ALTER DATABASE postgres SET app.functions_url = 'https://supabase.example.com/functions/v1';
-- and similarly for `app.functions_anon_key`.
--
-- When neither setting is configured we fall back to the local Supabase
-- gateway (Kong on :8000 in the standard self-host docker-compose).

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Drop the legacy jobs that point at the old cloud URL; ignore if absent.
do $$
begin
  perform cron.unschedule('task-scheduler-daily-0600');
exception when others then null;
end $$;

do $$
begin
  perform cron.unschedule('task-scheduler-daily-0600-v2');
exception when others then null;
end $$;

-- Re-create the daily 06:00 UTC job using runtime settings so the URL is
-- whatever the operator configured for this database.
select cron.schedule(
  'task-scheduler-daily-0600-self-hosted',
  '0 6 * * *',
  $$
  select net.http_post(
    url := coalesce(
      current_setting('app.functions_url', true),
      'http://kong:8000/functions/v1'
    ) || '/task-scheduler',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization',
        'Bearer ' || coalesce(current_setting('app.functions_anon_key', true), '')
    ),
    body := '{"trigger":"cron"}'::jsonb
  );
  $$
);
