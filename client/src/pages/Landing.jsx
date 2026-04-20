import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedMentors } from '../api/mentors';
import LoadingSpinner from '../components/LoadingSpinner';
import Reveal from '../components/Reveal';
import { SESSION_TYPES } from '../constants/sessionTypes';
import { useAuth } from '../context/useAuth';

const AVATAR_COLORS = [
  'bg-violet-200 text-violet-900',
  'bg-amber-200 text-amber-900',
  'bg-emerald-200 text-emerald-900',
  'bg-sky-200 text-sky-900',
  'bg-rose-200 text-rose-900',
  'bg-indigo-200 text-indigo-900',
];

const HERO_STACK = [
  { name: 'Maya Chen', role: 'Director of Product', co: 'Series B SaaS', grad: 'from-rose-400 to-orange-500', ring: false },
  { name: 'Jordan Reeves', role: 'Ex-recruiter', co: 'FAANG + startups', grad: 'from-sky-500 to-indigo-600', ring: true },
  { name: 'Elena Voss', role: 'Career switch · RN → UX', co: 'Health tech', grad: 'from-emerald-500 to-teal-600', ring: false },
];

function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function initials(name) {
  return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
}

const focusRing =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf3]';
const focusRingWhite =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-orange-600';

// Clean stroked icons for session types (matches the ones on the profile page).
function SessionTypeIcon({ typeKey, className = 'h-5 w-5' }) {
  switch (typeKey) {
    case 'career_advice':
      return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.5 9.5-3 5-5 3 3-5 5-3Z" />
          </svg>
      );
    case 'interview_prep':
      return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="5" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          </svg>
      );
    case 'resume_review':
      return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v6h6M8 13h8M8 17h5" />
          </svg>
      );
    case 'networking':
      return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
            <circle cx="8" cy="8" r="3" />
            <circle cx="16" cy="8" r="3" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2 20v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1M14 20v-1a5 5 0 0 1 5-5h0a3 3 0 0 1 3 3v3" />
          </svg>
      );
    default:
      return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
      );
  }
}

