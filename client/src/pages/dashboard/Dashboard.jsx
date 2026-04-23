/**
 * Dashboard (route: `/dashboard` — see `App.jsx`)
 *
 * Architecture
 * ------------
 * This file is the **shell only**: auth gates, sticky header + tabs, error banner, and which
 * role-specific tree to render. All session data and Supabase fetching live in
 * `dashboard/useDashboardData.js`. Shared formatting/helpers: `dashboard/dashboardUtils.js`.
 * Reusable UI pieces (cards, badges): `dashboard/dashboardShared.jsx`.
 *
 * Role split (same URL, different components)
 * -------------------------------------------
 * - `isMentorAccount(user)` from `utils/accountRole.js` (reads Supabase user metadata / role).
 * - **Mentor** → `dashboard/MentorDashboardContent.jsx` (mentee names, accept/decline, mentee grid).
 * - **Mentee** → `dashboard/MenteeDashboardContent.jsx` (mentor profiles, cancel session, MentorCard links).
 *
 * Data flow
 * ---------
 *   useAuth() ──user, authLoading──► useDashboardData(user, authLoading) ──returns `dash`──►
 *   MentorDashboardContent | MenteeDashboardContent (props: dash, activeTab, setActiveTab, logout)
 *
 * Related (outside this folder)
 * ------------------------------
 * - `components/OnboardingModal.jsx` — mounted here for post-signup mentor flow.
 * - `api/sessions.js` — `getMySession`, `updateSessionStatus` used inside the hook.
 */

import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Users, Settings, Plus, X } from 'lucide-react';
import { useAuth } from '../../context/useAuth.js';
import { isMentorAccount } from '../../utils/accountRole.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import PageGutterAtmosphere from '../../components/PageGutterAtmosphere.jsx';
import Reveal from '../../components/Reveal.jsx';
import OnboardingModal from '../../components/OnboardingModal.jsx';
import { useDashboardData } from './useDashboardData.js';
import { getFirstName, getTimeGreeting, getTodayLabel } from './dashboardUtils.js';
import { MentorDashboardContent } from './MentorDashboardContent.jsx';
import { MenteeDashboardContent } from './MenteeDashboardContent.jsx';

export default function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const isMentor = isMentorAccount(user);

  // Tab id strings must match switches inside MentorDashboardContent / MenteeDashboardContent.
  const [activeTab, setActiveTab] = useState('overview');

  // Single source of truth for sessions + derived lists; see hook file for field meanings.
  const dash = useDashboardData(user, authLoading);

  if (authLoading) return <LoadingSpinner label="Loading…" className="min-h-screen" />;
  if (!user) return <Navigate to="/login" replace />;
  // Hook sets dataLoading false only after mentor/mentee fetch completes (or errors).
  if (dash.dataLoading) return <LoadingSpinner label="Loading your dashboard…" className="min-h-[calc(100vh-4rem)]" />;

  const firstName = getFirstName(user);
  const greeting = getTimeGreeting();

  const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'sessions', label: 'Sessions', icon: CalendarDays },
    { id: 'connections', label: isMentor ? 'Mentees' : 'Mentors', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
      <div data-route-atmo="dashboard" className="relative min-h-[calc(100vh-4rem)] selection:bg-orange-200/50 selection:text-stone-900 dark:selection:bg-orange-900/50 dark:selection:text-orange-50">
        <PageGutterAtmosphere />

        <div className="sticky top-16 z-30 border-b border-[color-mix(in_srgb,var(--bridge-border)_75%,transparent)] bg-[color-mix(in_srgb,var(--bridge-canvas)_78%,transparent)] backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--bridge-canvas)_68%,transparent)]">
          <div className="mx-auto max-w-bridge px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between pb-3 pt-6">
              <div>
                <h1 className="font-display text-2xl font-bold text-[var(--bridge-text)]">
                  Good {greeting},{' '}
                  <span className="text-orange-600">{firstName}</span>
                </h1>
                <p className="mt-0.5 text-xs text-[var(--bridge-text-muted)]">{getTodayLabel()}</p>
              </div>
              {!isMentor && (
                  <Link
                      to="/mentors"
                      className="hidden items-center gap-2 rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 sm:flex"
                  >
                    <Plus className="h-4 w-4" />
                    Find a Mentor
                  </Link>
              )}
            </div>

            <div className="-mb-px flex">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                            active
                                ? 'border-orange-500 text-orange-600'
                                : 'border-transparent text-[var(--bridge-text-muted)] hover:text-[var(--bridge-text)]'
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                );
              })}
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-bridge px-4 py-8 sm:px-6 lg:px-8">
          {/* Set by useDashboardData on fetch/update failures; cleared by dismiss or next successful action */}
          {dash.error && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="flex-1 text-sm text-red-700">{dash.error}</p>
                <button
                    type="button"
                    onClick={() => dash.setError(null)}
                    className="shrink-0 rounded-full p-0.5 text-red-400 transition hover:text-red-600"
                    aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
          )}

          <Reveal>
            {/* Only one branch ships in the bundle path per user; shared `dash` shape documented in useDashboardData */}
            {isMentor ? (
                <MentorDashboardContent dash={dash} activeTab={activeTab} setActiveTab={setActiveTab} logout={logout} user={user} />
            ) : (
                <MenteeDashboardContent dash={dash} activeTab={activeTab} setActiveTab={setActiveTab} logout={logout} user={user} />
            )}
          </Reveal>
        </main>
        <OnboardingModal />
      </div>
  );
}
