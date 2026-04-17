-- Bridge mentorship schema — run in Supabase SQL Editor (Dashboard → SQL → New query).
-- Safe to re-run on a fresh project; drops and recreates public tables listed below.

-- ─── Clean slate (dev / first-time setup) ───────────────────────────────────
drop table if exists public.reviews cascade;
drop table if exists public.sessions cascade;
drop table if exists public.mentor_profiles cascade;

-- ─── Tables ─────────────────────────────────────────────────────────────────
-- user_id is nullable so demo seed rows can exist without auth.users FK rows.
create table public.mentor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  name text not null,
  email text,
  title text,
  company text,
  industry text,
  bio text,
  years_experience int,
  expertise jsonb not null default '[]'::jsonb,
  rating decimal(4, 2) not null default 0,
  total_sessions int not null default 0,
  available boolean not null default true,
  created_at timestamptz not null default now(),
  -- Lowercased json text so PostgREST ilike can match skill searches (tags + bio-in-json).
  expertise_search text generated always as (lower(expertise::text)) stored
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  mentee_id uuid not null references auth.users (id) on delete cascade,
  mentor_id uuid not null references public.mentor_profiles (id) on delete restrict,
  session_type text not null,
  scheduled_date timestamptz,
  status text not null default 'pending',
  message text,
  created_at timestamptz not null default now(),
  constraint sessions_session_type_check check (
    session_type in ('career_advice', 'interview_prep', 'resume_review', 'networking')
  ),
  constraint sessions_status_check check (
    status in ('pending', 'accepted', 'declined', 'completed')
  )
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  reviewer_id uuid not null references auth.users (id) on delete cascade,
  rating int not null,
  comment text,
  created_at timestamptz not null default now(),
  constraint reviews_rating_check check (rating >= 1 and rating <= 5)
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table public.mentor_profiles enable row level security;
alter table public.sessions enable row level security;
alter table public.reviews enable row level security;

-- mentor_profiles: public read; mentors manage their own row
create policy "mentor_profiles_select_public"
  on public.mentor_profiles for select
  using (true);

create policy "mentor_profiles_insert_own"
  on public.mentor_profiles for insert
  with check (auth.uid() is not null and auth.uid() = user_id);

create policy "mentor_profiles_update_own"
  on public.mentor_profiles for update
  using (auth.uid() is not null and auth.uid() = user_id)
  with check (auth.uid() is not null and auth.uid() = user_id);

-- sessions: mentee inserts; participants read; mentor updates (e.g. status)
create policy "sessions_insert_as_mentee"
  on public.sessions for insert
  with check (auth.uid() = mentee_id);

create policy "sessions_select_participants"
  on public.sessions for select
  using (
    auth.uid() = mentee_id
    or exists (
      select 1
      from public.mentor_profiles mp
      where mp.id = sessions.mentor_id
        and mp.user_id = auth.uid()
    )
  );

create policy "sessions_update_by_mentor"
  on public.sessions for update
  using (
    exists (
      select 1
      from public.mentor_profiles mp
      where mp.id = sessions.mentor_id
        and mp.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.mentor_profiles mp
      where mp.id = sessions.mentor_id
        and mp.user_id = auth.uid()
    )
  );

-- reviews: public read; reviewer inserts/deletes own
create policy "reviews_select_public"
  on public.reviews for select
  using (true);

create policy "reviews_insert_as_reviewer"
  on public.reviews for insert
  with check (auth.uid() = reviewer_id);

create policy "reviews_delete_own"
  on public.reviews for delete
  using (auth.uid() = reviewer_id);

