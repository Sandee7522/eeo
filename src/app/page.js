'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Filter,
  FileSpreadsheet,
  Download,
  Globe,
  Shield,
  Zap,
  Users,
  ChevronRight,
  ArrowRight,
  Menu,
  X,
  Star,
  Check,
  ExternalLink,
  Play,
  Database,
  Search,
  BarChart3,
  Layers,
} from 'lucide-react';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// ─── atoms ──────────────────────────────────────────────────────────────────

function Badge({ children }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
      style={{
        background: 'rgba(6,182,212,0.08)',
        border: '1px solid rgba(6,182,212,0.2)',
        color: '#67e8f9',
      }}
    >
      {children}
    </span>
  );
}

function GradientText({ children, className }) {
  return (
    <span
      className={cn('bg-clip-text text-transparent', className)}
      style={{ backgroundImage: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' }}
    >
      {children}
    </span>
  );
}

function PrimaryButton({ href, children, className, onClick }) {
  const base = 'neu-btn-primary group inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold';
  if (href)
    return <Link href={href} className={cn(base, className)}>{children}</Link>;
  return <button onClick={onClick} className={cn(base, className)}>{children}</button>;
}

function SecondaryButton({ href, children, className }) {
  const base = 'neu-btn inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-slate-300';
  if (href)
    return <Link href={href} className={cn(base, className)}>{children}</Link>;
  return <button className={cn(base, className)}>{children}</button>;
}

// ─── Navbar ─────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#export', label: 'Export' },
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
      style={scrolled ? {
        background: 'rgba(18,25,46,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      } : {}}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white transition-transform duration-200 group-hover:scale-110"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              boxShadow: '0 4px 14px rgba(6,182,212,0.4)',
            }}
          >
            <MapPin className="h-4 w-4" />
          </div>
          <span className="font-bold text-white tracking-tight">
            Map<span className="text-cyan-400">Scrape</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
              style={{ transition: 'color 0.2s' }}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <PrimaryButton href="/dashboard" className="h-9 px-5 text-sm">
              Get started
              <ChevronRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
            </PrimaryButton>
          </div>
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="neu-btn rounded-lg p-2 text-slate-400 hover:text-white md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="px-4 pb-4 pt-2 md:hidden"
          style={{
            background: 'rgba(18,25,46,0.98)',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-white"
              >
                {label}
              </a>
            ))}
            <PrimaryButton href="/dashboard" className="mt-2 justify-center h-10">
              Get started <ChevronRight className="h-4 w-4" />
            </PrimaryButton>
          </nav>
        </div>
      )}
    </header>
  );
}

