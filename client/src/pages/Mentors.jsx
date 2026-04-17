import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllMentors } from '../api/mentors';
import LoadingSpinner from '../components/LoadingSpinner';

const INDUSTRIES = [
  { label: 'All', value: '' },
  { label: 'Technology', value: 'tech' },
  { label: 'Finance', value: 'finance' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Data Science', value: 'data science' },
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

function StarRating({ rating }) {
  const full = Math.floor(rating);
  const partial = rating - full;
  return (
    <span className="flex items-center gap-1">
      <span className="flex">
        {Array.from({ length: 5 }).map((_, i) => {
          const fill =
            i < full ? '100%' : i === full && partial > 0 ? `${Math.round(partial * 100)}%` : '0%';
          return (
            <svg key={i} className="w-3.5 h-3.5" viewBox="0 0 20 20">
              <defs>
                <linearGradient id={`star-${i}-${rating}`}>
                  <stop offset={fill} stopColor="#d97706" />
                  <stop offset={fill} stopColor="#d4d4d4" />
                </linearGradient>
              </defs>
              <polygon
                points="10,1 12.9,7 19.5,7.6 14.5,12 16.2,18.5 10,15 3.8,18.5 5.5,12 0.5,7.6 7.1,7"
                fill={`url(#star-${i}-${rating})`}
              />
            </svg>
          );
        })}
      </span>
      <span className="text-xs text-stone-500 font-medium">{rating.toFixed(1)}</span>
    </span>
  );
}

function MentorCard({ mentor }) {
  const avatarColor = getAvatarColor(mentor.name);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${avatarColor}`}
        >
          {getInitials(mentor.name)}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-stone-900 truncate">{mentor.name}</h3>
          <p className="text-sm text-stone-500 truncate">{mentor.title}</p>
          <p className="text-sm text-amber-700 font-medium truncate">{mentor.company}</p>
        </div>
      </div>

      {/* Rating + experience */}
      <div className="flex items-center justify-between">
        <StarRating rating={mentor.rating} />
        <span className="text-xs text-stone-400">{mentor.years_experience} yrs exp</span>
      </div>

      {/* Bio */}
      <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed">{mentor.bio}</p>

      {/* Expertise tags */}
      <div className="flex flex-wrap gap-1.5">
        {mentor.expertise.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200"
          >
            {tag}
          </span>
        ))}
        {mentor.expertise.length > 3 && (
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-500">
            +{mentor.expertise.length - 3}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-stone-100">
        <span className="text-xs text-stone-400">{mentor.total_sessions} sessions</span>
        <Link
          to={`/mentors/${mentor.id}`}
          className="text-sm px-4 py-1.5 rounded-full bg-stone-900 text-amber-50 hover:bg-stone-700 transition-colors"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}

function FetchErrorBanner({ message, onRetry }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 text-red-900 px-4 py-3 text-sm mb-8">
      <p className="font-semibold">Couldn&apos;t load mentors</p>
      <p className="mt-1 text-red-800/90">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 text-sm font-medium px-4 py-2 rounded-full bg-red-900 text-white hover:bg-red-800 transition-colors"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

export default function Mentors() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeIndustry, setActiveIndustry] = useState('');
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    /* Sync loading UI before awaiting Supabase (eslint data-fetch pattern) */
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true);
    setError(null);
    /* eslint-enable react-hooks/set-state-in-effect */

    void (async () => {
      const { data, error: fetchError } = await getAllMentors({
        search: debouncedSearch,
        industry: activeIndustry,
      });
      if (cancelled) return;
      setLoading(false);
      if (fetchError) {
        setMentors([]);
        setError(fetchError.message || 'Something went wrong.');
        return;
      }
      setMentors(data ?? []);
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, activeIndustry, reloadKey]);

  function loadMentors() {
    setLoading(true);
    setError(null);
    setReloadKey((k) => k + 1);
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900">Browse Mentors</h1>
        <p className="text-stone-500 mt-1">Find the right mentor for where you want to go.</p>
      </div>

      {error ? <FetchErrorBanner message={error} onRetry={loadMentors} /> : null}

      {/* Search */}
      <div className="relative mb-6">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none"
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
          placeholder="Search by name, company, skill…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent text-sm shadow-sm"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Industry filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {INDUSTRIES.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setActiveIndustry(value)}
            className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${
              activeIndustry === value
                ? 'bg-stone-900 text-amber-50 border-stone-900'
                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Result count */}
      {!loading && !error ? (
        <p className="text-sm text-stone-500 mb-5">
          Showing <span className="font-semibold text-stone-700">{mentors.length}</span>{' '}
          {mentors.length === 1 ? 'mentor' : 'mentors'}
        </p>
      ) : null}

      {/* Grid */}
      {loading ? (
        <LoadingSpinner label="Loading mentors…" />
      ) : mentors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} />
          ))}
        </div>
      ) : !error ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-stone-700 font-medium">No mentors found.</p>
          <p className="text-stone-400 text-sm mt-1">Try adjusting your search or filters.</p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setActiveIndustry('');
            }}
            className="mt-5 text-sm px-4 py-2 rounded-full border border-stone-300 text-stone-600 hover:bg-stone-100 transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : null}
    </main>
  );
}
