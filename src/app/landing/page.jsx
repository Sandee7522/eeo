'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Filter,
  FileSpreadsheet,
  Users,
  Zap,
  Sun,
  Moon,
  ChevronRight,
  Download,
  Globe,
  Shield,
} from 'lucide-react';

// -----------------------------------------------------------------------------
// Theme toggle (uses class on document.documentElement for Tailwind dark:)
// -----------------------------------------------------------------------------
function ThemeToggle({ dark, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="rounded-xl border border-slate-200 bg-white/80 p-2 backdrop-blur-sm transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800/80 dark:hover:bg-slate-700"
      aria-label="Toggle theme"
    >
      {dark ? (
        <Sun className="h-5 w-5 text-amber-400" />
      ) : (
        <Moon className="h-5 w-5 text-slate-600" />
      )}
    </button>
  );
}

// -----------------------------------------------------------------------------
// Glass card for feature / CTA
// -----------------------------------------------------------------------------
function GlassCard({ children, className = '' }) {
  return (
    <div
      className={
        'rounded-2xl border border-white/20 bg-white/60 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-800/60 ' +
        className
      }
    >
      {children}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Feature item for the grid
// -----------------------------------------------------------------------------
function Feature({ icon: Icon, title, description }) {
  return (
    <GlassCard className="flex flex-col gap-3 transition hover:border-white/30 hover:shadow-2xl dark:hover:border-white/20">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {description}
      </p>
    </GlassCard>
  );
}

// -----------------------------------------------------------------------------
// Main landing page
// -----------------------------------------------------------------------------
export default function LandingPage() {
  const [dark, setDark] = useState(false);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', next);
    }
  };

  return (
    <div
      className={
        'min-h-screen ' +
        (dark
          ? 'bg-slate-950 text-slate-100'
          : 'bg-slate-50 text-slate-900')
      }
    >
      {/* Gradient orbs (ambient background) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className={
            'absolute -left-40 -top-40 h-80 w-80 rounded-full opacity-30 blur-3xl ' +
            (dark ? 'bg-indigo-600' : 'bg-indigo-400')
          }
        />
        <div
          className={
            'absolute -bottom-40 -right-40 h-96 w-96 rounded-full opacity-30 blur-3xl ' +
            (dark ? 'bg-purple-600' : 'bg-purple-400')
          }
        />
        <div
          className={
            'absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full opacity-20 blur-3xl ' +
            (dark ? 'bg-pink-600' : 'bg-pink-300')
          }
        />
      </div>

      {/* Nav */}
      <header className="relative z-10 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-slate-900 dark:text-white"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              <MapPin className="h-5 w-5" />
            </div>
            <span className="text-lg">MapScrape</span>
          </Link>
          <nav className="hidden items-center gap-6 sm:flex">
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Features
            </a>
            <a
              href="#export"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Export
            </a>
            <ThemeToggle dark={dark} onToggle={toggleTheme} />
            <Link
              href="/signin"
              className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
            >
              Get started
              <ChevronRight className="h-4 w-4" />
            </Link>
          </nav>
          <div className="flex items-center gap-2 sm:hidden">
            <ThemeToggle dark={dark} onToggle={toggleTheme} />
            <Link
              href="/signin"
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-2 text-sm font-semibold text-white"
            >
              Start
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Google Maps data extraction
          </p>
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            Scrape business data from{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              Google Maps
            </span>{' '}
            at scale
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            Extract leads, contacts, and business details from Maps. Filter by country, state, or city.
            Export to CSV or Excel. Built for sales teams and lead generation.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3.5 text-base font-semibold text-white shadow-xl transition hover:opacity-90"
            >
              Start scraping free
              <ChevronRight className="h-5 w-5" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white/80 px-6 py-3.5 text-base font-semibold text-slate-700 backdrop-blur-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section id="features" className="relative z-10 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-2 text-center text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Everything you need for map-based lead gen
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-slate-600 dark:text-slate-400">
            One tool to extract, filter, and export business data from Google Maps.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Feature
              icon={MapPin}
              title="Extract business data from maps"
              description="Pull names, addresses, phone numbers, websites, and ratings from Google Maps listings in one click."
            />
            <Feature
              icon={Filter}
              title="Filter by country, state, city"
              description="Narrow results by location. Target specific regions or run nationwide campaigns with precise filters."
            />
            <Feature
              icon={FileSpreadsheet}
              title="Export to CSV / Excel"
              description="Download your data in CSV or Excel format. Integrate with your CRM or use in spreadsheets."
            />
            <Feature
              icon={Users}
              title="Lead generation tool"
              description="Built for sales and marketing. Turn map results into qualified leads and contact lists."
            />
            <Feature
              icon={Zap}
              title="Fast and scalable scraping"
              description="High-throughput extraction with rate limiting and retries. Scale from hundreds to millions of records."
            />
            <Feature
              icon={Shield}
              title="Reliable and compliant"
              description="Respectful scraping practices and robust error handling. Use data responsibly."
            />
          </div>
        </div>
      </section>

      {/* Export / CTA strip */}
      <section id="export" className="relative z-10 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <GlassCard className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                <Download className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Export to CSV or Excel
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  One-click export. No coding required.
                </p>
              </div>
            </div>
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:opacity-90"
            >
              Get started
              <ChevronRight className="h-5 w-5" />
            </Link>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200/50 px-4 py-8 dark:border-slate-800/50">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Globe className="h-4 w-4" />
            <span className="text-sm">MapScrape — Google Maps data for lead gen</span>
          </div>
          <div className="flex gap-6 text-sm">
            <a
              href="#features"
              className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Features
            </a>
            <a
              href="/signin"
              className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Dashboard
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