// ─── Hero ───────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-32 sm:px-6 sm:pt-40 lg:px-8 lg:pb-28 lg:pt-44">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full blur-[120px]"
          style={{ background: 'rgba(6,182,212,0.08)' }} />
        <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full blur-[120px]"
          style={{ background: 'rgba(59,130,246,0.08)' }} />
        <div className="absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full blur-[80px]"
          style={{ background: 'rgba(6,182,212,0.05)' }} />
      </div>

      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(to right, #06b6d4 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />

      <div className="relative mx-auto max-w-4xl text-center">
        {/* Pill badge */}
        <div className="mb-6 flex justify-center">
          <Badge>
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            Now with CSV &amp; Excel export
          </Badge>
        </div>

        <h1 className="mb-6 text-4xl font-extrabold leading-[1.12] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          Turn Google Maps into{' '}
          <br className="hidden sm:block" />
          <GradientText>a lead machine</GradientText>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl">
          Extract business names, addresses, phones, websites, and ratings from
          Google Maps at scale. Filter by country, city, or category. Export in
          one click.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <PrimaryButton href="/dashboard" className="h-12 px-8 text-base">
            Start scraping free
            <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" />
          </PrimaryButton>
          <SecondaryButton href="#how-it-works" className="h-12 px-8 text-base">
            <Play className="h-4 w-4" />
            See how it works
          </SecondaryButton>
        </div>

        {/* Social proof */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
          {[
            { icon: Shield, text: 'No credit card' },
            { icon: Zap, text: 'Instant setup' },
            { icon: Star, text: '4.9 / 5 rating' },
          ].map(({ icon: Icon, text }) => (
            <span key={text} className="flex items-center gap-1.5">
              <Icon className="h-4 w-4 text-cyan-500" />
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* Hero preview card */}
      <div className="relative mx-auto mt-16 max-w-5xl px-4 sm:px-0">
        <div
          className="overflow-hidden rounded-2xl"
          style={{
            background: '#171e35',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '-8px -8px 20px rgba(16,24,60,0.6), 8px 8px 24px rgba(0,0,0,0.7)',
          }}
        >
          {/* Fake browser bar */}
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{ background: '#0f1528', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          >
            <span className="h-3 w-3 rounded-full bg-red-500/70" />
            <span className="h-3 w-3 rounded-full bg-amber-500/70" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/70" />
            <div
              className="mx-auto flex h-6 w-64 items-center rounded-md px-3"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <span className="truncate text-xs text-slate-500">mapscrape.io/dashboard</span>
            </div>
          </div>
          {/* Mock dashboard */}
          <div className="p-5 sm:p-6" style={{ background: '#12192e' }}>
            <div className="mb-4 flex gap-3">
              <div
                className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2.5"
                style={{
                  background: '#0f1528',
                  border: '1px solid rgba(255,255,255,0.05)',
                  boxShadow: 'inset -2px -2px 4px rgba(16,24,60,0.5), inset 2px 2px 5px rgba(0,0,0,0.5)',
                }}
              >
                <Search className="h-4 w-4 shrink-0 text-slate-600" />
                <span className="text-sm text-slate-400">restaurants in Mumbai</span>
              </div>
              <div
                className="flex items-center rounded-xl px-3 text-sm text-slate-400"
                style={{
                  background: '#0f1528',
                  border: '1px solid rgba(255,255,255,0.05)',
                  boxShadow: 'inset -2px -2px 4px rgba(16,24,60,0.5), inset 2px 2px 5px rgba(0,0,0,0.5)',
                }}
              >
                20
              </div>
              <div
                className="flex items-center gap-1.5 rounded-xl px-4 text-sm font-semibold text-white"
                style={{
                  background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                  boxShadow: '0 4px 14px rgba(6,182,212,0.35)',
                }}
              >
                <MapPin className="h-3.5 w-3.5" />
                Scrape
              </div>
            </div>
            {/* Fake table */}
            <div
              className="overflow-hidden rounded-xl"
              style={{
                background: '#0f1528',
                border: '1px solid rgba(255,255,255,0.04)',
                boxShadow: 'inset -2px -2px 5px rgba(16,24,60,0.45), inset 2px 2px 6px rgba(0,0,0,0.45)',
              }}
            >
              <div
                className="grid grid-cols-4 gap-0 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                <span>Name</span><span>Location</span><span>Rating</span><span>Status</span>
              </div>
              {[
                { name: 'The Bombay Canteen', city: 'Mumbai, MH', rating: '4.5', status: 'OPERATIONAL', dot: '#10b981' },
                { name: 'Leopold Cafe', city: 'Mumbai, MH', rating: '4.2', status: 'OPERATIONAL', dot: '#10b981' },
                { name: 'Trishna Restaurant', city: 'Mumbai, MH', rating: '4.6', status: 'OPERATIONAL', dot: '#10b981' },
                { name: 'Mahesh Lunch Home', city: 'Mumbai, MH', rating: '4.3', status: 'CLOSED', dot: '#ef4444' },
              ].map((row) => (
                <div
                  key={row.name}
                  className="grid grid-cols-4 items-center gap-0 px-4 py-3 text-xs last:border-0 transition hover:bg-white/[0.02]"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                >
                  <span className="font-medium text-white truncate pr-2">{row.name}</span>
                  <span className="flex items-center gap-1 text-slate-400 truncate pr-2">
                    <MapPin className="h-3 w-3 shrink-0 text-slate-600" />
                    {row.city}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-amber-400">
                    <Star className="h-3 w-3 fill-amber-400" />
                    {row.rating}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: row.dot }} />
                    <span className="text-slate-400">{row.status}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Bottom fade */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
          style={{ background: 'linear-gradient(to top, #12192e, transparent)' }}
        />
      </div>
    </section>
  );
}

// ─── Stats bar ───────────────────────────────────────────────────────────────

const STATS = [
  { value: '1.2M+', label: 'Businesses scraped' },
  { value: '98.7%', label: 'Uptime' },
  { value: '< 60s', label: 'Avg. scrape time' },
  { value: '50+', label: 'Countries covered' },
];

function StatsBar() {
  return (
    <section
      className="py-10"
      style={{
        background: '#171e35',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        boxShadow: '-4px -4px 10px rgba(16,24,60,0.4), 4px 4px 12px rgba(0,0,0,0.4)',
      }}
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                <GradientText>{value}</GradientText>
              </p>
              <p className="mt-1 text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: MapPin,
    title: 'Extract business data',
    description: 'Pull names, addresses, phones, websites, ratings, and hours from any Google Maps search in one click.',
    gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
    glow: 'rgba(6,182,212,0.3)',
  },
  {
    icon: Filter,
    title: 'Precision filtering',
    description: 'Narrow by country, state, city, or category. Target exact regions for hyper-local lead campaigns.',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    glow: 'rgba(139,92,246,0.3)',
  },
  {
    icon: FileSpreadsheet,
    title: 'CSV & Excel export',
    description: 'One-click export in CSV or Excel. Drop it straight into your CRM, Sheets, or outreach tool.',
    gradient: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
    glow: 'rgba(236,72,153,0.3)',
  },
  {
    icon: Zap,
    title: 'High-speed scraping',
    description: 'Intelligent rate limiting and retry logic. Go from search query to clean dataset in under a minute.',
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    glow: 'rgba(245,158,11,0.3)',
  },
  {
    icon: Database,
    title: 'Persistent database',
    description: 'All scraped profiles stored in a queryable database. Revisit, filter, and re-export anytime.',
    gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
    glow: 'rgba(16,185,129,0.3)',
  },
  {
    icon: Shield,
    title: 'Responsible & reliable',
    description: 'Built-in polite delays, error handling, and deduplication. Clean data, every time.',
    gradient: 'linear-gradient(135deg, #64748b, #475569)',
    glow: 'rgba(100,116,139,0.3)',
  },
];

function FeatureCard({ icon: Icon, title, description, gradient, glow }) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
      style={{
        background: '#171e35',
        border: '1px solid rgba(255,255,255,0.04)',
        boxShadow: '-5px -5px 12px rgba(16,24,60,0.55), 5px 5px 14px rgba(0,0,0,0.55)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `-5px -5px 12px rgba(16,24,60,0.55), 5px 5px 14px rgba(0,0,0,0.55), 0 0 30px ${glow}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '-5px -5px 12px rgba(16,24,60,0.55), 5px 5px 14px rgba(0,0,0,0.55)';
      }}
    >
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md"
        style={{ background: gradient, boxShadow: `0 4px 14px ${glow}` }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mb-2 text-base font-bold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-400">{description}</p>
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <Badge>
            <Layers className="h-3 w-3" />
            Features
          </Badge>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Everything for map-based{' '}
            <GradientText>lead generation</GradientText>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400 sm:text-lg">
            One tool to scrape, filter, and export business data from Google Maps — no code required.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => <FeatureCard key={f.title} {...f} />)}
        </div>
      </div>
    </section>
  );
}

// ─── How it works ────────────────────────────────────────────────────────────

const STEPS = [
  {
    step: '01',
    icon: Search,
    title: 'Enter a search query',
    description: 'Type any Google Maps query — "coffee shops in London", "plumbers in New York" — and set the max results.',
  },
  {
    step: '02',
    icon: Zap,
    title: 'We scrape it for you',
    description: 'Our engine navigates Google Maps, visits each listing, and extracts every data point — all automatically.',
  },
  {
    step: '03',
    icon: BarChart3,
    title: 'Filter, explore & export',
    description: 'Your data lands in a searchable table. Filter by city, rating, or category. Export to CSV in one click.',
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <Badge>
            <Play className="h-3 w-3" />
            How it works
          </Badge>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            From query to leads in{' '}
            <GradientText>three steps</GradientText>
          </h2>
        </div>

        <div className="relative grid gap-8 md:grid-cols-3">
          {/* Connector line */}
          <div
            className="pointer-events-none absolute left-0 right-0 top-10 hidden h-px md:block"
            style={{ background: 'linear-gradient(to right, transparent, rgba(6,182,212,0.3), transparent)' }}
          />

          {STEPS.map(({ step, icon: Icon, title, description }, i) => (
            <div key={step} className="relative flex flex-col items-center text-center">
              <div
                className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl"
                style={{
                  background: '#171e35',
                  border: '1px solid rgba(6,182,212,0.15)',
                  boxShadow: '-5px -5px 12px rgba(16,24,60,0.55), 5px 5px 14px rgba(0,0,0,0.55)',
                }}
              >
                <Icon className="h-8 w-8 text-cyan-400" />
                <span
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white shadow"
                  style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}
                >
                  {i + 1}
                </span>
              </div>
              <h3 className="mb-2 text-lg font-bold text-white">{title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Export CTA ──────────────────────────────────────────────────────────────

const EXPORT_FEATURES = ['CSV & Excel formats', 'All fields included', 'No row limits', 'Instant download'];

function ExportSection() {
  return (
    <section id="export" className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div
          className="relative overflow-hidden rounded-3xl p-10 sm:p-14"
          style={{
            background: 'linear-gradient(135deg, #0e7490 0%, #1d4ed8 100%)',
            boxShadow: '0 20px 60px rgba(6,182,212,0.25), -6px -6px 16px rgba(16,24,60,0.5), 6px 6px 20px rgba(0,0,0,0.6)',
          }}
        >
          {/* Background texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full blur-3xl"
            style={{ background: 'rgba(255,255,255,0.08)' }} />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-56 w-56 rounded-full blur-3xl"
            style={{ background: 'rgba(255,255,255,0.08)' }} />

          <div className="relative flex flex-col items-center gap-8 text-center md:flex-row md:justify-between md:text-left">
            <div className="max-w-lg">
              <div className="mb-4 flex items-center justify-center gap-2 md:justify-start">
                <Download className="h-5 w-5 text-white/80" />
                <span className="text-sm font-semibold uppercase tracking-widest text-white/80">Export</span>
              </div>
              <h2 className="mb-3 text-3xl font-extrabold text-white sm:text-4xl">
                Download your leads in seconds
              </h2>
              <p className="text-base text-white/70 sm:text-lg">
                One-click export to CSV or Excel. Paste straight into your CRM, cold-email tool, or Google Sheets.
              </p>
              <ul className="mt-5 flex flex-wrap justify-center gap-3 md:justify-start">
                {EXPORT_FEATURES.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium text-white"
                    style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
                  >
                    <Check className="h-3.5 w-3.5 text-emerald-300" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="shrink-0">
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-cyan-700 shadow-xl shadow-black/20 transition-all duration-200 hover:scale-[1.03] hover:shadow-2xl active:scale-[0.98]"
              >
                Start exporting free
                <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote: 'MapScrape cut our lead research time from days to minutes. We pulled 500 local restaurants in one go and had them in HubSpot the same afternoon.',
    name: 'Priya Sharma',
    role: 'Head of Growth · SaaSify',
    avatar: 'PS',
    gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
  },
  {
    quote: 'The CSV export is flawless. Every field we need — phone, website, rating — all there. Our sales team loves it.',
    name: 'James Carter',
    role: 'Sales Director · ReachOut',
    avatar: 'JC',
    gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
  },
  {
    quote: "Incredible tool. We ran a campaign targeting dentists across three cities and had qualified leads the same day we signed up.",
    name: 'Anika Patel',
    role: 'Founder · LeadFlow',
    avatar: 'AP',
    gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
  },
];

function TestimonialCard({ quote, name, role, avatar, gradient }) {
  return (
    <div
      className="flex flex-col gap-5 rounded-2xl p-6"
      style={{
        background: '#171e35',
        border: '1px solid rgba(255,255,255,0.04)',
        boxShadow: '-5px -5px 12px rgba(16,24,60,0.55), 5px 5px 14px rgba(0,0,0,0.55)',
      }}
    >
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="flex-1 text-sm leading-relaxed text-slate-300">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow"
          style={{ background: gradient }}
        >
          {avatar}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{name}</p>
          <p className="text-xs text-slate-500">{role}</p>
        </div>
      </div>
    </div>
  );
}

function Testimonials() {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <Badge>
            <Users className="h-3 w-3" />
            Testimonials
          </Badge>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Loved by sales teams{' '}
            <GradientText>worldwide</GradientText>
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => <TestimonialCard key={t.name} {...t} />)}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ───────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="mb-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Ready to{' '}
          <GradientText>start generating leads?</GradientText>
        </h2>
        <p className="mb-8 text-lg text-slate-400">
          No setup. No credit card. Just enter a query and watch the leads roll in.
        </p>
        <PrimaryButton href="/dashboard" className="h-14 px-10 text-base">
          Get started for free
          <ArrowRight className="h-5 w-5 transition-transform duration-150 group-hover:translate-x-1" />
        </PrimaryButton>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────

const FOOTER_LINKS = {
  Product: [
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How it works' },
    { href: '#export', label: 'Export' },
    { href: '/dashboard', label: 'Dashboard' },
  ],
  Company: [
    { href: '#', label: 'About' },
    { href: '#', label: 'Blog' },
    { href: '#', label: 'Careers' },
  ],
  Legal: [
    { href: '#', label: 'Privacy' },
    { href: '#', label: 'Terms' },
  ],
};

const SOCIAL = [
  { icon: ExternalLink, href: '#', label: 'Twitter' },
  { icon: ExternalLink, href: '#', label: 'GitHub' },
  { icon: ExternalLink, href: '#', label: 'LinkedIn' },
];

function Footer() {
  return (
    <footer
      style={{
        background: '#171e35',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        boxShadow: '-4px -4px 12px rgba(16,24,60,0.4)',
      }}
    >
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:grid-cols-5">
          {/* Brand col */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
                style={{
                  background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                  boxShadow: '0 4px 14px rgba(6,182,212,0.3)',
                }}
              >
                <MapPin className="h-4 w-4" />
              </div>
              <span className="font-bold text-white tracking-tight">
                Map<span className="text-cyan-400">Scrape</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500">
              Google Maps data extraction for lead generation, sales teams, and growth hackers.
            </p>
            <div className="mt-5 flex gap-3">
              {SOCIAL.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="neu-btn flex h-8 w-8 items-center justify-center text-slate-400 hover:text-white transition"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link cols */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
                {heading}
              </p>
              <ul className="space-y-2.5">
                {links.map(({ href, label }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-sm text-slate-500 transition hover:text-white"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-12 flex flex-col items-center justify-between gap-3 pt-8 text-xs text-slate-600 sm:flex-row"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <p>© {new Date().getFullYear()} MapScrape. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" />
            Built for modern lead generation
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Root page ───────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="min-h-screen text-slate-100" style={{ background: '#12192e' }}>
      <Navbar />
      <Hero />
      <StatsBar />
      <Features />
      <HowItWorks />
      <Testimonials />
      <ExportSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
