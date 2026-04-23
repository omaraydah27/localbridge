import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { isMentorAccount } from '../utils/accountRole';
import { Bell, LogOut, User, Settings, Sparkles, FileText } from 'lucide-react';

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const asMentor = user ? isMentorAccount(user) : false;

  async function handleLogout() {
    setMenuOpen(false);
    try {
      await logout();
    } catch {
      // ignore
    }
    navigate('/');
  }

  const navLinkClass =
    'rounded-full px-3.5 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-950 dark:text-stone-200 dark:hover:bg-white/10 dark:hover:text-white sm:px-4';

  return (
    <header className="sticky top-0 z-50 border-b border-[color-mix(in_srgb,var(--bridge-border)_80%,transparent)] bg-[color-mix(in_srgb,var(--bridge-canvas)_76%,transparent)] shadow-none backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--bridge-canvas)_68%,transparent)] dark:border-white/[0.1] dark:bg-[color-mix(in_srgb,var(--bridge-canvas)_72%,transparent)] dark:supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--bridge-canvas)_64%,transparent)]">
      <nav className="mx-auto grid h-[3.75rem] w-full max-w-bridge grid-cols-3 items-center px-4 sm:h-16 sm:px-6 lg:px-8 xl:px-10">

        {/* Left — logo */}
        <Link to="/" className="group flex items-center gap-2.5 justify-self-start">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-lg font-bold text-white shadow-md shadow-orange-500/30 transition group-hover:shadow-lg group-hover:shadow-orange-500/40">
            B
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
            Bridge
          </span>
        </Link>

        {/* Center — mentors: dashboard hub; mentees: mentors + dashboard when signed in */}
        <div className="flex min-w-0 items-center justify-center gap-0.5 sm:gap-1">
          {asMentor ? (
              <Link to="/dashboard" className={navLinkClass}>
                Dashboard
              </Link>
          ) : (
              <>
                <Link to="/mentors" className={navLinkClass}>
                  Mentors
                </Link>
                {user ? (
                  <>
                    <Link to="/dashboard" className={navLinkClass}>
                      Dashboard
                    </Link>
                    <Link to="/resume" className={`${navLinkClass} whitespace-nowrap`}>
                      Resume Review
                    </Link>
                  </>
                ) : null}
              </>
          )}
          <Link to="/about" className={navLinkClass}>
            About
          </Link>
          <Link to="/pricing" className={navLinkClass}>
            Pricing
          </Link>
        </div>

        {/* Right — auth */}
        <div className="flex items-center justify-end">
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-full bg-stone-200/70" aria-hidden />
          ) : user ? (
            <div className="flex items-center gap-1">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotifOpen((v) => !v)}
                  className="relative rounded-full p-2 text-[var(--bridge-text-muted)] transition hover:bg-[color-mix(in_srgb,var(--bridge-surface)_55%,transparent)] hover:text-[var(--bridge-text)]"
                  aria-expanded={notifOpen}
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                </button>
                {notifOpen && (
                  <>
                    <button
                      type="button"
                      className="fixed inset-0 z-40 cursor-default bg-transparent"
                      aria-label="Close notifications"
                      onClick={() => setNotifOpen(false)}
                    />
                    <div className="absolute right-0 top-11 z-50 w-72 rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-4 text-sm shadow-xl shadow-black/10 dark:shadow-black/40">
                      <p className="font-semibold text-[var(--bridge-text)]">Notifications</p>
                      <p className="mt-2 text-[var(--bridge-text-muted)]">You&apos;re all caught up—no new alerts.</p>
                      <button
                        type="button"
                        className="mt-3 text-xs font-semibold text-orange-600 hover:text-orange-500 dark:text-orange-400"
                        onClick={() => setNotifOpen(false)}
                      >
                        Close
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Avatar + dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
                  className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-stone-200 text-xs font-bold text-stone-800 ring-2 ring-white shadow-sm transition-all hover:ring-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:bg-stone-600 dark:text-stone-100 dark:ring-stone-800"
                  aria-label="Account menu"
                >
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    getInitials(user.user_metadata?.full_name || user.email)
                  )}
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-11 z-50 w-56 overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xl shadow-stone-300/25 dark:border-white/10 dark:bg-stone-900 dark:shadow-black/50">
                    {/* User info */}
                    <div className="border-b border-stone-100 px-4 py-3 dark:border-white/10">
                      <p className="truncate text-sm font-semibold text-stone-900 dark:text-stone-50" title={user.user_metadata?.full_name ?? user.email}>
                        {user.user_metadata?.full_name ?? user.email}
                      </p>
                      <p className="truncate text-xs text-stone-500 dark:text-stone-400">{user.email}</p>
                      <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-stone-600 dark:bg-white/10 dark:text-stone-300">
                        {asMentor ? (
                          <>
                            <Sparkles className="h-3 w-3 text-amber-600" aria-hidden />
                            Mentor
                          </>
                        ) : (
                          'Member'
                        )}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-white/5"
                    >
                      <User className="h-4 w-4 text-stone-400 dark:text-stone-500" />
                      Profile
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-white/5"
                    >
                      <Settings className="h-4 w-4 text-stone-400 dark:text-stone-500" />
                      Settings
                    </Link>

                    {!asMentor ? (
                      <>
                        <Link
                            to="/mentors"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-white/5"
                        >
                          <Sparkles className="h-4 w-4 text-stone-400 dark:text-stone-500" />
                          Find a mentor
                        </Link>
                        <Link
                            to="/resume"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-white/5"
                        >
                          <FileText className="h-4 w-4 text-stone-400 dark:text-stone-500" />
                          Resume Review
                        </Link>
                      </>
                    ) : null}

                    <div className="border-t border-stone-100 dark:border-white/10">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/login"
                className="rounded-full px-4 py-2.5 text-sm font-semibold text-stone-800 transition hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-white/10 dark:hover:text-white"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-600/30 transition hover:from-orange-500 hover:to-amber-400 hover:shadow-lg dark:shadow-orange-900/40"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

      </nav>
    </header>
  );
}
