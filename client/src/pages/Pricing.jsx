import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import Reveal from '../components/Reveal';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f2ebe3]';

const ANNUAL_DISCOUNT = 0.2;

function PricingBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute -left-32 top-24 h-[28rem] w-[28rem] rounded-full bg-orange-400/[0.09] blur-3xl" />
      <div className="absolute -right-20 top-[40%] h-[22rem] w-[22rem] rounded-full bg-amber-300/[0.11] blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-stone-400/[0.07] blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width=\'56\' height=\'56\' viewBox=\'0 0 56 56\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'2\' cy=\'2\' r=\'1\' fill=\'%23a8a29e\' fill-opacity=\'0.45\'/%3E%3C/svg%3E")',
          backgroundSize: '56px 56px',
        }}
      />
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-4">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-stone-400/45 to-stone-400/25" />
      <span className="shrink-0 font-display text-sm font-semibold tracking-wide text-stone-600/90">{children}</span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-stone-400/45 to-stone-400/25" />
    </div>
  );
}

function formatMoney(n) {
  return n === 0 ? '$0' : `$${n}`;
}

function tierMonthlyEquivalent(monthly, annual) {
  if (monthly === 0) return 0;
  if (!annual) return monthly;
  return Math.round((monthly * 12 * (1 - ANNUAL_DISCOUNT)) / 12);
}

function PricingPrinciplesStrip() {
  const items = [
    {
      title: 'Platform vs sessions',
      body: 'These plans are for Bridge access. What you pay a mentor for their time is set when you book—not hidden here.',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 18 9 11.25l4.306 4.307a11.95 11.95 0 0 1 5.814-5.519l2.74-1.22m0 0-5.94-2.28m5.94 2.28-2.28 5.941"
          />
        </svg>
      ),
    },
    {
      title: 'Free stays real',
      body: 'Browse the directory, read bios, and send a monthly request without a card—we are not fake-trialing you.',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      ),
    },
    {
      title: 'Checkout soon',
      body: 'Paid tiers show a placeholder until billing is live. Free signup works today—upgrade when we flip the switch.',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      ),
    },
  ];

  const accents = [
    'from-orange-400/90 to-amber-500/80',
    'from-amber-500/85 to-orange-600/75',
    'from-orange-500/80 to-amber-400/75',
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
      {items.map((item, idx) => (
        <div
          key={item.title}
          className="group relative overflow-hidden rounded-2xl border border-stone-300/50 bg-[#f7f2eb]/95 p-5 pl-6 shadow-sm ring-1 ring-stone-900/[0.03] transition duration-300 hover:-translate-y-0.5 hover:border-stone-400/45 hover:shadow-md sm:p-6 sm:pl-7"
        >
          <div
            aria-hidden
            className={`absolute bottom-0 left-0 top-0 w-1 bg-gradient-to-b ${accents[idx % accents.length]} opacity-[0.65]`}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-orange-400/[0.06] blur-2xl transition duration-500 group-hover:bg-orange-400/[0.1]"
          />
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-200/60 text-orange-900/90 ring-1 ring-stone-300/40">
            {item.icon}
          </span>
          <h3 className="mt-4 font-display text-base font-semibold text-stone-900">{item.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">{item.body}</p>
        </div>
      ))}
    </div>
  );
}

