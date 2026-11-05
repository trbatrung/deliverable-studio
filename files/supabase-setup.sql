-- Deliverable enquiry form: one-shot Supabase setup. LAST launch step.
--
-- When you set up Supabase:
--   1. Create a new project (pick the Singapore region, closest to HCMC).
--   2. Run this whole file in the SQL editor.
--   3. Copy the project URL and the publishable key from Project Settings > API
--      into SUPABASE_URL and SUPABASE_ANON_KEY at the top of script.js, then push.
--   4. Send one real enquiry from the live site and check the row appears.
--
-- Free projects pause after about a week without activity. Plan for it before
-- outreach starts: a paid plan, or a weekly keep-alive, or a lead alert email
-- so a paused database never loses an enquiry silently.

create table if not exists public."Leads" (
  id             bigint generated always as identity primary key,
  created_at     timestamptz not null default now(),
  name           text not null,
  email          text not null,
  company        text,
  message        text not null,
  -- Consent record required by Vietnam's Law 91/2025 and Decree 356/2025:
  -- when they agreed (set by the database), the wording, and the notice version.
  consent_at     timestamptz not null default now(),
  consent_text   text not null,
  notice_version text not null
);

-- The site's visitors may add a row but never read, change or delete one.
alter table public."Leads" enable row level security;

drop policy if exists "Visitors can send an enquiry" on public."Leads";
create policy "Visitors can send an enquiry"
  on public."Leads" for insert
  to anon
  with check (true);

revoke select, update, delete on public."Leads" from anon;
grant insert on public."Leads" to anon;

-- If the security branch's server function (api/lead.js, secret key) ships,
-- drop the policy above so the browser can no longer write directly:
--   drop policy "Visitors can send an enquiry" on public."Leads";
