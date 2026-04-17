import { useState, useEffect, useMemo, useId, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getMentorById } from '../api/mentors';
import { getReviewsForMentor } from '../api/reviews';
import { createSession } from '../api/sessions';
import { useAuth } from '../context/useAuth';
import SessionTypeCard from '../components/SessionTypeCard';
import { SESSION_TYPES } from '../constants/sessionTypes';
import { addRecentlyViewedMentor } from '../utils/recentlyViewed';
import PageGutterAtmosphere from '../components/PageGutterAtmosphere';
import Reveal from '../components/Reveal';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf3]';
const focusRingDark =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900';
const focusRingWhite =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900';

function BookingModal({ mentor, onClose }) {
    const [selectedType, setSelectedType] = useState(null);
    const [scheduledDate, setScheduledDate] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') handleClose();
        };
        window.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [handleClose]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!selectedType) return;

        setSubmitting(true);
        setResult(null);

        const { error } = await createSession({
            mentorId: mentor.id,
            sessionType: selectedType.key,
            scheduledDate: scheduledDate || null,
            message: message || null,
        });

        setSubmitting(false);

        if (error) {
            setResult({ ok: false, message: error.message ?? 'Something went wrong. Please try again.' });
        } else {
            setResult({ ok: true, message: "Request sent — they'll confirm or suggest another time." });
        }
    }

    const mentorFirst = mentor.name?.split(/\s+/)[0] ?? 'your mentor';

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-modal-title"
        >
            <button
                type="button"
                className="absolute inset-0 bg-stone-950/70 backdrop-blur-[2px] transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-400/90"
                aria-label="Close booking"
                onClick={handleClose}
            />
            <div className="relative flex max-h-[min(92vh,880px)] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl shadow-stone-950/25 ring-1 ring-stone-200/90 sm:rounded-3xl sm:ring-stone-200/60">
                {result?.ok ? (
                    <div className="flex flex-col items-center px-8 py-14 sm:py-16 text-center">
                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-4xl shadow-lg shadow-amber-900/20">
                            ✓
                        </div>
                        <h2 className="font-display text-2xl font-semibold text-stone-900 sm:text-3xl">You’re on the list</h2>
                        <p className="mt-3 max-w-sm text-stone-600 leading-relaxed">{result.message}</p>
                        <p className="mt-2 text-sm text-stone-500">We’ll email you when {mentorFirst} gets back to you.</p>
                        <button
                            type="button"
                            onClick={handleClose}
                            className={`mt-10 rounded-2xl bg-stone-900 px-10 py-3.5 text-sm font-semibold text-amber-50 shadow-lg shadow-stone-900/25 transition hover:bg-stone-800 ${focusRingDark}`}
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                        <header className="relative shrink-0 overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 px-6 pb-8 pt-7 sm:px-8 sm:pb-10 sm:pt-8">
                            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl" />
                            <div className="pointer-events-none absolute -bottom-20 left-1/4 h-40 w-40 rounded-full bg-orange-400/10 blur-3xl" />
                            <div className="relative flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/90">Book time</p>
                                    <h2
                                        id="booking-modal-title"
                                        className="mt-2 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl"
                                    >
                                        Meet with {mentor.name}
                                    </h2>
                                    <p className="mt-2 max-w-md text-sm leading-relaxed text-stone-300">
                                        Choose a format, toss in a time if you have one, leave a short note. They’ll confirm or
                                        counter-offer like a normal human.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-xl text-white transition hover:bg-white/20 ${focusRingWhite}`}
                                    aria-label="Close"
                                >
                                    ×
                                </button>
                            </div>
                            <ol className="relative mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium sm:text-sm">
                                <li className={`flex items-center gap-2 ${selectedType ? 'text-stone-400' : 'text-white'}`}>
                                    <span
                                        className={`flex h-7 w-7 items-center justify-center rounded-full text-[13px] ${selectedType ? 'bg-emerald-500 text-white' : 'bg-white/15 text-white'}`}
                                    >
                                        {selectedType ? '✓' : '1'}
                                    </span>
                                    Format
                                </li>
                                <li className="hidden text-stone-500 sm:inline" aria-hidden="true">
                                    —
                                </li>
                                <li className={`flex items-center gap-2 ${selectedType ? 'text-amber-200' : 'text-stone-500'}`}>
                                    <span
                                        className={`flex h-7 w-7 items-center justify-center rounded-full text-[13px] ${selectedType ? 'bg-white/20 text-white' : 'bg-white/10 text-stone-400'}`}
                                    >
                                        2
                                    </span>
                                    Details
                                </li>
                            </ol>
                        </header>

                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                            <div className="space-y-8 px-5 py-6 sm:px-8 sm:py-8">
                                <section>
                                    <div className="mb-4">
                                        <h3 className="text-base font-semibold text-stone-900">What kind of hour is this?</h3>
                                        <p className="mt-1 text-sm text-stone-500">
                                            Tap one. The ring and checkmark mean you’re locked in on that format.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                                        {SESSION_TYPES.map((type) => (
                                            <SessionTypeCard
                                                key={type.key}
                                                type={type}
                                                variant="picker"
                                                selected={selectedType?.key === type.key}
                                                onClick={() => setSelectedType(type)}
                                            />
                                        ))}
                                    </div>
                                </section>

                                <section className="rounded-2xl border border-stone-200/80 bg-gradient-to-b from-stone-50/90 to-white p-5 sm:p-6">
                                    <h3 className="text-base font-semibold text-stone-900">When &amp; what to prep</h3>
                                    <p className="mt-1 text-sm text-stone-500">Optional, but it helps them show up ready.</p>
                                    <div className="mt-5 space-y-5">
                                        <div>
                                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-stone-500" htmlFor="scheduled-date">
                                                Preferred start time
                                            </label>
                                            <input
                                                id="scheduled-date"
                                                type="datetime-local"
                                                value={scheduledDate}
                                                onChange={(e) => setScheduledDate(e.target.value)}
                                                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-stone-500" htmlFor="booking-message">
                                                Note to mentor
                                            </label>
                                            <textarea
                                                id="booking-message"
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                rows={3}
                                                placeholder="e.g. PM loops at ~200-person startups, nervous about system design…"
                                                className="w-full resize-none rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 placeholder-stone-400 shadow-sm transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                                            />
                                        </div>
                                    </div>
                                </section>

                                {result && !result.ok && (
                                    <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{result.message}</p>
                                )}
                            </div>
                        </div>

                        <footer className="shrink-0 border-t border-stone-200/80 bg-white/95 px-5 py-4 backdrop-blur-sm sm:px-8 sm:py-5">
                            {selectedType && (
                                <p className="mb-3 text-center text-xs text-stone-500 sm:text-left">
                                    <span className="font-medium text-stone-700">{selectedType.name}</span>
                                    <span className="text-stone-400"> · </span>
                                    {selectedType.duration}
                                </p>
                            )}
                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className={`rounded-2xl border border-stone-200 bg-white px-5 py-3.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 sm:px-6 ${focusRing}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!selectedType || submitting}
                                    className={`rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-amber-900/25 transition hover:from-amber-400 hover:to-orange-400 disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none sm:min-w-[200px] ${focusRing}`}
                                >
                                    {submitting ? 'Sending…' : 'Send request'}
                                </button>
                            </div>
                        </footer>
                    </form>
                )}
            </div>
        </div>
    );
}