function Hero() {
  const { user } = useAuth();

  return (
      <section
          aria-labelledby="landing-heading"
          className="relative scroll-mt-20 overflow-hidden bg-bridge-hero-mesh px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-16 lg:px-8"
      >
        <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.4]"
            style={{
              backgroundImage:
                  'url("data:image/svg+xml,%3Csvg width=\'72\' height=\'72\' viewBox=\'0 0 72 72\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' stroke=\'%23d6d3d1\' stroke-opacity=\'0.35\'%3E%3Cpath d=\'M36 0v72M0 36h72\'/%3E%3C/g%3E%3C/svg%3E")',
              backgroundSize: '72px 72px',
            }}
        />
        <div
            aria-hidden
            className="pointer-events-none absolute -right-24 top-20 h-[min(520px,80vw)] w-[min(520px,80vw)] rounded-full bg-gradient-to-br from-amber-300/50 via-orange-200/35 to-transparent blur-3xl"
        />
        <div
            aria-hidden
            className="pointer-events-none absolute -left-40 bottom-10 h-96 w-96 rounded-full bg-orange-200/40 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-12 lg:gap-8 lg:gap-y-16">
          <div className="lg:col-span-6 xl:col-span-6">
            <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-orange-200/80 bg-white/90 px-4 py-1.5 shadow-sm backdrop-blur-md">
            <span className="flex h-2 w-2 shrink-0 items-center justify-center">
              <span className="absolute h-2 w-2 animate-ping rounded-full bg-emerald-400/60" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
            </span>
              <span className="text-xs font-semibold tracking-wide text-stone-700">
              Career mentorship, booked by the hour
            </span>
            </div>

            <h1
                id="landing-heading"
                className="font-display text-balance text-[2.75rem] font-semibold leading-[1.02] tracking-tight text-stone-900 sm:text-[3.25rem] sm:leading-[1.02] lg:text-[3.5rem] xl:text-[3.85rem]"
            >
              Find a mentor who&apos;s{' '}
              <span className="text-gradient-bridge">already done</span>{' '}
              the job you&apos;re chasing.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-600 sm:text-xl sm:leading-relaxed">
              Book a 1-on-1 session with people who&apos;ve lived the version of the story you&apos;re trying to write —
              not strangers guessing from Twitter.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-stone-600">
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span><span className="font-semibold text-stone-900">2,400+</span> vetted mentors</span>
            </span>
              <span className="hidden h-1 w-1 rounded-full bg-stone-300 sm:inline-block" aria-hidden />
              <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span><span className="font-semibold text-stone-900">50+</span> industries</span>
            </span>
              <span className="hidden h-1 w-1 rounded-full bg-stone-300 sm:inline-block" aria-hidden />
              <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Sessions from <span className="font-semibold text-stone-900">30 min</span></span>
            </span>
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                  to="/mentors"
                  className={`inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-9 py-4 text-sm font-semibold text-white shadow-lg shadow-orange-500/35 transition hover:from-orange-500 hover:to-amber-400 hover:shadow-xl ${focusRing}`}
              >
                Browse mentors
              </Link>
              {!user ? (
                  <Link
                      to="/register?intent=mentor"
                      className={`inline-flex items-center justify-center rounded-full border-2 border-stone-900/12 bg-white/95 px-9 py-4 text-sm font-semibold text-stone-900 shadow-sm backdrop-blur-sm transition hover:border-orange-300/70 hover:shadow-md ${focusRing}`}
                  >
                    I want to mentor
                  </Link>
              ) : null}
            </div>

            <div className="mt-12 flex flex-col gap-8 border-t border-stone-200/90 pt-10 sm:flex-row sm:items-center sm:justify-between">
              <dl className="grid grid-cols-3 gap-6 sm:max-w-md sm:gap-8">
                {[
                  { k: '2.4k+', l: 'Mentors' },
                  { k: '85%', l: 'Interview wins' },
                  { k: '4.9★', l: 'Avg. rating' },
                ].map(({ k, l }) => (
                    <div key={l}>
                      <dt className="font-display text-2xl font-semibold tabular-nums text-stone-900 sm:text-3xl">{k}</dt>
                      <dd className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">{l}</dd>
                    </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="relative flex min-h-[400px] items-center justify-center lg:col-span-6 xl:col-span-6 lg:min-h-[520px]">
            <div
                aria-hidden
                className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-orange-500/10 via-transparent to-amber-400/10 blur-2xl"
            />

            <div className="relative w-full max-w-lg lg:max-w-none">
              <div
                  className="absolute -left-2 top-4 z-20 hidden w-[88%] sm:block sm:w-[92%]"
                  style={{ transform: 'rotate(-2.5deg)' }}
              >
                <div className="animate-landing-float rounded-2xl border border-white/90 bg-white/95 p-4 shadow-bridge-glow backdrop-blur-md">
                  <div className="mb-3 flex items-center justify-between border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-400/85" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/85" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/85" />
                      </div>
                      <span className="text-[11px] font-medium text-stone-400">bridge.app / mentors</span>
                    </div>
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600">
                    Saved
                  </span>
                  </div>
                  {HERO_STACK.map((m) => (
                      <div
                          key={m.name}
                          className={`mb-2 flex items-center gap-3 rounded-xl border p-3 last:mb-0 ${
                              m.ring
                                  ? 'border-orange-300/80 bg-gradient-to-r from-orange-50/90 to-amber-50/50 shadow-md ring-2 ring-orange-400/30'
                                  : 'border-stone-100 bg-stone-50/50'
                          }`}
                      >
                        <div className={`h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br ${m.grad} shadow-inner`} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-stone-900">{m.name}</p>
                          <p className="truncate text-xs text-stone-500">
                            {m.role} · {m.co}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-stone-900 px-2.5 py-1 text-[10px] font-bold text-amber-50">
                      Book
                    </span>
                      </div>
                  ))}
                </div>
              </div>

              <div
                  className="relative z-10 mx-auto w-[94%] sm:w-[85%]"
                  style={{ transform: 'rotate(1.5deg)' }}
              >
                <div className="animate-landing-float-delayed rounded-[1.75rem] border border-stone-200/80 bg-white/90 p-5 shadow-bridge-glow backdrop-blur-md sm:p-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-800/80">Session formats</p>
                  <p className="mt-2 font-display text-xl font-semibold text-stone-900">Pick how you want the hour</p>
                  <div className="mt-4 space-y-2">
                    {SESSION_TYPES.slice(0, 3).map((t) => (
                        <div
                            key={t.key}
                            className="flex items-center gap-3 rounded-xl border border-stone-100 bg-stone-50/60 px-3 py-2.5"
                        >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
                        <SessionTypeIcon typeKey={t.key} className="h-4 w-4" />
                      </span>
                          <span className="text-sm font-medium text-stone-800">{t.name}</span>
                          <span className="ml-auto text-xs font-semibold text-stone-500">{t.duration}</span>
                        </div>
                    ))}
                  </div>
                  <Link
                      to="/mentors"
                      className={`mt-5 block w-full rounded-xl bg-stone-900 py-3 text-center text-sm font-semibold text-amber-50 transition hover:bg-stone-800 ${focusRing}`}
                  >
                    Open directory
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  );
}

// Single unified "how it works" section — 3 steps + inline session type strip.
// Replaces the previous HowItWorks + SessionTypes + ValueStrip trio.
function HowItWorks() {
  const STEPS = [
    {
      n: '01',
      title: 'Pick your chapter',
      desc: 'Interview loop, pivot, promo, first job — whatever you\u2019re actually working on. Filter by industry, skill, or just browse.',
    },
    {
      n: '02',
      title: 'Read bios like teammate picks',
      desc: 'Every profile is a real person with a real path. When someone\u2019s story rhymes with yours, that\u2019s your person.',
    },
    {
      n: '03',
      title: 'Book a short, focused session',
      desc: 'Pick a format, suggest a time, add context. Sessions end with a concrete next step — not a "let\u2019s circle back."',
    },
  ];

  return (
      <section id="how-it-works" className="relative scroll-mt-20 px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-14 max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">How it works</p>
            <h2 className="font-display text-balance text-3xl font-semibold text-stone-900 sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
              Three steps. No cold DMs.
            </h2>
          </Reveal>

          {/* Steps */}
          <div className="grid gap-5 md:grid-cols-3 md:gap-6">
            {STEPS.map(({ n, title, desc }, i) => (
                <Reveal key={n} delay={i * 80}>
                  <div className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-stone-200/80 bg-white/90 p-7 shadow-bridge-card transition duration-300 hover:-translate-y-1 hover:border-orange-200/55 hover:shadow-bridge-glow sm:p-8">
                    <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 opacity-0 transition group-hover:opacity-100" />
                    <span className="font-display text-4xl font-semibold leading-none text-orange-200/80 transition group-hover:text-orange-300/95 sm:text-5xl">
                  {n}
                </span>
                    <h3 className="mt-5 font-display text-lg font-semibold text-stone-900 sm:text-xl">{title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-stone-600 sm:text-base">{desc}</p>
                  </div>
                </Reveal>
            ))}
          </div>

          {/* Session types strip — now a subsection under "how it works," not its own section */}
          <Reveal delay={280}>
            <div className="mt-10 rounded-[1.75rem] border border-orange-200/60 bg-gradient-to-br from-white via-orange-50/40 to-amber-50/30 p-6 shadow-bridge-card sm:p-8">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-800/80">Session formats</p>
                  <p className="mt-1 font-display text-lg font-semibold text-stone-900 sm:text-xl">
                    Four ways to use the hour
                  </p>
                </div>
                <p className="text-xs text-stone-500">Mentors choose which formats they offer.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {SESSION_TYPES.map((t) => (
                    <div
                        key={t.key}
                        className="flex flex-col items-start gap-2 rounded-xl border border-stone-200/70 bg-white/90 p-4 transition hover:border-orange-200/60 hover:bg-white"
                    >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 text-orange-700">
                    <SessionTypeIcon typeKey={t.key} />
                  </span>
                      <p className="text-sm font-semibold text-stone-900">{t.name}</p>
                      <p className="text-xs font-medium text-stone-500">{t.duration}</p>
                    </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
  );
}

function MentorPreviewCard({ mentor, spotlight = false }) {
  const color = avatarColor(mentor.name);
  return (
      <div
          className={`group relative flex h-full flex-col gap-4 overflow-hidden rounded-[1.75rem] border bg-white/95 p-6 shadow-bridge-card transition duration-300 hover:-translate-y-1 hover:shadow-bridge-glow ${
              spotlight
                  ? 'border-orange-200/90 ring-1 ring-orange-200/50 hover:border-orange-300/80'
                  : 'border-stone-200/80 hover:border-orange-200/50'
          }`}
      >
        {spotlight ? (
            <span className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
          This week
        </span>
        ) : null}
        <div className={`flex items-center gap-3 ${spotlight ? 'pr-24' : ''}`}>
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xs font-bold shadow-sm ${color}`}>
            {initials(mentor.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-stone-900">{mentor.name}</p>
            <p className="truncate text-xs text-stone-500">
              {mentor.title} · {mentor.company}
            </p>
          </div>
        </div>

        <p className="line-clamp-3 text-sm leading-relaxed text-stone-600">{mentor.bio}</p>

        <div className="flex flex-wrap gap-1.5">
          {mentor.expertise.slice(0, 3).map((tag) => (
              <span
                  key={tag}
                  className="rounded-full border border-orange-100 bg-orange-50/80 px-2.5 py-0.5 text-xs font-medium text-orange-900"
              >
            {tag}
          </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-4">
        <span className="flex items-center gap-1 text-xs font-medium text-stone-500">
          <span className="text-amber-500">★</span>
          {mentor.rating.toFixed(1)} · {mentor.years_experience} yrs
        </span>
          <Link
              to={`/mentors/${mentor.id}`}
              className={`rounded-full bg-gradient-to-r from-stone-900 to-stone-800 px-4 py-2 text-xs font-semibold text-amber-50 transition hover:from-stone-800 hover:to-stone-700 ${focusRing}`}
          >
            Open profile
          </Link>
        </div>
      </div>
  );
}

function FeaturedMentors() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true);
    setError(null);
    /* eslint-enable react-hooks/set-state-in-effect */

    void (async () => {
      const { data, error: fetchError } = await getFeaturedMentors();
      if (cancelled) return;
      setLoading(false);
      if (fetchError) {
        setFeatured([]);
        setError(fetchError.message || 'Could not load featured mentors.');
        return;
      }
      setFeatured(data ?? []);
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  function loadFeatured() {
    setReloadKey((k) => k + 1);
  }

  return (
      <section id="featured-mentors" className="relative scroll-mt-20 overflow-hidden border-y border-stone-200/70 bg-gradient-to-b from-amber-50/40 via-orange-50/25 to-amber-50/30 px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div
            aria-hidden
            className="pointer-events-none absolute -right-32 top-20 h-80 w-80 rounded-full bg-orange-200/25 blur-3xl"
        />
        <div
            aria-hidden
            className="pointer-events-none absolute -left-24 bottom-10 h-64 w-64 rounded-full bg-amber-200/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl">
          <Reveal className="mb-12 flex flex-col justify-between gap-6 lg:mb-14 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">Meet a few mentors</p>
              <h2 className="font-display text-balance text-3xl font-semibold text-stone-900 sm:text-4xl lg:text-[2.65rem] lg:leading-tight">
                Real people, real paths
              </h2>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg">
                A handful of profiles getting traction this week. Tap any card for the full story.
              </p>
            </div>
            <Link
                to="/mentors"
                className={`inline-flex shrink-0 items-center gap-2 self-start rounded-full border-2 border-stone-900/10 bg-white/95 px-6 py-3 text-sm font-semibold text-stone-900 shadow-md shadow-stone-900/5 transition hover:border-orange-300/70 hover:shadow-lg lg:self-auto ${focusRing}`}
            >
              See all mentors
              <span aria-hidden>→</span>
            </Link>
          </Reveal>

          {loading ? (
              <LoadingSpinner label="Pulling featured mentors…" className="py-16" />
          ) : error ? (
              <div className="max-w-xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-900 shadow-sm">
                <p className="font-semibold">That didn&apos;t load</p>
                <p className="mt-1 opacity-90">{error}</p>
                <button
                    type="button"
                    onClick={loadFeatured}
                    className={`mt-4 rounded-full bg-red-900 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 ${focusRing}`}
                >
                  Try again
                </button>
              </div>
          ) : featured.length === 0 ? (
              <div className="rounded-[1.75rem] border border-dashed border-stone-200/90 bg-white/60 px-8 py-14 text-center shadow-sm">
                <p className="font-display text-lg font-semibold text-stone-900">Spotlight is quiet right now</p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-600">
                  The full directory always has people ready to book.
                </p>
                <Link
                    to="/mentors"
                    className={`mt-6 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-7 py-3 text-sm font-semibold text-white shadow-md shadow-orange-500/25 transition hover:from-orange-500 hover:to-amber-400 ${focusRing}`}
                >
                  Browse all mentors
                </Link>
              </div>
          ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featured.slice(0, 3).map((m, i) => (
                    <Reveal key={m.id} delay={i * 70}>
                      <MentorPreviewCard mentor={m} spotlight={i === 0} />
                    </Reveal>
                ))}
              </div>
          )}
        </div>
      </section>
  );
}

const TESTIMONIALS = [
  {
    quote:
        'Two calls in I stopped rewriting my resume for no one. He called out the story I was dodging and we fixed it in an hour.',
    name: 'Tyler N.',
    role: 'Engineer (new gig)',
    initials: 'TN',
  },
  {
    quote:
        'I went to a no-name school and thought finance was closed to me. She\u2019d done the same jump and told me exactly where I was wasting energy.',
    name: 'Priya S.',
    role: 'Analyst',
    initials: 'PS',
  },
  {
    quote:
        'I\u2019d been "fine" at the same job for four years. One session made quitting feel boring instead of terrifying.',
    name: 'Jordan E.',
    role: 'PM',
    initials: 'JE',
  },
];

function Testimonials() {
  return (
      <section id="stories" className="relative scroll-mt-20 overflow-hidden px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-950 via-stone-900 to-orange-950" />
        <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
        />
        <div
            aria-hidden
            className="pointer-events-none absolute -right-24 top-1/4 h-[min(480px,70vw)] w-[min(480px,70vw)] rounded-full bg-orange-500/25 blur-3xl"
        />
        <div
            aria-hidden
            className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl"
        />

        <div className="relative mx-auto max-w-6xl">
          <Reveal className="mb-14 max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-orange-300">From real sessions</p>
            <h2 className="font-display text-balance text-3xl font-semibold text-white sm:text-4xl lg:text-[2.65rem]">
              What people say afterward
            </h2>
          </Reveal>

          <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
            {TESTIMONIALS.map(({ quote, name, role, initials: ini }, i) => (
                <Reveal key={name} delay={i * 90}>
                  <figure
                      className={`relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border bg-white/[0.07] p-7 backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.11] sm:p-8 ${
                          i === 1
                              ? 'border-orange-400/35 shadow-lg shadow-orange-950/40 ring-1 ring-orange-400/25 lg:scale-[1.02] lg:z-10'
                              : 'border-white/10 hover:border-white/20'
                      }`}
                  >
                    <div className="flex gap-0.5 text-amber-400" aria-hidden>
                      {[0, 1, 2, 3, 4].map((s) => (
                          <span key={s} className="text-sm">★</span>
                      ))}
                    </div>
                    <blockquote className="mt-4 flex-1 text-pretty">
                      <p className="text-base leading-relaxed text-stone-100 sm:text-[1.05rem]">&ldquo;{quote}&rdquo;</p>
                    </blockquote>
                    <figcaption className="mt-8 flex items-center gap-3 border-t border-white/10 pt-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 text-xs font-bold text-white shadow-lg">
                        {ini}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{name}</p>
                        <p className="text-xs text-orange-100/85">{role}</p>
                      </div>
                    </figcaption>
                  </figure>
                </Reveal>
            ))}
          </div>
        </div>
      </section>
  );
}

function FinalCTA() {
  const { user } = useAuth();

  return (
      <section id="get-started" aria-labelledby="final-cta-heading" className="scroll-mt-20 px-4 pb-24 pt-20 sm:px-6 sm:pb-28 sm:pt-24 lg:px-8">
        <Reveal>
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-orange-600 via-amber-500 to-orange-700 px-8 py-16 text-center shadow-bridge-glow ring-1 ring-white/20 sm:px-14 sm:py-20">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.06\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-white/10 blur-2xl"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-300/20 blur-2xl"
            />
            <h2
                id="final-cta-heading"
                className="relative font-display text-balance text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]"
            >
              Ready to talk to someone who gets it?
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-lg leading-relaxed text-orange-50/95">
              {user
                  ? 'Pick a mentor whose story rhymes with yours, and book.'
                  : "Make an account, find one person whose background rhymes with yours, and book. That\u2019s it."}
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {user ? (
                  <>
                    <Link
                        to="/mentors"
                        className={`inline-flex w-full items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-orange-700 shadow-lg transition hover:bg-orange-50 sm:w-auto ${focusRingWhite}`}
                    >
                      Browse mentors
                    </Link>
                    <Link
                        to="/dashboard"
                        className={`inline-flex w-full items-center justify-center rounded-full border-2 border-white/45 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 sm:w-auto ${focusRingWhite}`}
                    >
                      Go to dashboard
                    </Link>
                  </>
              ) : (
                  <>
                    <Link
                        to="/register"
                        className={`inline-flex w-full items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-orange-700 shadow-lg transition hover:bg-orange-50 sm:w-auto ${focusRingWhite}`}
                    >
                      Sign up free
                    </Link>
                    <Link
                        to="/mentors"
                        className={`inline-flex w-full items-center justify-center rounded-full border-2 border-white/45 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 sm:w-auto ${focusRingWhite}`}
                    >
                      Just show me mentors
                    </Link>
                  </>
              )}
            </div>
          </div>
        </Reveal>
      </section>
  );
}

export default function Landing() {
  return (
      <main id="main-content" aria-label="Bridge — home" className="overflow-x-hidden">
        <Hero />
        <HowItWorks />
        <FeaturedMentors />
        <Testimonials />
        <FinalCTA />
      </main>
  );
}
