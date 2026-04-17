import { useState, useEffect, useCallback, useId, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllMentors } from '../api/mentors';
import { getMyFavorites, toggleFavorite } from '../api/favorites';
import { useAuth } from '../context/useAuth';
import PageGutterAtmosphere from '../components/PageGutterAtmosphere';
import Reveal from '../components/Reveal';
import { getRecentlyViewedMentors } from '../utils/recentlyViewed';

const PAGE_SIZE = 12;

/** Shown in hero facepile until real mentor rows load */
const FACEPILE_FALLBACK = [
  { id: 'fp1', name: 'Maya Chen' },
  { id: 'fp2', name: 'Jordan Reeves' },
  { id: 'fp3', name: 'Elena Voss' },
  { id: 'fp4', name: 'Tyler Ng' },
  { id: 'fp5', name: 'Priya Shah' },
];

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf3]';
const focusRingDarkChip =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900';

const INDUSTRIES = [
  { label: 'All', value: '' },
  { label: 'Technology', value: 'technology' },
  { label: 'Finance', value: 'finance' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Data Science', value: 'data science' },
  { label: 'Education', value: 'education' },
  { label: 'Law', value: 'law' },
];

const SORT_OPTIONS = [
  { label: 'Best reviews first', value: 'rating' },
  { label: 'Most years in the game', value: 'experience' },
  { label: 'Most sessions logged', value: 'sessions' },
];

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

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function normalizeMentorId(id) {
  return id == null ? '' : String(id).toLowerCase();
}

function DirectoryFacepile({ people }) {
  const stack = people.slice(0, 5);
  const rots = ['-rotate-6', '-rotate-2', 'rotate-1', 'rotate-5', '-rotate-3'];
  const spots = [
    { l: '0%', t: '8%', z: 10 },
    { l: '22%', t: '0%', z: 20 },
    { l: '44%', t: '10%', z: 30 },
    { l: '10%', t: '52%', z: 40 },
    { l: '38%', t: '48%', z: 50 },
  ];
  return (
    <div className="relative mx-auto h-[240px] w-full max-w-[18rem] sm:h-[260px] sm:max-w-[20rem]" aria-hidden>
      {stack.map((p, i) => {
        const spot = spots[i];
        if (!spot) return null;
        const color = getAvatarColor(p.name);
        return (
          <div
            key={p.id ?? i}
            className={`absolute w-[6.5rem] rounded-xl border border-white/95 bg-white/95 p-2.5 shadow-bridge-glow backdrop-blur-sm transition duration-500 sm:w-[7.25rem] ${rots[i]}`}
            style={{ left: spot.l, top: spot.t, zIndex: spot.z }}
          >
            <div
              className={`mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-[11px] font-bold shadow-inner sm:h-10 sm:w-10 sm:text-xs ${color}`}
            >
              {getInitials(p.name)}
            </div>
            <p className="mt-2 truncate text-center text-[10px] font-semibold text-stone-800 sm:text-[11px]">{p.name}</p>
          </div>
        );
      })}
    </div>
  );
}

function StarRating({ rating }) {
  const uid = useId().replace(/:/g, '');
  const full = Math.floor(rating);
  const partial = rating - full;
  return (
    <span className="flex items-center gap-1">
      <span className="flex">
        {Array.from({ length: 5 }).map((_, i) => {
          const fill =
            i < full ? '100%' : i === full && partial > 0 ? `${Math.round(partial * 100)}%` : '0%';
          const gid = `${uid}-star-${i}`;
          return (
            <svg key={i} className="h-3.5 w-3.5" viewBox="0 0 20 20" aria-hidden>
              <defs>
                <linearGradient id={gid}>
                  <stop offset={fill} stopColor="#d97706" />
                  <stop offset={fill} stopColor="#d4d4d4" />
                </linearGradient>
              </defs>
              <polygon
                points="10,1 12.9,7 19.5,7.6 14.5,12 16.2,18.5 10,15 3.8,18.5 5.5,12 0.5,7.6 7.1,7"
                fill={`url(#${gid})`}
              />
            </svg>
          );
        })}
      </span>
      <span className="text-xs font-medium text-stone-500">{rating.toFixed(1)}</span>
    </span>
  );
}

function MentorGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="space-y-4 animate-pulse rounded-[1.75rem] border border-stone-200/80 bg-white/90 p-6 shadow-bridge-card"
        >
          <div className="flex gap-4">
            <div className="h-14 w-14 shrink-0 rounded-2xl bg-stone-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-stone-200" />
              <div className="h-3 w-1/2 rounded bg-stone-100" />
            </div>
          </div>
          <div className="h-12 rounded bg-stone-100" />
          <div className="h-8 w-2/3 rounded bg-stone-100" />
        </div>
      ))}
    </div>
  );
}