function CheckCell({ included, highlight }) {
  if (included) {
    return (
      <span
        className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
          highlight
            ? 'bg-orange-800/90 text-white shadow-sm'
            : 'bg-stone-200/70 text-orange-950/85 ring-1 ring-stone-300/60'
        }`}
        aria-label="Included"
      >
        ✓
      </span>
    );
  }
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center text-stone-300" aria-label="Not included">
      —
    </span>
  );
}

function PricingFaq({ headingId, items }) {
  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-stone-300/55 bg-[#f4efe8]/92 p-5 shadow-sm ring-1 ring-stone-900/[0.03] sm:p-6"
      aria-labelledby={headingId}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/25 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-12 h-32 w-32 rounded-full bg-orange-300/[0.08] blur-2xl"
      />
      <div className="relative flex items-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-orange-700/70 shadow-sm" aria-hidden />
        <h2 id={headingId} className="font-display text-lg font-semibold text-stone-900 sm:text-xl">
          Questions
        </h2>
      </div>
      <p className="mt-1.5 text-sm text-stone-600">Straight answers—no legal fog unless we need it.</p>
      <div className="relative mt-5 divide-y divide-stone-200/60 rounded-xl border border-stone-300/40 bg-[#faf7f2]/90">
        {items.map((item) => (
          <details key={item.q} className="group px-3 py-0.5 sm:px-4">
            <summary
              className={`cursor-pointer list-none py-3.5 pr-7 text-sm font-semibold text-stone-900 transition marker:content-none [&::-webkit-details-marker]:hidden ${focusRing} rounded-lg`}
            >
              <span className="flex items-start justify-between gap-3">
                <span className="min-w-0">{item.q}</span>
                <span
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-stone-300/50 bg-[#f7f2eb] text-stone-500 transition group-open:rotate-180 group-open:border-orange-200/60 group-open:bg-orange-50/50 group-open:text-orange-900/90"
                  aria-hidden
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </span>
              </span>
            </summary>
            <p className="pb-3.5 text-sm leading-relaxed text-stone-600">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export default function Pricing() {
  const { user } = useAuth();
  const [annual, setAnnual] = useState(false);

  function handlePaidClick() {
    alert('Payment integration coming soon');
  }

  const tiers = [
    {
      name: 'Free',
      tagline: 'Try the directory for real',
      monthly: 0,
      blurb: 'Explore profiles, save people you like, and send one booking request per month.',
      features: ['Full directory & bios', 'Hearts / shortlist', 'One session request / month', 'Reviews when available'],
      cta: user ? 'Current plan' : 'Sign up free',
      href: user ? '/dashboard' : '/register',
      primary: false,
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
          />
        </svg>
      ),
    },
    {
      name: 'Pro',
      tagline: 'For regular booking rhythm',
      monthly: 19,
      blurb: 'Unlimited requests, faster match-ups when we ship them, DMs, and short recaps after sessions.',
      features: ['Unlimited session requests', 'Faster matching (when live)', 'DMs with mentors', 'Session recap notes'],
      cta: 'Subscribe',
      onClick: handlePaidClick,
      primary: true,
      badge: 'Most popular',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605"
          />
        </svg>
      ),
    },
    {
      name: 'Premium',
      tagline: 'High-touch usage',
      monthly: 49,
      blurb: 'Everything in Pro, plus a closer lane with one mentor, resume review, and priority support.',
      features: ['Everything in Pro', 'Deeper relationship with one mentor', 'Resume pass included', 'Priority email support'],
      cta: 'Subscribe',
      onClick: handlePaidClick,
      primary: false,
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
        </svg>
      ),
    },
  ];

  const comparisonRows = [
    { label: 'Browse directory & profiles', free: true, pro: true, premium: true },
    { label: 'Shortlist / hearts', free: true, pro: true, premium: true },
    { label: 'Session requests', free: '1 / month', pro: 'Unlimited', premium: 'Unlimited' },
    { label: 'DMs with mentors', free: false, pro: true, premium: true },
    { label: 'Session recap notes', free: false, pro: true, premium: true },
    { label: 'Dedicated mentor lane & extras', free: false, pro: false, premium: true },
  ];

  const faq = [
    {
      q: 'Can I switch plans later?',
      a: 'Yes. Start on Free and upgrade when it feels worth it—we are not locking you into a tier.',
    },
    {
      q: 'Do mentors set their own rates?',
      a: 'This page is Bridge platform access. What you pay a mentor for their time is handled in booking and on their profile—not duplicated here.',
    },
    {
      q: 'What about refunds?',
      a: 'We will publish a clear refund policy before we take payment. Until then, paid buttons are placeholders only.',
    },
    {
      q: 'Is there a free trial for Pro?',
      a: 'Not yet. Free tier already covers real usage; when trials exist we will say so loudly—no hidden timers.',
    },
  ];

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-[#ebe4db] via-[#f2ebe3] to-[#e8e0d6]" aria-labelledby="pricing-heading">
      <PricingBackdrop />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-16 z-[1] h-px bg-gradient-to-r from-transparent via-stone-400/20 to-transparent"
      />

      <header className="relative z-[2] overflow-hidden border-b border-stone-400/30 bg-[#f0e9e1]/88 backdrop-blur-md">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 h-[min(380px,85vw)] w-[min(380px,85vw)] rounded-full bg-gradient-to-br from-orange-200/22 via-amber-100/12 to-transparent blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 bottom-0 h-56 w-56 rounded-full bg-orange-100/[0.14] blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-6 flex justify-center sm:justify-start">
            <ol className="inline-flex flex-wrap items-center gap-2 rounded-full border border-stone-400/35 bg-[#f7f2eb]/90 px-4 py-2 text-sm text-stone-600 shadow-sm ring-1 ring-stone-900/[0.02] backdrop-blur-sm">
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
              <li className="font-medium text-stone-800">Pricing</li>
            </ol>
          </nav>

          <div className="mx-auto max-w-3xl text-center sm:mx-0 sm:text-left">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-orange-900/75">
              <span className="h-1 w-6 rounded-full bg-gradient-to-r from-orange-600/70 to-amber-600/60" aria-hidden />
              Plans &amp; access
            </p>
            <h1
              id="pricing-heading"
              className="mt-4 font-display text-balance text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl sm:leading-[1.08]"
            >
              Bridge membership, <span className="text-gradient-bridge">in plain numbers</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-stone-600/95 sm:mx-0">
              One page for what the app costs. Mentor session fees stay on profiles and bookings—this is not a second
              checkout in disguise.
            </p>
            <ul className="mx-auto mt-6 flex max-w-2xl flex-wrap justify-center gap-2 sm:mx-0 sm:justify-start">
              {['No card for Free', 'Cancel anytime', 'Mentor rates separate'].map((label) => (
                <li
                  key={label}
                  className="rounded-full border border-stone-400/30 bg-[#e8e2da]/90 px-3 py-1 text-xs font-semibold text-stone-700 shadow-sm"
                >
                  {label}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
              <Link
                to="/mentors"
                className={`inline-flex items-center gap-2 rounded-full border border-stone-400/40 bg-[#f7f2eb] px-5 py-2.5 text-sm font-semibold text-stone-800 shadow-sm transition hover:border-stone-500/40 hover:bg-[#faf7f2] hover:text-orange-900/95 ${focusRing}`}
              >
                Browse mentors
                <span aria-hidden>→</span>
              </Link>
              <Link
                to="/register"
                className={`text-sm font-semibold text-orange-900/90 underline-offset-4 transition hover:text-orange-950/95 hover:underline ${focusRing} rounded-sm`}
              >
                Create free account
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-[2] mx-auto max-w-7xl space-y-12 px-4 py-12 sm:px-6 sm:py-14 lg:space-y-14 lg:px-8 lg:py-16">
        <Reveal delay={40}>
          <SectionLabel>How we price Bridge</SectionLabel>
          <div className="mt-6">
            <PricingPrinciplesStrip />
          </div>
        </Reveal>

        <div className="space-y-8">
          <Reveal delay={40}>
            <SectionLabel>Pick a plan</SectionLabel>
            <div className="mt-6 flex flex-col gap-5 rounded-2xl border border-stone-400/35 bg-[#f0e9e1]/85 p-5 shadow-sm ring-1 ring-stone-900/[0.03] backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange-900/75">Billing</p>
                <p className="mt-1 text-sm text-stone-600">Switch to annual and save {Math.round(ANNUAL_DISCOUNT * 100)}% on paid plans.</p>
              </div>
              <div
                className="inline-flex self-start rounded-full border border-stone-400/35 bg-[#e3dcd4]/90 p-1 shadow-inner sm:self-auto"
                role="group"
                aria-label="Billing period"
              >
                <button
                  type="button"
                  onClick={() => setAnnual(false)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    !annual ? 'bg-stone-900 text-white shadow-md' : 'text-stone-600 hover:text-stone-900'
                  } ${focusRing}`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setAnnual(true)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    annual ? 'bg-stone-900 text-white shadow-md' : 'text-stone-600 hover:text-stone-900'
                  } ${focusRing}`}
                >
                  Annual
                </button>
              </div>
            </div>
          </Reveal>

          <div className="grid gap-5 md:grid-cols-3 md:items-stretch">
            {tiers.map((tier, idx) => {
              const equiv = tierMonthlyEquivalent(tier.monthly, annual);
              const showAnnualNote = annual && tier.monthly > 0;

              return (
                <Reveal key={tier.name} delay={60 + idx * 50}>
                  <div
                    className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-[#f7f2eb]/95 p-7 shadow-sm ring-1 ring-stone-900/[0.03] transition duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-8 ${
                      tier.primary
                        ? 'border-orange-400/40 ring-2 ring-orange-300/20 md:z-[1] md:scale-[1.02]'
                        : 'border-stone-400/40 hover:border-stone-500/50'
                    }`}
                  >
                    {tier.primary ? (
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-100/35 via-[#f7f2eb]/98 to-amber-100/25"
                      />
                    ) : null}
                    <div
                      aria-hidden
                      className={`absolute inset-x-0 top-0 z-[1] h-1 ${
                        tier.primary
                          ? 'bg-gradient-to-r from-orange-700/85 via-amber-600/70 to-orange-700/85'
                          : 'bg-stone-400/40 group-hover:bg-gradient-to-r group-hover:from-orange-200/50 group-hover:to-amber-200/45'
                      }`}
                    />

                    {tier.badge ? (
                      <span className="absolute right-4 top-4 z-[1] rounded-full bg-gradient-to-r from-orange-800/90 to-amber-800/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm sm:right-5 sm:top-5 sm:px-3 sm:text-[11px]">
                        {tier.badge}
                      </span>
                    ) : null}

                    <div
                      className={`relative z-[1] mb-4 flex h-12 w-12 items-center justify-center rounded-xl border ${
                        tier.primary
                          ? 'border-orange-200/50 bg-stone-200/50 text-orange-950/90'
                          : 'border-stone-400/40 bg-stone-200/40 text-stone-600 group-hover:border-stone-400/55 group-hover:text-orange-900/85'
                      }`}
                    >
                      {tier.icon}
                    </div>

                    <h2 className="relative z-[1] pr-16 font-display text-lg font-semibold text-stone-900">{tier.name}</h2>
                    <p className="relative z-[1] mt-1 text-xs font-medium uppercase tracking-wider text-orange-900/70">{tier.tagline}</p>

                    <p className="relative z-[1] mt-5 flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
                      <span className="font-display text-4xl font-semibold tabular-nums tracking-tight text-stone-900 sm:text-[2.65rem]">
                        {formatMoney(equiv)}
                      </span>
                      <span className="text-sm text-stone-500">/month</span>
                    </p>
                    {showAnnualNote ? (
                      <p className="relative z-[1] mt-1 text-xs font-medium text-orange-900/75">Billed annually · save {Math.round(ANNUAL_DISCOUNT * 100)}%</p>
                    ) : (
                      <p className="relative z-[1] mt-1 text-xs font-medium uppercase tracking-wider text-stone-400">
                        {tier.monthly === 0 ? 'Forever' : 'Billed monthly · cancel anytime'}
                      </p>
                    )}

                    <p className="relative z-[1] mt-4 text-sm leading-relaxed text-stone-600">{tier.blurb}</p>

                    <ul className="relative z-[1] mt-6 flex flex-1 flex-col gap-3 text-sm text-stone-700">
                      {tier.features.map((f) => (
                        <li key={f} className="flex gap-3">
                          <span
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              tier.primary
                                ? 'bg-orange-800/85 text-white'
                                : 'bg-stone-300/60 text-orange-950/90 ring-1 ring-stone-400/45'
                            }`}
                            aria-hidden
                          >
                            ✓
                          </span>
                          <span className="leading-snug">{f}</span>
                        </li>
                      ))}
                    </ul>

                    {tier.href ? (
                      <Link
                        to={tier.href}
                        className={`relative z-[1] mt-8 block w-full rounded-full py-3.5 text-center text-sm font-semibold transition ${
                          tier.primary
                            ? 'bg-gradient-to-r from-orange-800/95 to-amber-800/90 text-white shadow-md shadow-orange-950/15 hover:from-orange-800 hover:to-amber-700/90'
                            : user
                              ? 'border-2 border-stone-400/45 bg-stone-200/40 text-stone-700 hover:border-stone-500/50 hover:bg-[#faf7f2]'
                              : 'border-2 border-stone-500/25 bg-[#faf7f2] text-stone-900 hover:border-orange-400/45 hover:shadow-sm'
                        } ${focusRing}`}
                      >
                        {tier.cta}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={tier.onClick}
                        className={`relative z-[1] mt-8 w-full rounded-full py-3.5 text-sm font-semibold transition ${
                          tier.primary
                            ? 'bg-gradient-to-r from-orange-800/95 to-amber-800/90 text-white shadow-md shadow-orange-950/15 hover:from-orange-800 hover:to-amber-700/90'
                            : 'border-2 border-stone-500/25 bg-[#faf7f2] text-stone-900 hover:border-orange-400/45 hover:shadow-sm'
                        } ${focusRing}`}
                      >
                        {tier.cta}
                      </button>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10 lg:items-start">
          <Reveal delay={80} className="hidden lg:col-span-4 lg:block lg:sticky lg:top-24">
            <PricingFaq headingId="pricing-faq-heading" items={faq} />
          </Reveal>

          <div className="space-y-8 lg:col-span-8">
            <Reveal delay={60}>
              <div className="overflow-hidden rounded-2xl border border-stone-400/35 bg-[#f0e9e1]/88 shadow-sm ring-1 ring-stone-900/[0.03]">
                <div className="relative border-b border-stone-400/30 bg-gradient-to-r from-[#ebe4db] via-[#f2ebe3] to-[#ebe4db] px-6 py-5 sm:px-8">
                  <div className="relative flex items-start gap-3">
                    <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-stone-300/35 text-orange-900/80 ring-1 ring-stone-400/35" aria-hidden>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25a2.25 2.25 0 0 1-2.25 2.25h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                      </svg>
                    </span>
                    <div>
                      <h2 className="font-display text-lg font-semibold text-stone-900 sm:text-xl">Compare at a glance</h2>
                      <p className="mt-1 text-sm text-stone-600">What changes between tiers on Bridge—not mentor session fees.</p>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-stone-400/30 bg-[#e3dcd4]/70">
                        <th scope="col" className="px-4 py-4 font-semibold text-stone-900 sm:px-6">
                          Feature
                        </th>
                        <th scope="col" className="px-3 py-4 text-center font-semibold text-stone-800 sm:px-5">
                          Free
                        </th>
                        <th scope="col" className="px-3 py-4 text-center font-semibold text-orange-950/85 sm:px-5">
                          Pro
                        </th>
                        <th scope="col" className="px-3 py-4 text-center font-semibold text-stone-800 sm:px-5">
                          Premium
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonRows.map((row, rIdx) => (
                        <tr
                          key={row.label}
                          className={`border-b border-stone-300/35 last:border-0 ${rIdx % 2 === 1 ? 'bg-[#e8e2da]/55' : 'bg-[#f7f2eb]/40'}`}
                        >
                          <th scope="row" className="max-w-[12rem] px-4 py-4 font-normal text-stone-700 sm:max-w-none sm:px-6">
                            {row.label}
                          </th>
                          <td className="px-3 py-4 text-center sm:px-5">
                            {typeof row.free === 'boolean' ? (
                              <div className="flex justify-center">
                                <CheckCell included={row.free} highlight={false} />
                              </div>
                            ) : (
                              <span className="font-medium text-stone-800">{row.free}</span>
                            )}
                          </td>
                          <td className="bg-orange-200/15 px-3 py-4 text-center sm:px-5">
                            {typeof row.pro === 'boolean' ? (
                              <div className="flex justify-center">
                                <CheckCell included={row.pro} highlight />
                              </div>
                            ) : (
                              <span className="font-medium text-stone-900">{row.pro}</span>
                            )}
                          </td>
                          <td className="px-3 py-4 text-center sm:px-5">
                            {typeof row.premium === 'boolean' ? (
                              <div className="flex justify-center">
                                <CheckCell included={row.premium} highlight={false} />
                              </div>
                            ) : (
                              <span className="font-medium text-stone-800">{row.premium}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Reveal>

            <Reveal delay={60} className="lg:hidden">
              <PricingFaq headingId="pricing-faq-mobile" items={faq} />
            </Reveal>

            <Reveal delay={40}>
              <div className="relative overflow-hidden rounded-2xl border border-stone-400/40 bg-gradient-to-br from-[#ebe4db] via-[#f2ebe3] to-[#e5ddd4] px-6 py-8 text-center shadow-sm ring-1 ring-stone-900/[0.04] sm:px-10 sm:py-10">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 top-0 h-40 w-40 rounded-full bg-orange-400/[0.08] blur-3xl"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-amber-400/[0.07] blur-3xl"
                />
                <p className="relative z-[1] font-display text-lg font-semibold text-stone-900 sm:text-xl">Start free. Upgrade when it sticks.</p>
                <p className="relative z-[1] mt-2 text-sm text-stone-600 sm:text-base">
                  No card for Free. When checkout is live, you will pick a plan in settings.
                </p>
                <div className="relative z-[1] mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                  <Link
                    to="/register"
                    className={`inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-800/95 to-amber-800/90 px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-orange-950/20 transition hover:from-orange-800 hover:to-amber-700/90 ${focusRing}`}
                  >
                    Create free account
                  </Link>
                  <Link
                    to="/login"
                    className={`inline-flex items-center justify-center rounded-full border-2 border-stone-500/30 bg-[#faf7f2] px-8 py-3.5 text-sm font-semibold text-stone-900 shadow-sm transition hover:border-orange-400/45 ${focusRing}`}
                  >
                    Log in
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </main>
  );
}
