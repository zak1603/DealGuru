-- Sign-ups and the weekly deals newsletter.
--
-- Every account gets a profile row with its email, when it joined, and whether it
-- ticked "Email me the latest deals" (with the time it agreed or unsubscribed, as
-- a record of consent). Admins can list sign-ups with admin_signups().
-- Scheduled jobs call the "newsletter" Edge Function, which sends through Brevo.

create extension if not exists pg_net with schema extensions;
-- As in Supabase's Cron docs.
create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

-- Profiles: who signed up, and their newsletter choice --------------------------

alter table public.profiles
  add column if not exists email text,
  add column if not exists first_name text constraint profiles_first_name_length check (char_length(first_name) <= 60),
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists newsletter boolean not null default false,
  add column if not exists newsletter_consent_at timestamptz,
  add column if not exists newsletter_unsubscribed_at timestamptz,
  add column if not exists welcome_sent_at timestamptz;

-- Shoppers may change their location, name and newsletter choice, but not their
-- email or the consent record, which only the database sets.
revoke insert, update on public.profiles from authenticated;
grant insert (id, location_label, latitude, longitude, updated_at) on public.profiles to authenticated;
grant update (id, location_label, latitude, longitude, updated_at, first_name, newsletter) on public.profiles to authenticated;

create or replace function public.stamp_newsletter_choice()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.newsletter_consent_at := case when new.newsletter then now() end;
    new.newsletter_unsubscribed_at := null;
    new.welcome_sent_at := null;
  elsif new.newsletter is distinct from old.newsletter then
    if new.newsletter then
      new.newsletter_consent_at := now();
    else
      new.newsletter_unsubscribed_at := now();
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists stamp_newsletter_choice on public.profiles;
create trigger stamp_newsletter_choice
  before insert or update on public.profiles
  for each row execute function public.stamp_newsletter_choice();

-- A profile for every new account. The sign-up form sends first_name and
-- newsletter; Google sends given_name.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, first_name, newsletter)
  values (
    new.id,
    new.email,
    left(coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'first_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'given_name'), ''),
      nullif(split_part(trim(new.raw_user_meta_data ->> 'full_name'), ' ', 1), '')
    ), 60),
    coalesce(new.raw_user_meta_data ->> 'newsletter' = 'true', false)
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();

-- Accounts made before this change.
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do update set email = excluded.email;

revoke execute on function public.stamp_newsletter_choice() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_user_email_change() from public, anon, authenticated;

-- The sign-ups list on the admin page -------------------------------------------

create or replace function public.admin_signups()
returns table (
  email text,
  first_name text,
  joined_at timestamptz,
  confirmed boolean,
  signed_up_with text,
  newsletter boolean,
  newsletter_consent_at timestamptz,
  newsletter_unsubscribed_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    p.email,
    p.first_name,
    p.created_at,
    u.email_confirmed_at is not null,
    coalesce(u.raw_app_meta_data ->> 'provider', 'email'),
    p.newsletter,
    p.newsletter_consent_at,
    p.newsletter_unsubscribed_at
  from public.profiles p
  join auth.users u on u.id = p.id
  where (select public.is_admin())
  order by p.created_at desc;
$$;

revoke execute on function public.admin_signups() from public, anon;
grant execute on function public.admin_signups() to authenticated;

-- A log of newsletters sent, shown on the admin page ------------------------------

create table if not exists public.newsletter_sends (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('welcome', 'weekly')),
  sent_at timestamptz not null default now(),
  recipients integer not null,
  deals integer not null,
  campaign_id bigint
);

alter table public.newsletter_sends enable row level security;
revoke all on public.newsletter_sends from anon, authenticated;
grant select on public.newsletter_sends to authenticated;

drop policy if exists "Admins can read newsletter sends" on public.newsletter_sends;
create policy "Admins can read newsletter sends"
  on public.newsletter_sends for select
  to authenticated
  using ((select public.is_admin()));

-- Scheduled jobs ------------------------------------------------------------------

-- A random secret the jobs send to the Edge Function, and that signs unsubscribe
-- links. It never leaves the database: the function reads it from Vault directly.
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'newsletter_secret') then
    perform vault.create_secret(
      encode(extensions.gen_random_bytes(32), 'hex'),
      'newsletter_secret',
      'Shared by the newsletter cron jobs and the newsletter Edge Function'
    );
  end if;
end;
$$;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.call_newsletter(action text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform net.http_post(
    url := 'https://oulxrmolepbcshxjwjch.supabase.co/functions/v1/newsletter',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-newsletter-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'newsletter_secret')
    ),
    body := jsonb_build_object('action', action),
    timeout_milliseconds := 120000
  );
end;
$$;

revoke execute on function private.call_newsletter(text) from public, anon, authenticated;

-- Confirmed subscribers still waiting for their welcome email. Anyone whose welcome
-- keeps failing (for example a mistyped address) drops off after two days, so the
-- job doesn't retry them forever.
create or replace function private.pending_welcomes(max_people integer)
returns table (id uuid, email text, first_name text, consent_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, u.email::text, p.first_name, p.newsletter_consent_at
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.newsletter
    and p.welcome_sent_at is null
    and u.email_confirmed_at is not null
    and u.email is not null
    and p.newsletter_consent_at > now() - interval '2 days'
  order by p.created_at
  limit max_people;
$$;

revoke execute on function private.pending_welcomes(integer) from public, anon, authenticated;

-- Welcome emails: checks every 10 minutes, and only calls the function when a
-- confirmed subscriber is still waiting for one.
select cron.schedule(
  'newsletter-welcome',
  '*/10 * * * *',
  $job$
  select private.call_newsletter('welcome')
  where exists (select 1 from private.pending_welcomes(1));
  $job$
);

-- Daily: picks up anyone who unsubscribed with the link in a Brevo email.
-- 02:15 UTC is 04:15 in South Africa.
select cron.schedule('newsletter-sync', '15 2 * * *', $job$ select private.call_newsletter('sync'); $job$);

-- Weekly deals email: Thursdays 06:00 UTC, which is 08:00 in South Africa.
select cron.schedule('newsletter-weekly', '0 6 * * 4', $job$ select private.call_newsletter('weekly'); $job$);