-- ─── Seed: 15 demo mentors (no auth.users rows; user_id left null) ───────────
insert into public.mentor_profiles (
  user_id, name, email, title, company, industry, bio, years_experience, expertise, rating, total_sessions, available
) values
  (null, 'Aisha Patel', 'aisha.patel.demo@bridge.app', 'Senior Software Engineer', 'Stripe', 'tech',
   'Full-stack engineer focused on distributed systems and developer tooling. I help engineers navigate Big Tech interviews and grow into strong generalists.',
   9, '["System Design", "JavaScript", "Career Growth", "Interview Prep"]'::jsonb, 4.90, 87, true),
  (null, 'Marcus Webb', 'marcus.webb.demo@bridge.app', 'Investment Analyst', 'Blackstone', 'finance',
   'Private equity analyst helping candidates break into finance from non-target schools and career switches.',
   7, '["Private Equity", "Financial Modeling", "Networking", "Resume Review"]'::jsonb, 4.75, 54, true),
  (null, 'Dr. Lena Kim', 'lena.kim.demo@bridge.app', 'Clinical Data Scientist', 'Mayo Clinic', 'healthcare',
   'Bridging clinical practice and ML; I mentor transitions from bedside roles into health-tech and data science.',
   11, '["Health Data", "Python", "Clinical Research", "Career Transitions"]'::jsonb, 4.85, 63, true),
  (null, 'Jordan Rivers', 'jordan.rivers.demo@bridge.app', 'Head of Growth', 'Notion', 'marketing',
   'Scaled B2B SaaS from zero to eight figures. Focus on GTM, content-led growth, and metrics that matter early.',
   8, '["GTM Strategy", "Content Marketing", "Analytics", "B2B SaaS"]'::jsonb, 4.65, 41, true),
  (null, 'Tariq Hassan', 'tariq.hassan.demo@bridge.app', 'ML Engineer', 'DeepMind', 'data science',
   'Research-to-production ML mentor for folks entering industry from bootcamps, MS, or PhD programs.',
   6, '["Machine Learning", "Python", "Research", "Deep Learning"]'::jsonb, 4.92, 72, true),
  (null, 'Sofia Reyes', 'sofia.reyes.demo@bridge.app', 'Product Manager', 'Figma', 'tech',
   'Designer-to-PM pivot; I coach prioritization, roadmapping, and stakeholder alignment for product careers.',
   5, '["Product Strategy", "UX", "Roadmapping", "Career Pivots"]'::jsonb, 4.70, 39, true),
  (null, 'Daniel Osei', 'daniel.osei.demo@bridge.app', 'Venture Capital Associate', 'Sequoia Capital', 'finance',
   'Former founder turned VC. Pitch decks, term sheets, and fundraising strategy for first-time founders.',
   10, '["Venture Capital", "Fundraising", "Pitch Decks", "Startup Strategy"]'::jsonb, 4.88, 58, true),
  (null, 'Priya Nair', 'priya.nair.demo@bridge.app', 'Biotech Consultant', 'McKinsey & Company', 'healthcare',
   'MD background in healthcare strategy; mentoring for life sciences consulting and med-tech paths.',
   12, '["Healthcare Strategy", "Life Sciences", "Consulting", "Med-Tech"]'::jsonb, 4.60, 47, true),
  (null, 'Ethan Zhao', 'ethan.zhao.demo@bridge.app', 'Data Engineering Lead', 'Snowflake', 'data science',
   'Modern data stack mentor: warehouses, pipelines, dbt, and cloud infrastructure at scale.',
   8, '["Data Engineering", "SQL", "Cloud", "dbt", "Spark"]'::jsonb, 4.78, 66, true),
  (null, 'Camille Fontaine', 'camille.fontaine.demo@bridge.app', 'Brand Strategist', 'LVMH', 'marketing',
   'Luxury brand builder across EU and NA; personal branding and premium consumer marketing.',
   14, '["Brand Strategy", "Luxury Marketing", "Storytelling", "Personal Branding"]'::jsonb, 4.55, 33, true),
  (null, 'Ryan Nakamura', 'ryan.nakamura.demo@bridge.app', 'DevOps Engineer', 'Cloudflare', 'tech',
   'Platform/SRE mentor for Kubernetes, CI/CD, observability, and reliability engineering careers.',
   7, '["Kubernetes", "CI/CD", "AWS", "SRE", "Observability"]'::jsonb, 4.82, 45, true),
  (null, 'Amara Diallo', 'amara.diallo.demo@bridge.app', 'UX Research Lead', 'Spotify', 'tech',
   'Mixed-methods researcher; inclusive design, qualitative methods, and portfolio reviews for researchers.',
   9, '["UX Research", "Inclusive Design", "Qualitative Methods", "Portfolio Review"]'::jsonb, 4.91, 79, true),
  (null, 'Nina Kowalski', 'nina.kowalski.demo@bridge.app', 'Quantitative Researcher', 'Two Sigma', 'finance',
   'Systematic trading and research interviews; stochastic calculus, Python, and sell-side to buy-side moves.',
   9, '["Quant Finance", "Python", "Statistics", "Interview Prep"]'::jsonb, 4.83, 51, true),
  (null, 'Omar Haddad', 'omar.haddad.demo@bridge.app', 'Director of Product Marketing', 'HubSpot', 'marketing',
   'PMM leader for PLG and enterprise motions; positioning, launches, and cross-functional leadership.',
   13, '["Product Marketing", "Positioning", "Launch Strategy", "PLG"]'::jsonb, 4.72, 44, true),
  (null, 'Grace Okonkwo', 'grace.okonkwo.demo@bridge.app', 'Staff Data Scientist', 'Airbnb', 'data science',
   'Experimentation and causal inference at scale; DS leveling, metrics, and cross-functional influence.',
   10, '["Experimentation", "Causal Inference", "Metrics", "Leadership"]'::jsonb, 4.87, 91, true);

-- ─── API access (Supabase Data API) ─────────────────────────────────────────
grant usage on schema public to anon, authenticated;

grant select on public.mentor_profiles to anon, authenticated;
grant insert, update on public.mentor_profiles to authenticated;

grant select, insert, update on public.sessions to authenticated;

grant select on public.reviews to anon, authenticated;
grant insert, delete on public.reviews to authenticated;
