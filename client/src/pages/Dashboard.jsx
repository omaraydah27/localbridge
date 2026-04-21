// TODO: getMySessions() batch-selects only 'id, name, title' from mentor_profiles, so sessions
// arrive enriched with mentor_name and mentor_title but NOT company or image_url.
// The secondary batch query below (supabase directly, selecting id/name/title/company/image_url/tier)
// fills that gap for the My Mentors section. If getMySessions() is ever updated to include those
// fields in its batch select, the secondary fetch in this component can be removed.

import { useState, useEffect, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { getMySessions } from '../api/sessions';
import { SESSION_TYPES } from '../constants/sessionTypes';
import supabase from '../api/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import PageGutterAtmosphere from '../components/PageGutterAtmosphere';
import Reveal from '../components/Reveal';

// ─── Constants ────────────────────────────────────────────────────────────────

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf3]';

const SESSION_TYPE_MAP = Object.fromEntries(SESSION_TYPES.map((t) => [t.key, t]));

const AVATAR_COLORS = [
  'bg-violet-200 text-violet-800',
  'bg-amber-200 text-amber-800',
  'bg-emerald-200 text-emerald-800',
  'bg-sky-200 text-sky-800',
  'bg-rose-200 text-rose-800',
  'bg-indigo-200 text-indigo-800',
  'bg-teal-200 text-teal-800',
  'bg-orange-200 text-orange-800',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAvatarColor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function getFirstName(user) {
  const full = user?.user_metadata?.full_name || user?.user_metadata?.name || '';
  if (full.trim()) return full.trim().split(/\s+/)[0];
  return user?.email?.split('@')[0] ?? 'there';
}

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function getTodayLabel() {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function formatSessionDate(iso) {
  if (!iso) return 'No date set';
  const d = new Date(iso);
  const date = d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return `${date} · ${time}`;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconCalendar({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function IconClock({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function IconCheckCircle({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m22 4-10 10-3-3" />
    </svg>
  );
}

function IconUsers({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconChevronRight({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function IconSearch({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const config = {
    pending:   { classes: 'bg-amber-50 text-amber-800 border border-amber-200/80',   label: 'Pending' },
    accepted:  { classes: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80', label: 'Confirmed' },
    completed: { classes: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80', label: 'Completed' },
    declined:  { classes: 'bg-red-50 text-red-800 border border-red-200/80',         label: 'Declined' },
  };
  const { classes, label } = config[status] ?? {
    classes: 'bg-stone-100 text-stone-600',
    label: status ?? 'Unknown',
  };
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${classes}`}>
      {label}
    </span>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({ id, children, count }) {
  return (
    <div className="mb-5 flex items-center gap-2.5">
      <h2 id={id} className="font-display text-xl font-semibold text-stone-900">
        {children}
      </h2>
      {count != null && (
        <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-stone-100 px-1.5 text-xs font-semibold text-stone-500">
          {count}
        </span>
      )}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, barClass, iconBgClass }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-stone-200/80 bg-white/95 p-5 shadow-sm ring-1 ring-stone-900/[0.02] sm:p-6">
      <div
        aria-hidden
        className={`absolute inset-x-0 top-0 h-0.5 ${barClass}`}
      />
      <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl ${iconBgClass}`}>
        {icon}
      </div>
      <p className="font-display text-3xl font-bold tabular-nums leading-none text-stone-900">{value}</p>
      <p className="mt-1.5 text-sm text-stone-500">{label}</p>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ message, cta, href }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200/90 bg-stone-50/60 px-6 py-12 text-center">
      <p className="text-sm font-medium text-stone-600">{message}</p>
      {cta && href ? (
        <Link
          to={href}
          className={`mt-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-stone-900 to-stone-800 px-5 py-2.5 text-sm font-semibold text-amber-50 shadow-md transition hover:from-stone-800 hover:to-stone-700 ${focusRing}`}
        >
          {cta}
        </Link>
      ) : null}
    </div>
  );
}

// ─── Session card ─────────────────────────────────────────────────────────────

function SessionCard({ session }) {
  const type = SESSION_TYPE_MAP[session.session_type];
  const name = session.mentor_name ?? 'Unknown mentor';
  const title = session.mentor_title;

  return (
    <Link
      to={`/mentors/${session.mentor_id}`}
      className={`group flex flex-col gap-3 rounded-2xl border border-stone-200/80 bg-white/95 p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-orange-200/55 hover:shadow-md sm:flex-row sm:items-center sm:gap-5 sm:p-5 ${focusRing}`}
    >
      {/* Session-type icon */}
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${type?.accent.iconBg ?? 'bg-stone-100'}`}
        aria-hidden
      >
        {type?.icon ?? '📋'}
      </div>

      {/* Mentor + session-type info */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-stone-900 transition group-hover:text-orange-900">{name}</p>
        {title ? <p className="truncate text-sm text-stone-500">{title}</p> : null}
        <p className="mt-0.5 text-xs font-medium text-stone-400">{type?.name ?? session.session_type}</p>
      </div>

      {/* Date + status badge */}
      <div className="flex shrink-0 flex-row items-center gap-2 sm:flex-col sm:items-end sm:gap-1.5">
        <StatusBadge status={session.status} />
        <p className="text-xs text-stone-400">{formatSessionDate(session.scheduled_date)}</p>
      </div>

      <IconChevronRight className="hidden h-4 w-4 shrink-0 text-stone-300 transition group-hover:text-orange-400 sm:block" />
    </Link>
  );
}

// ─── Mentor card ──────────────────────────────────────────────────────────────

function MentorCard({ mentor }) {
  const color = getAvatarColor(mentor.name ?? '');
  const inits = getInitials(mentor.name ?? '');

  return (
    <Link
      to={`/mentors/${mentor.id}`}
      className={`group flex items-center gap-4 rounded-2xl border border-stone-200/80 bg-white/95 p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-orange-200/55 hover:shadow-md sm:p-5 ${focusRing}`}
    >
      {mentor.image_url ? (
        <img
          src={mentor.image_url}
          alt=""
          className="h-12 w-12 shrink-0 rounded-xl object-cover ring-2 ring-white shadow-sm"
        />
      ) : (
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-sm ring-2 ring-white ${color}`}
          aria-hidden
        >
          {inits}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-stone-900 transition group-hover:text-orange-900">
          {mentor.name ?? 'Unknown mentor'}
        </p>
        {mentor.title ? (
          <p className="truncate text-xs text-stone-500">{mentor.title}</p>
        ) : null}
        {mentor.company ? (
          <p className="truncate text-xs font-medium text-amber-800">{mentor.company}</p>
        ) : null}
      </div>

      <IconChevronRight className="h-4 w-4 shrink-0 text-stone-300 transition group-hover:text-orange-400" />
    </Link>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [mentorMap, setMentorMap] = useState({});
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading || !user) return;

    setDataLoading(true);
    setError(null);

    void (async () => {
      const { data, error: sessErr } = await getMySessions();

      if (sessErr) {
        setError(sessErr.message ?? 'Could not load your sessions.');
        setDataLoading(false);
        return;
      }

      // Keep only sessions where the logged-in user is the mentee.
      const rows = (data ?? []).filter((s) => s.mentee_id === user.id);
      setSessions(rows);

      // Batch-fetch mentor profile details needed for the My Mentors section.
      // getMySessions() only gives us name + title; we need company and image_url too.
      const ids = [...new Set(rows.map((s) => s.mentor_id).filter(Boolean))];
      if (ids.length > 0) {
        const { data: profiles } = await supabase
          .from('mentor_profiles')
          .select('id, name, title, company, image_url, tier')
          .in('id', ids);
        setMentorMap(Object.fromEntries((profiles ?? []).map((p) => [p.id, p])));
      }

      setDataLoading(false);
    })();
  }, [user, authLoading]);

  // ── Derived data ────────────────────────────────────────────────────────────

  const upcomingSessions = useMemo(() => {
    const now = new Date();
    return sessions
      .filter(
        (s) =>
          (s.status === 'pending' || s.status === 'accepted') &&
          (!s.scheduled_date || new Date(s.scheduled_date) > now),
      )
      .sort((a, b) => {
        if (!a.scheduled_date) return 1;
        if (!b.scheduled_date) return -1;
        return new Date(a.scheduled_date) - new Date(b.scheduled_date);
      });
  }, [sessions]);

  const historySessions = useMemo(() => {
    const now = new Date();
    return sessions
      .filter(
        (s) =>
          s.status === 'completed' ||
          s.status === 'declined' ||
          (s.scheduled_date && new Date(s.scheduled_date) <= now),
      )
      .sort(
        (a, b) =>
          new Date(b.scheduled_date ?? b.created_at) -
          new Date(a.scheduled_date ?? a.created_at),
      );
  }, [sessions]);

  const uniqueMentors = useMemo(() => {
    const seen = new Set();
    const result = [];
    for (const s of sessions) {
      if (!s.mentor_id || seen.has(s.mentor_id)) continue;
      seen.add(s.mentor_id);
      result.push(
        mentorMap[s.mentor_id] ?? {
          id: s.mentor_id,
          name: s.mentor_name,
          title: s.mentor_title,
          company: null,
          image_url: null,
        },
      );
    }
    return result;
  }, [sessions, mentorMap]);

  // ── Early returns ───────────────────────────────────────────────────────────

  if (authLoading) return <LoadingSpinner label="Loading…" className="min-h-screen" />;
  if (!user) return <Navigate to="/login" replace />;
  if (dataLoading) return <LoadingSpinner label="Loading your dashboard…" className="min-h-screen" />;

  // ── Stats ───────────────────────────────────────────────────────────────────

  const totalBooked = sessions.length;
  const upcomingCount = upcomingSessions.length;
  const completedCount = sessions.filter((s) => s.status === 'completed').length;
  const mentorCount = uniqueMentors.length;

  const firstName = getFirstName(user);
  const greeting = getTimeGreeting();
  const todayLabel = getTodayLabel();

  const stats = [
    {
      label: 'Sessions Booked',
      value: totalBooked,
      icon: <IconCalendar className="h-5 w-5 text-orange-700" />,
      barClass: 'bg-gradient-to-r from-orange-400/60 via-amber-300/40 to-orange-400/60',
      iconBgClass: 'bg-orange-50',
    },
    {
      label: 'Upcoming',
      value: upcomingCount,
      icon: <IconClock className="h-5 w-5 text-sky-700" />,
      barClass: 'bg-gradient-to-r from-sky-400/60 via-sky-300/40 to-sky-400/60',
      iconBgClass: 'bg-sky-50',
    },
    {
      label: 'Completed',
      value: completedCount,
      icon: <IconCheckCircle className="h-5 w-5 text-emerald-700" />,
      barClass: 'bg-gradient-to-r from-emerald-400/60 via-teal-300/40 to-emerald-400/60',
      iconBgClass: 'bg-emerald-50',
    },
    {
      label: 'Mentors Worked With',
      value: mentorCount,
      icon: <IconUsers className="h-5 w-5 text-violet-700" />,
      barClass: 'bg-gradient-to-r from-violet-400/60 via-purple-300/40 to-violet-400/60',
      iconBgClass: 'bg-violet-50',
    },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <main
      className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-[#fef9f1] via-[#fdf7ef] to-[#faf4eb]"
      aria-label="Dashboard"
    >
      <PageGutterAtmosphere />

      {/* ── Welcome header ──────────────────────────────────────────────────── */}
      <header className="relative z-[2] border-b border-stone-200/70 bg-gradient-to-b from-white/70 via-orange-50/30 to-transparent px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-10 h-64 w-64 rounded-full bg-gradient-to-br from-amber-300/25 via-orange-200/15 to-transparent blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl pb-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
                {todayLabel}
              </p>
              <h1 className="mt-1.5 font-display text-3xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-[2.25rem]">
                Good {greeting},{' '}
                <span className="text-gradient-bridge">{firstName}</span>
              </h1>
              <p className="mt-2 text-sm text-stone-500">
                {upcomingCount > 0
                  ? `You have ${upcomingCount} upcoming ${upcomingCount === 1 ? 'session' : 'sessions'}.`
                  : 'No upcoming sessions — find a mentor whenever you\'re ready.'}
              </p>
            </div>

            <Link
              to="/mentors"
              className={`inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-gradient-to-r from-stone-900 to-stone-800 px-5 py-2.5 text-sm font-semibold text-amber-50 shadow-md transition hover:from-stone-800 hover:to-stone-700 sm:self-auto ${focusRing}`}
            >
              <IconSearch className="h-4 w-4" />
              Find a Mentor
            </Link>
          </div>
        </div>
      </header>

      {/* ── Page content ────────────────────────────────────────────────────── */}
      <div className="relative z-[2] mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 sm:pt-10 lg:px-8">

        {/* Error banner */}
        {error ? (
          <div className="mb-8 rounded-2xl border border-red-200/90 bg-red-50/95 px-5 py-5 text-sm text-red-900 shadow-sm">
            <p className="font-semibold">Couldn&apos;t load your dashboard</p>
            <p className="mt-1 text-red-800/90">{error}</p>
          </div>
        ) : null}

        {/* ── Section 2: Stats ──────────────────────────────────────────────── */}
        <Reveal>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>
        </Reveal>

        {/* ── Section 3: Upcoming Sessions ──────────────────────────────────── */}
        <Reveal delay={60} className="mt-10">
          <section aria-labelledby="upcoming-heading">
            <SectionHeading id="upcoming-heading" count={upcomingSessions.length}>
              Upcoming Sessions
            </SectionHeading>

            {upcomingSessions.length > 0 ? (
              <div className="flex flex-col gap-3">
                {upcomingSessions.map((s) => (
                  <SessionCard key={s.id} session={s} />
                ))}
              </div>
            ) : (
              <EmptyState
                message="No upcoming sessions"
                cta="Browse Mentors"
                href="/mentors"
              />
            )}
          </section>
        </Reveal>

        {/* ── Section 4: Session History ────────────────────────────────────── */}
        <Reveal delay={80} className="mt-10">
          <section aria-labelledby="history-heading">
            <SectionHeading id="history-heading" count={historySessions.length}>
              Session History
            </SectionHeading>

            {historySessions.length > 0 ? (
              <div className="flex flex-col gap-3">
                {historySessions.map((s) => (
                  <SessionCard key={s.id} session={s} />
                ))}
              </div>
            ) : (
              <EmptyState message="No past sessions yet" />
            )}
          </section>
        </Reveal>

        {/* ── Section 5: My Mentors ─────────────────────────────────────────── */}
        <Reveal delay={100} className="mt-10">
          <section aria-labelledby="my-mentors-heading">
            <SectionHeading id="my-mentors-heading" count={uniqueMentors.length}>
              My Mentors
            </SectionHeading>

            {uniqueMentors.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {uniqueMentors.map((m) => (
                  <MentorCard key={m.id} mentor={m} />
                ))}
              </div>
            ) : (
              <EmptyState
                message="You haven't booked with any mentors yet"
                cta="Browse Mentors"
                href="/mentors"
              />
            )}
          </section>
        </Reveal>

      </div>
    </main>
  );
}