function avatarColor(name = '') {
    const palette = [
        'from-amber-400 to-orange-500',
        'from-rose-400 to-pink-500',
        'from-violet-400 to-purple-600',
        'from-teal-400 to-emerald-600',
        'from-sky-400 to-indigo-500',
        'from-fuchsia-400 to-rose-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return palette[Math.abs(hash) % palette.length];
}

function initials(name = '') {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('');
}

function formatIndustry(industry) {
    if (!industry?.trim()) return null;
    return industry
        .trim()
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
}

function StarRow({ rating, size = 'md' }) {
    const uid = useId().replace(/:/g, '');
    const r = Math.min(5, Math.max(0, Number(rating) || 0));
    const full = Math.floor(r);
    const partial = r - full;
    const dim = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
    return (
        <span className="flex items-center gap-0.5" aria-label={`${r.toFixed(1)} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, i) => {
                let fill = 0;
                if (i < full) fill = 100;
                else if (i === full) fill = Math.round(partial * 100);
                const gid = `star-${uid}-${i}-${size}`;
                return (
                    <svg key={i} className={dim} viewBox="0 0 20 20">
                        <defs>
                            <linearGradient id={gid}>
                                <stop offset={`${fill}%`} stopColor="#d97706" />
                                <stop offset={`${fill}%`} stopColor="#e7e5e4" />
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
    );
}

const metricIconWrap =
    'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-orange-200/35 bg-gradient-to-br from-orange-50/95 to-amber-50/60 text-orange-700 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.85)]';

function ProfileMetricStrip({ rating, reviewCount, yearsExperience, totalSessions }) {
    const hasRating = rating > 0;
    const hasYears = yearsExperience != null;
    const hasSessions = totalSessions != null;

    return (
        <div className="relative mt-10 overflow-hidden rounded-2xl border border-stone-200/80 bg-white/95 shadow-sm ring-1 ring-orange-100/25 backdrop-blur-sm">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-orange-500/80 via-amber-400/70 to-orange-500/80 opacity-90"
            />
            <dl className="grid divide-y divide-stone-100/95 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                <div className="flex items-center gap-4 px-5 py-4 sm:px-6 sm:py-5">
                    <div className={metricIconWrap} aria-hidden>
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                            />
                        </svg>
                    </div>
                    <div className="min-w-0">
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">Rating</dt>
                        <dd className="mt-1">
                            <span className="text-2xl font-semibold tabular-nums tracking-tight text-stone-900">
                                {hasRating ? rating.toFixed(1) : '—'}
                            </span>
                            {reviewCount > 0 ? (
                                <span className="mt-0.5 block text-xs font-medium text-stone-500">
                                    From {reviewCount} review{reviewCount === 1 ? '' : 's'}
                                </span>
                            ) : hasRating ? (
                                <span className="mt-0.5 block text-xs text-stone-400">No written reviews yet</span>
                            ) : null}
                        </dd>
                    </div>
                </div>

                <div className="flex items-center gap-4 px-5 py-4 sm:px-6 sm:py-5">
                    <div className={metricIconWrap} aria-hidden>
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 6v6h4.5m5.25.75a9.75 9.75 0 1 1-19.5 0 9.75 9.75 0 0 1 19.5 0Z"
                            />
                        </svg>
                    </div>
                    <div className="min-w-0">
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">Experience</dt>
                        <dd className="mt-1 flex items-baseline gap-1.5 text-stone-900">
                            {hasYears ? (
                                <>
                                    <span className="text-2xl font-semibold tabular-nums tracking-tight">{yearsExperience}</span>
                                    <span className="text-sm font-medium text-stone-500">yrs</span>
                                </>
                            ) : (
                                <span className="text-2xl font-semibold text-stone-400">—</span>
                            )}
                        </dd>
                    </div>
                </div>

                <div className="flex items-center gap-4 px-5 py-4 sm:px-6 sm:py-5">
                    <div className={metricIconWrap} aria-hidden>
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5"
                            />
                        </svg>
                    </div>
                    <div className="min-w-0">
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">Sessions</dt>
                        <dd className="mt-1 text-stone-900">
                            {hasSessions ? (
                                <span className="text-2xl font-semibold tabular-nums tracking-tight">{totalSessions}</span>
                            ) : (
                                <span className="text-2xl font-semibold text-stone-400">—</span>
                            )}
                        </dd>
                    </div>
                </div>
            </dl>
        </div>
    );
}

function ProfileSkeleton() {
  return (
    <main className="relative mx-auto min-h-screen max-w-6xl overflow-x-hidden px-4 py-8 sm:px-6 sm:py-12">
      <PageGutterAtmosphere />
      <div className="animate-pulse space-y-8">
        <div className="h-4 w-56 rounded-full bg-stone-200/90" />
        <div className="rounded-[2rem] border border-stone-200/80 bg-white/85 p-8 shadow-bridge-card sm:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <div className="mx-auto h-40 w-40 shrink-0 rounded-[1.75rem] bg-stone-200/90 lg:mx-0" />
            <div className="flex-1 space-y-4">
              <div className="mx-auto h-10 max-w-md rounded-xl bg-stone-200/90 lg:mx-0" />
              <div className="mx-auto h-5 max-w-sm rounded-lg bg-stone-100 lg:mx-0" />
              <div className="mt-6 h-[5.5rem] rounded-2xl bg-stone-100/90 sm:h-24" />
            </div>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-72 rounded-[2rem] bg-stone-100/90 lg:col-span-2" />
          <div className="h-80 rounded-[2rem] bg-stone-100/90" />
        </div>
      </div>
    </main>
  );
}

function formatReviewDate(iso) {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
        return '';
    }
}

export default function MentorProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [profile, setProfile] = useState(null);
    const [mentorReviews, setMentorReviews] = useState([]);
    const [loadError, setLoadError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        let cancelled = false;
        /* Reset UI when mentor id changes (standard fetch pattern) */
        /* eslint-disable react-hooks/set-state-in-effect */
        setLoading(true);
        setLoadError(null);
        /* eslint-enable react-hooks/set-state-in-effect */

        Promise.all([getMentorById(id), getReviewsForMentor(id)]).then(([mentorRes, reviewsRes]) => {
            if (cancelled) return;

            if (mentorRes.error) {
                setProfile(null);
                setMentorReviews([]);
                setLoadError(mentorRes.error.message ?? 'Could not load mentor.');
            } else if (!mentorRes.data?.mentor) {
                setProfile(null);
                setMentorReviews([]);
                setLoadError(null);
            } else {
                setProfile(mentorRes.data);
                setMentorReviews(reviewsRes.error ? [] : (reviewsRes.data ?? []));
                setLoadError(null);
                addRecentlyViewedMentor(mentorRes.data.mentor);
            }
            setLoading(false);
        });

        return () => {
            cancelled = true;
        };
    }, [id]);

    const displayRating = useMemo(() => {
        if (!profile?.mentor) return 0;
        const fromReviews = profile.reviews?.average;
        if (fromReviews != null && profile.reviews.count > 0) return Number(fromReviews);
        const r = profile.mentor.rating;
        return r != null ? Number(r) : 0;
    }, [profile]);

  function handleBookClick() {
    if (!user) {
      navigate('/login', { state: { from: `/mentors/${id}` } });
    } else {
      setShowModal(true);
    }
  }

    if (loading) {
        return <ProfileSkeleton />;
    }

  if (loadError) {
    return (
      <main className="relative min-h-screen overflow-x-hidden px-4 py-16 sm:px-6">
        <PageGutterAtmosphere />
        <div className="relative mx-auto max-w-lg rounded-[2rem] border border-stone-200/90 bg-white/95 px-8 py-12 text-center shadow-bridge-card">
          <p className="font-display text-lg font-semibold text-stone-900">Couldn&apos;t load this profile</p>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">{loadError}</p>
          <Link
            to="/mentors"
            className={`mt-8 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-7 py-3 text-sm font-semibold text-white shadow-md shadow-orange-500/25 transition hover:from-orange-500 hover:to-amber-400 ${focusRing}`}
          >
            Back to mentors
          </Link>
        </div>
      </main>
    );
  }

  if (!profile?.mentor) {
    return (
      <main className="relative min-h-screen overflow-x-hidden px-4 py-16 sm:px-6">
        <PageGutterAtmosphere />
        <div className="relative mx-auto max-w-lg rounded-[2rem] border border-dashed border-stone-200/90 bg-gradient-to-b from-stone-50/90 to-orange-50/40 px-8 py-12 text-center shadow-sm">
          <p className="font-display text-lg font-semibold text-stone-900">This mentor isn&apos;t here</p>
          <p className="mt-3 text-sm text-stone-600">The link may be outdated or the profile was removed.</p>
          <Link
            to="/mentors"
            className={`mt-8 inline-flex items-center justify-center rounded-full border-2 border-stone-900/10 bg-white px-7 py-3 text-sm font-semibold text-stone-900 shadow-md transition hover:border-orange-300/70 ${focusRing}`}
          >
            Browse all mentors
          </Link>
        </div>
      </main>
    );
  }

  const mentor = profile.mentor;
  const reviewMeta = profile.reviews;
  const industryLabel = formatIndustry(mentor.industry);
  const grad = avatarColor(mentor.name);
  const mentorInitials = initials(mentor.name);
  const firstName = mentor.name?.split(/\s+/)[0] ?? 'them';

  return (
    <>
      <main id="mentor-profile" className="relative min-h-screen overflow-x-hidden" aria-labelledby="profile-heading">
        <PageGutterAtmosphere />

        <section className="relative scroll-mt-20 overflow-hidden bg-bridge-hero-mesh px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8 lg:px-8">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.3]"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg width=\'72\' height=\'72\' viewBox=\'0 0 72 72\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' stroke=\'%23d6d3d1\' stroke-opacity=\'0.35\'%3E%3Cpath d=\'M36 0v72M0 36h72\'/%3E%3C/g%3E%3C/svg%3E")',
              backgroundSize: '72px 72px',
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 top-8 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-28 bottom-0 h-64 w-64 rounded-full bg-orange-200/25 blur-3xl"
          />

          <div className="relative mx-auto max-w-6xl">
            <nav aria-label="Breadcrumb" className="mb-6">
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
                <li>
                  <Link
                    to="/mentors"
                    className={`rounded-md font-medium text-stone-600 transition hover:text-orange-800 ${focusRing}`}
                  >
                    Mentors
                  </Link>
                </li>
                <li aria-hidden className="text-stone-300">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                  </svg>
                </li>
                <li className="max-w-[min(100%,14rem)] truncate font-medium text-stone-800">{mentor.name}</li>
              </ol>
            </nav>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">Mentor profile</p>
          </div>
        </section>

        <div className="relative z-10 mx-auto max-w-6xl -mt-14 px-4 sm:-mt-16 sm:px-6 lg:px-8 pb-20 sm:pb-24">
          <section
            aria-labelledby="profile-heading"
            className="relative mb-10 overflow-hidden rounded-[2rem] border border-stone-200/90 bg-white/95 shadow-[0_24px_60px_-12px_rgba(28,25,23,0.12)] ring-1 ring-white/70 backdrop-blur-md"
          >
            <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-amber-50/95 via-orange-50/60 to-amber-50/40" />

            <div className="relative p-6 sm:p-9 lg:p-11">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:gap-12">
                <div className="flex shrink-0 justify-center lg:justify-start">
                  {mentor.image_url ? (
                    <div className="relative">
                      <div className={`absolute inset-0 scale-110 rounded-[1.75rem] bg-gradient-to-br ${grad} opacity-25 blur-xl`} />
                      <img
                        src={mentor.image_url}
                        alt={`${mentor.name} — profile photo`}
                        className="relative h-36 w-36 rounded-[1.75rem] object-cover shadow-bridge-glow ring-4 ring-white sm:h-44 sm:w-44"
                      />
                    </div>
                  ) : (
                    <div
                      className={`relative flex h-36 w-36 items-center justify-center rounded-[1.75rem] bg-gradient-to-br ${grad} text-3xl font-bold text-white shadow-bridge-glow ring-4 ring-white sm:h-44 sm:w-44 sm:text-4xl`}
                      aria-hidden
                    >
                      {mentorInitials}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 pb-1 text-center lg:pb-2 lg:text-left">
                  <div className="mb-4 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                    {industryLabel ? (
                      <span className="rounded-full border border-orange-100/90 bg-orange-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-900">
                        {industryLabel}
                      </span>
                    ) : null}
                    {mentor.available ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                        Accepting sessions
                      </span>
                    ) : null}
                  </div>

                  <h1
                    id="profile-heading"
                    className="font-display text-balance text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]"
                  >
                    {mentor.name}
                  </h1>

                  {mentor.title ? (
                    <p className="mx-auto mt-3 max-w-2xl text-lg font-medium text-stone-700 sm:text-xl lg:mx-0">
                      {mentor.title}
                      {mentor.company ? (
                        <span className="font-normal text-stone-500">
                          {' '}
                          <span className="text-stone-400">·</span> {mentor.company}
                        </span>
                      ) : null}
                    </p>
                  ) : null}

                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                    <div className="inline-flex items-center gap-2 rounded-2xl border border-stone-200/80 bg-stone-900 px-4 py-2.5 text-amber-50 shadow-md">
                      <StarRow rating={displayRating} size="lg" />
                      <span className="font-semibold tabular-nums">
                        {displayRating > 0 ? displayRating.toFixed(1) : '—'}
                      </span>
                      {reviewMeta?.count > 0 ? (
                        <span className="text-sm font-normal text-amber-200/90">
                          ({reviewMeta.count} review{reviewMeta.count === 1 ? '' : 's'})
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <ProfileMetricStrip
                rating={displayRating}
                reviewCount={reviewMeta?.count ?? 0}
                yearsExperience={mentor.years_experience}
                totalSessions={mentor.total_sessions}
              />
            </div>
          </section>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            <div className="flex flex-col gap-8 lg:col-span-8">
              <Reveal>
                <section className="relative overflow-hidden rounded-[1.75rem] border border-stone-200/90 bg-white/95 p-8 shadow-bridge-card backdrop-blur-sm sm:p-9">
                  <div className="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-orange-500/80 via-amber-400/80 to-orange-500/80 opacity-70" />
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">About</p>
                  <h2 className="mt-2 font-display text-balance text-2xl font-semibold text-stone-900 sm:text-3xl">Their story</h2>
                  <div className="relative mt-6 border-l-[3px] border-orange-200/90 pl-5">
                    <p className="text-lg leading-relaxed text-stone-700 whitespace-pre-line">
                      {mentor.bio?.trim() || 'No bio yet—book a session and ask what you would normally read here.'}
                    </p>
                  </div>
                </section>
              </Reveal>

              <Reveal delay={80}>
                <section className="relative overflow-hidden rounded-[1.75rem] border border-stone-200/90 bg-white/95 p-8 shadow-bridge-card backdrop-blur-sm sm:p-9">
                  <div className="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-orange-400/50 to-transparent opacity-80" />
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">Focus areas</p>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-stone-900">Expertise</h2>
                  {mentor.expertise?.length > 0 ? (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {mentor.expertise.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-orange-100 bg-orange-50/80 px-3.5 py-1.5 text-sm font-medium text-orange-900"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-stone-500">No focus areas listed yet.</p>
                  )}
                </section>
              </Reveal>

              <Reveal delay={160}>
                <section className="relative overflow-hidden rounded-[1.75rem] border border-stone-200/90 bg-white/95 p-8 shadow-bridge-card backdrop-blur-sm sm:p-9">
                  <div className="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-orange-400/50 to-transparent opacity-80" />
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">Reviews</p>
                  <h2 className="mt-2 font-display text-balance text-2xl font-semibold text-stone-900 sm:text-3xl">
                    After sessions
                  </h2>
                  <p className="mt-2 text-sm text-stone-600">Pulled from real reviews when people leave them.</p>

                  {mentorReviews.length > 0 ? (
                    <ul className="mt-8 space-y-4">
                      {mentorReviews.map((rev) => (
                        <li
                          key={rev.id}
                          className="rounded-[1.25rem] border border-stone-100/90 bg-stone-50/60 p-5 transition hover:border-orange-100/80 hover:bg-orange-50/25"
                        >
                          <figure className="flex gap-4">
                            <div
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-stone-200/80 bg-white text-stone-400 shadow-sm"
                              aria-hidden
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                                />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <figcaption className="mb-2 flex flex-wrap items-center gap-2">
                                <span className="text-sm font-semibold text-stone-800">Session review</span>
                                <StarRow rating={rev.rating} />
                                <span className="text-xs text-stone-400">{formatReviewDate(rev.created_at)}</span>
                              </figcaption>
                              {rev.comment?.trim() ? (
                                <blockquote>
                                  <p className="text-pretty leading-relaxed text-stone-700">{rev.comment.trim()}</p>
                                </blockquote>
                              ) : (
                                <p className="text-sm italic text-stone-400">Rated the session but didn&apos;t leave a note.</p>
                              )}
                            </div>
                          </figure>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="mt-8 rounded-[1.25rem] border border-dashed border-stone-200/90 bg-stone-50/50 px-6 py-12 text-center">
                      <div
                        className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-200/60 bg-white shadow-sm"
                        aria-hidden
                      >
                        <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                          />
                        </svg>
                      </div>
                      <p className="mt-4 font-medium text-stone-800">No reviews yet</p>
                      <p className="mt-2 text-sm text-stone-600">
                        After you meet, they can leave feedback—it&apos;ll show up here.
                      </p>
                    </div>
                  )}
                </section>
              </Reveal>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24 lg:col-span-4">
              <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-stone-900 via-stone-900 to-orange-950 p-8 text-amber-50 shadow-2xl shadow-stone-950/25 ring-1 ring-white/10">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-orange-500/20 blur-2xl"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-[0.07]"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                  }}
                />
                <p className="relative text-xs font-semibold uppercase tracking-[0.28em] text-orange-300">Book</p>
                <h3 className="relative mt-3 font-display text-2xl font-semibold leading-snug">Time with {firstName}</h3>
                <p className="relative mt-4 text-sm leading-relaxed text-stone-400">
                  Choose a format, suggest a window if you have one, add context—they confirm or offer another slot.
                </p>
                <ul className="relative mt-6 space-y-3 border-t border-white/10 pt-6 text-sm text-amber-50/95">
                  {SESSION_TYPES.map((type) => (
                    <li key={type.key} className="flex gap-3">
                      <span className="text-lg leading-none">{type.icon}</span>
                      <span>
                        <span className="font-medium">{type.name}</span>
                        <span className="text-orange-200/75"> · {type.duration}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={handleBookClick}
                  className={`relative mt-8 w-full rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 py-4 text-sm font-semibold text-stone-900 shadow-lg transition hover:from-amber-300 hover:to-orange-300 ${focusRing}`}
                >
                  Book a session
                </button>
                <p className="relative mt-4 text-center text-xs leading-relaxed text-stone-500">
                  Heavy user? Pro may pay for itself—we&apos;ll nudge you in billing when it&apos;s relevant.
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-stone-200/90 bg-white/95 p-6 text-sm text-stone-600 shadow-bridge-card">
                <p className="font-display font-semibold text-stone-900">On Bridge</p>
                <ul className="mt-4 space-y-3">
                  <li className="flex gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-xs text-orange-700">
                      ✓
                    </span>
                    Bios meant to be read—not keyword-stuffed.
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-xs text-orange-700">
                      ✓
                    </span>
                    Session types so the hour has a point.
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-xs text-orange-700">
                      ✓
                    </span>
                    Booking that still feels human.
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {showModal ? <BookingModal mentor={mentor} onClose={() => setShowModal(false)} /> : null}
    </>
  );
}