function HeartButton({ filled, onClick, label, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={`rounded-full bg-white/95 p-2 text-stone-400 shadow-sm ring-1 ring-stone-200/80 transition hover:bg-rose-50 hover:text-rose-500 hover:ring-rose-200/60 disabled:pointer-events-none disabled:opacity-40 ${focusRing}`}
      aria-label={label}
    >
      {filled ? (
        <svg className="h-5 w-5 fill-rose-500 text-rose-500" viewBox="0 0 24 24" aria-hidden>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ) : (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )}
    </button>
  );
}

function MentorCard({ mentor, isFavorite, onToggleFavorite, user, navigate, favoriteBusy }) {
  const avatarColor = getAvatarColor(mentor.name);
  const filled = isFavorite;

  function handleHeart() {
    if (!user) {
      navigate('/login', { state: { from: '/mentors' } });
      return;
    }
    onToggleFavorite(mentor.id);
  }

  return (
    <div className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-[1.75rem] border border-stone-200/80 bg-white/95 p-6 shadow-bridge-card transition duration-300 hover:-translate-y-1 hover:border-orange-200/55 hover:shadow-bridge-glow">
      <div className="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-orange-400/70 to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="absolute right-4 top-5">
        <HeartButton
          filled={filled}
          disabled={Boolean(favoriteBusy)}
          onClick={handleHeart}
          label={filled ? 'Remove from favorites' : 'Save to favorites'}
        />
      </div>

      <div className="flex items-start gap-4 pr-12">
        {mentor.image_url ? (
          <img
            src={mentor.image_url}
            alt=""
            className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-2 ring-white shadow-md"
          />
        ) : (
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-sm font-bold shadow-md ring-2 ring-white ${avatarColor}`}
          >
            {getInitials(mentor.name)}
          </div>
        )}
        <div className="min-w-0 pt-0.5">
          <h3 className="truncate font-semibold text-stone-900">{mentor.name}</h3>
          <p className="truncate text-sm text-stone-500">{mentor.title}</p>
          <p className="truncate text-sm font-medium text-amber-800">{mentor.company}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <StarRating rating={mentor.rating} />
        <span className="text-xs text-stone-400">{mentor.years_experience} yrs in</span>
      </div>

      <p className="line-clamp-2 text-sm leading-relaxed text-stone-600">{mentor.bio}</p>

      <div className="flex flex-wrap gap-1.5">
        {mentor.expertise.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-orange-100 bg-orange-50/80 px-2.5 py-0.5 text-xs font-medium text-orange-900"
          >
            {tag}
          </span>
        ))}
        {mentor.expertise.length > 3 && (
          <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs text-stone-500">
            +{mentor.expertise.length - 3}
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-stone-100/90 pt-4">
        <span className="text-xs text-stone-400">{mentor.total_sessions} sessions</span>
        <Link
          to={`/mentors/${mentor.id}`}
          className={`rounded-full bg-gradient-to-r from-stone-900 to-stone-800 px-4 py-2 text-sm font-semibold text-amber-50 shadow-md transition hover:from-stone-800 hover:to-stone-700 ${focusRing}`}
        >
          Open profile
        </Link>
      </div>
    </div>
  );
}

function FetchErrorBanner({ message, onRetry }) {
  return (
    <div className="mb-8 rounded-[1.75rem] border border-red-200/90 bg-red-50/95 px-5 py-5 text-sm text-red-900 shadow-sm">
      <p className="font-semibold">Mentors didn&apos;t load</p>
      <p className="mt-1 text-red-800/90">That&apos;s usually us or the Wi‑Fi. Want to try once more?</p>
      <p className="mt-2 font-mono text-xs text-red-800/70">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className={`mt-4 rounded-full bg-red-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-800 ${focusRing}`}
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}

export default function Mentors() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeIndustry, setActiveIndustry] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [page, setPage] = useState(0);
  const [mentors, setMentors] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());
  const [favoriteBusyId, setFavoriteBusyId] = useState(null);
  const [favoriteMessage, setFavoriteMessage] = useState(null);
  const [, setRecentBump] = useState(0);
  const mentorsGridRef = useRef(null);
  const [mentorListInView, setMentorListInView] = useState(null);
  const [jumpBarDismissed, setJumpBarDismissed] = useState(false);

  const recent = getRecentlyViewedMentors();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const el = mentorsGridRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setMentorListInView(entry.isIntersecting);
      },
      { root: null, threshold: 0, rootMargin: '0px 0px 0px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- pagination must reset when filters change */
    setPage(0);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [debouncedSearch, activeIndustry, sortBy]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- sync favorites with auth session */
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    void getMyFavorites().then(({ data, error: favErr }) => {
      if (favErr) {
        const msg = favErr.message || String(favErr);
        if (msg.includes('favorites') || msg.includes('schema cache') || msg.includes('does not exist')) {
          setFavoriteMessage(
            "Hearts need a favorites table in Supabase. If you're the admin, run bridge_schema.sql — we can't fake that on the frontend.",
          );
        }
        setFavoriteIds(new Set());
        return;
      }
      setFavoriteMessage(null);
      setFavoriteIds(new Set(data ?? []));
    });
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true);
    setError(null);
    /* eslint-enable react-hooks/set-state-in-effect */

    void (async () => {
      const { data, error: fetchError, totalCount: count } = await getAllMentors({
        search: debouncedSearch,
        industry: activeIndustry,
        sortBy,
        page,
        pageSize: PAGE_SIZE,
      });
      if (cancelled) return;
      setLoading(false);
      if (fetchError) {
        setMentors([]);
        setTotalCount(0);
        setError(fetchError.message || 'Something went wrong.');
        return;
      }
      setMentors(data ?? []);
      setTotalCount(count ?? 0);
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, activeIndustry, sortBy, page, reloadKey]);

  const loadMentors = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadKey((k) => k + 1);
  }, []);

  const onToggleFavorite = useCallback(async (mentorId) => {
    const key = normalizeMentorId(mentorId);
    setFavoriteBusyId(key);
    setFavoriteMessage(null);

    const { error: err } = await toggleFavorite(mentorId);

    if (err) {
      const msg = err.message || String(err);
      setFavoriteMessage(
        msg.includes('favorites') || msg.includes('does not exist') || msg.includes('schema cache')
          ? 'Could not save that — favorites table missing in Supabase (see bridge_schema.sql).'
          : msg,
      );
    }

    const { data, error: reloadErr } = await getMyFavorites();
    if (!reloadErr && data) {
      setFavoriteIds(new Set(data));
    }

    setFavoriteBusyId(null);
  }, []);

  const startIdx = totalCount === 0 ? 0 : page * PAGE_SIZE + 1;
  const endIdx = Math.min((page + 1) * PAGE_SIZE, totalCount);
  const canPrev = page > 0;
  const canNext = endIdx < totalCount;

  const savedCount = user ? favoriteIds.size : null;

  const facepilePeople = useMemo(() => {
    if (mentors.length >= 4) return mentors.slice(0, 5);
    return FACEPILE_FALLBACK;
  }, [mentors]);

  const showJumpToMentorsBar = mentorListInView === false && !jumpBarDismissed && !error;

  function scrollToMentorGrid() {
    mentorsGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <main id="mentors-directory" aria-label="Mentor directory" className="relative min-h-screen overflow-x-hidden">
      <PageGutterAtmosphere />

      <section
        aria-labelledby="mentors-heading"
        className="relative scroll-mt-20 overflow-hidden bg-bridge-hero-mesh px-4 pb-28 pt-8 sm:px-6 sm:pb-32 sm:pt-10 lg:px-8"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg width=\'72\' height=\'72\' viewBox=\'0 0 72 72\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' stroke=\'%23d6d3d1\' stroke-opacity=\'0.35\'%3E%3Cpath d=\'M36 0v72M0 36h72\'/%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '72px 72px',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-28 top-10 h-[min(420px,70vw)] w-[min(420px,70vw)] rounded-full bg-gradient-to-br from-amber-300/40 via-orange-200/25 to-transparent blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-36 bottom-0 h-72 w-72 rounded-full bg-orange-200/30 blur-3xl"
        />

        <div className="relative mx-auto max-w-6xl">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-stone-500">
              <li>
                <Link
                  to="/"
                  className={`rounded-md font-medium text-stone-600 transition hover:text-orange-800 ${focusRing}`}
                >
                  Home
                </Link>
              </li>
              <li aria-hidden className="text-stone-300">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                </svg>
              </li>
              <li className="font-medium text-stone-800">Mentors</li>
            </ol>
          </nav>

          <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-10">
            <div className="lg:col-span-7">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">Directory</p>
              <h1
                id="mentors-heading"
                className="mt-3 font-display text-balance text-[2.1rem] font-semibold leading-[1.08] tracking-tight text-stone-900 sm:text-5xl sm:leading-[1.06] lg:text-[2.75rem]"
              >
                Find a mentor who{' '}
                <span className="text-gradient-bridge">matches the chapter</span>
                <span className="text-stone-800"> you&apos;re in</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg">
                Every card is a real person with a bio worth reading—search, sort, save hearts, then open whoever feels
                uncomfortably specific.
              </p>

              <dl className="mt-10 grid grid-cols-3 gap-3 sm:gap-4">
                <div className="rounded-2xl border border-stone-200/80 bg-white/85 p-4 text-center shadow-sm backdrop-blur-sm">
                  <dt className="sr-only">Profiles matching filters</dt>
                  <dd className="m-0">
                    <span className="font-display text-2xl font-semibold tabular-nums text-stone-900 sm:text-3xl">
                      {loading ? '—' : totalCount}
                    </span>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-stone-500">In directory</p>
                  </dd>
                </div>
                <div className="rounded-2xl border border-stone-200/80 bg-white/85 p-4 text-center shadow-sm backdrop-blur-sm">
                  <dt className="sr-only">Mentors you saved</dt>
                  <dd className="m-0">
                    <span className="font-display text-2xl font-semibold tabular-nums text-stone-900 sm:text-3xl">
                      {savedCount == null ? '—' : savedCount}
                    </span>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-stone-500">Saved</p>
                  </dd>
                </div>
                <div className="rounded-2xl border border-stone-200/80 bg-white/85 p-4 text-center shadow-sm backdrop-blur-sm">
                  <dt className="sr-only">Typical session length</dt>
                  <dd className="m-0">
                    <span className="font-display text-2xl font-semibold text-stone-900 sm:text-3xl">30–45</span>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-stone-500">Minutes</p>
                  </dd>
                </div>
              </dl>

              <div className="mt-8 border-l-[3px] border-orange-500/90 pl-5">
                <p className="text-sm leading-relaxed text-stone-700">
                  <span className="font-semibold text-stone-900">Tip:</span> skim whole bios before you crank filters—the
                  signal is usually in the story.{' '}
                  {user ? (
                    <span className="text-stone-600">Hearts stay on your account.</span>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        state={{ from: '/mentors' }}
                        className={`font-semibold text-orange-900 underline decoration-orange-300/70 underline-offset-2 hover:decoration-orange-500 ${focusRing} rounded-sm`}
                      >
                        Log in
                      </Link>{' '}
                      <span className="text-stone-600">to save favorites.</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="relative flex justify-center lg:col-span-5">
              <div
                aria-hidden
                className="absolute inset-0 -m-6 rounded-[2rem] bg-gradient-to-tr from-orange-400/15 via-transparent to-amber-300/10 blur-2xl lg:-m-8"
              />
              <div className="relative flex w-full flex-col items-center">
                <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">
                  People in this list
                </p>
                <DirectoryFacepile people={facepilePeople} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto max-w-6xl -mt-16 px-4 sm:-mt-20 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-stone-200/90 bg-white/95 p-6 shadow-[0_24px_60px_-12px_rgba(28,25,23,0.12)] ring-1 ring-white/70 backdrop-blur-md sm:p-8 lg:p-10">
          <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
          <div className="relative flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">Search this directory</p>
              <h2 className="mt-2 font-display text-balance text-xl font-semibold text-stone-900 sm:text-2xl">
                Refine who you see
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-600">
                Keywords catch titles and companies; industries trim the noise when you&apos;re browsing wide.
              </p>
            </div>
          </div>

          <div className="relative mt-6 flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <svg
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Name, company, title, whatever you remember…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-stone-200/90 bg-stone-50/50 py-3.5 pl-11 pr-10 text-sm text-stone-900 shadow-inner placeholder:text-stone-400 focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/30"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 ${focusRing}`}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              ) : null}
            </div>
            <div className="shrink-0 lg:w-64">
              <label htmlFor="sort-mentors" className="sr-only">
                Sort mentors
              </label>
              <select
                id="sort-mentors"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-2xl border border-stone-200/90 bg-stone-50/50 px-4 py-3.5 text-sm text-stone-800 shadow-inner focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/30"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative mt-8 rounded-2xl border border-stone-100 bg-stone-50/60 p-4 sm:p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Industry</p>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map(({ label, value }) => (
                <button
                  key={value || 'all'}
                  type="button"
                  onClick={() => setActiveIndustry(value)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    activeIndustry === value
                      ? `border-transparent bg-gradient-to-r from-stone-900 to-stone-800 text-amber-50 shadow-md ${focusRingDarkChip}`
                      : `border-stone-200/90 bg-white text-stone-600 shadow-sm hover:border-orange-200/70 hover:shadow ${focusRing}`
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pt-12 lg:px-8">
        {recent.length > 0 ? (
          <section className="relative mb-14" aria-labelledby="recent-mentors-heading">
            <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p
                  id="recent-mentors-heading"
                  className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700"
                >
                  Recently opened
                </p>
                <h2 className="mt-2 font-display text-lg font-semibold text-stone-900 sm:text-xl">Pick up where you left off</h2>
                <p className="mt-1 text-sm text-stone-600">Swipe sideways on your phone—each tile jumps to the full profile.</p>
              </div>
            </div>
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {recent.map((m, i) => (
                <Reveal key={m.id} delay={i * 60} className="w-[220px] shrink-0 snap-start">
                  <Link
                    to={`/mentors/${m.id}`}
                    onClick={() => setRecentBump((b) => b + 1)}
                    className={`group relative flex h-full min-h-[148px] flex-col overflow-hidden rounded-[1.75rem] border border-stone-200/80 bg-white/95 p-5 shadow-bridge-card backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200/60 hover:shadow-bridge-glow ${focusRing}`}
                  >
                    <div className="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 opacity-0 transition group-hover:opacity-100" />
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-200 to-amber-100 text-sm font-bold text-orange-900 shadow-inner">
                      {getInitials(m.name)}
                    </div>
                    <p className="truncate font-semibold text-stone-900">{m.name}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-stone-500">{m.title}</p>
                    <p className="mt-4 text-xs font-semibold text-orange-700 opacity-0 transition group-hover:opacity-100">
                      Open profile <span aria-hidden>→</span>
                    </p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>
        ) : null}

        {favoriteMessage ? (
          <div
            className="mb-8 rounded-[1.75rem] border border-amber-200/80 bg-gradient-to-br from-amber-50/95 to-orange-50/40 px-5 py-4 text-sm text-amber-950 shadow-sm backdrop-blur-sm"
            role="status"
          >
            {favoriteMessage}
          </div>
        ) : null}

        {error ? <FetchErrorBanner message={error} onRetry={loadMentors} /> : null}

        <div id="mentors-grid" ref={mentorsGridRef} className="scroll-mt-24">
          {!loading && !error ? (
            <div className="mb-8 flex flex-col gap-4 rounded-[1.75rem] border border-stone-200/80 bg-white/80 px-5 py-4 shadow-bridge-card backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-sm text-stone-600">
                <span className="font-medium text-stone-800">Results</span>
                {' · '}
                Showing{' '}
                <span className="font-semibold text-stone-900">
                  {totalCount === 0 ? 0 : `${startIdx}–${endIdx}`}
                </span>{' '}
                of <span className="font-semibold text-stone-900">{totalCount}</span>
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={!canPrev}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className={`rounded-full border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-50 disabled:pointer-events-none disabled:opacity-35 ${focusRing}`}
                >
                  Back
                </button>
                <span className="rounded-full bg-stone-100 px-4 py-2 text-xs font-semibold text-stone-600">
                  Page {page + 1}
                </span>
                <button
                  type="button"
                  disabled={!canNext}
                  onClick={() => setPage((p) => p + 1)}
                  className={`rounded-full border border-transparent bg-gradient-to-r from-orange-600 to-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/25 transition hover:from-orange-500 hover:to-amber-400 disabled:pointer-events-none disabled:opacity-35 disabled:shadow-none ${focusRing}`}
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}

          {loading ? (
            <MentorGridSkeleton />
          ) : mentors.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {mentors.map((mentor, i) => (
                <Reveal key={mentor.id} delay={i * 55} className="h-full">
                  <MentorCard
                    mentor={mentor}
                    isFavorite={favoriteIds.has(normalizeMentorId(mentor.id))}
                    onToggleFavorite={onToggleFavorite}
                    user={user}
                    navigate={navigate}
                    favoriteBusy={favoriteBusyId === normalizeMentorId(mentor.id)}
                  />
                </Reveal>
              ))}
            </div>
          ) : !error ? (
            <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-[1.75rem] border border-dashed border-stone-200/90 bg-gradient-to-b from-stone-50/90 to-orange-50/30 px-6 py-20 text-center shadow-sm backdrop-blur-sm sm:py-24">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 top-10 h-48 w-48 rounded-full bg-orange-200/30 blur-3xl"
              />
              <div
                aria-hidden
                className="flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-200/60 bg-white/90 shadow-bridge-card"
              >
                <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.35-4.35" strokeLinecap="round" />
                </svg>
              </div>
              <p className="relative mt-6 font-display text-balance text-xl font-semibold text-stone-900 sm:text-2xl">
                Nobody fits that combo
              </p>
              <p className="relative mt-3 max-w-md text-sm leading-relaxed text-stone-600 sm:text-base">
                Loosen a filter or kill a keyword—sometimes the best profiles use weird titles.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setActiveIndustry('');
                  setPage(0);
                }}
                className={`relative mt-8 rounded-full border-2 border-stone-900/12 bg-white px-7 py-3 text-sm font-semibold text-stone-900 shadow-md transition hover:border-orange-300/70 hover:shadow-lg ${focusRing}`}
              >
                Reset filters
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {showJumpToMentorsBar ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-2 sm:px-6 sm:pb-[max(1.25rem,env(safe-area-inset-bottom,0px))]">
          <div
            className="pointer-events-auto flex w-full max-w-md items-center gap-2 rounded-2xl border border-stone-200/90 bg-white/95 py-2 pl-3 pr-2 shadow-[0_-8px_40px_-4px_rgba(28,25,23,0.18)] ring-1 ring-white/80 backdrop-blur-md sm:pl-4"
            role="region"
            aria-label="Mentor list is below"
          >
            <p className="min-w-0 flex-1 pl-1 text-sm text-stone-600">
              <span className="font-medium text-stone-800">Mentor list</span>{' '}
              <span className="hidden sm:inline">is below—jump down when you&apos;re ready.</span>
              <span className="sm:hidden">below</span>
            </p>
            <button
              type="button"
              onClick={scrollToMentorGrid}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/25 transition hover:from-orange-500 hover:to-amber-400 ${focusRing}`}
            >
              Mentors
              <svg className="h-4 w-4 opacity-95" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setJumpBarDismissed(true)}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 ${focusRing}`}
              aria-label="Dismiss"
            >
              <span className="text-lg leading-none" aria-hidden>
                ×
              </span>
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
