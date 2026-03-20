"use client";

import { motion, AnimatePresence } from "framer-motion";

// ─── SVG Illustration: Data scraping / map extraction scene ────────────────

function ScrapingIllustration() {
  return (
    <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-w-md mx-auto">
      {/* Background circles */}
      <circle cx="250" cy="250" r="200" fill="url(#grad1)" opacity="0.08" />
      <circle cx="250" cy="250" r="150" fill="url(#grad2)" opacity="0.06" />

      {/* Globe / Map outline */}
      <circle cx="250" cy="220" r="100" stroke="#06b6d4" strokeWidth="1.5" opacity="0.3" strokeDasharray="6 4" />
      <circle cx="250" cy="220" r="75" stroke="#3b82f6" strokeWidth="1" opacity="0.2" strokeDasharray="4 6" />

      {/* Map pin 1 - main */}
      <g>
        <motion.g
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <path d="M250 180 C250 162, 232 150, 232 135 C232 121, 243 110, 250 110 C257 110, 268 121, 268 135 C268 150, 250 162, 250 180Z" fill="url(#pinGrad1)" />
          <circle cx="250" cy="132" r="7" fill="#12192e" />
          <circle cx="250" cy="132" r="4" fill="#06b6d4" />
        </motion.g>
      </g>

      {/* Map pin 2 */}
      <g>
        <motion.g
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <path d="M320 230 C320 218, 308 210, 308 199 C308 189, 315 182, 320 182 C325 182, 332 189, 332 199 C332 210, 320 218, 320 230Z" fill="url(#pinGrad2)" />
          <circle cx="320" cy="197" r="5" fill="#12192e" />
          <circle cx="320" cy="197" r="3" fill="#8b5cf6" />
        </motion.g>
      </g>

      {/* Map pin 3 */}
      <g>
        <motion.g
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <path d="M190 250 C190 238, 178 230, 178 219 C178 209, 185 202, 190 202 C195 202, 202 209, 202 219 C202 230, 190 238, 190 250Z" fill="url(#pinGrad3)" />
          <circle cx="190" cy="217" r="5" fill="#12192e" />
          <circle cx="190" cy="217" r="3" fill="#10b981" />
        </motion.g>
      </g>

      {/* Connection lines between pins */}
      <motion.line
        x1="250" y1="175" x2="315" y2="228"
        stroke="#06b6d4" strokeWidth="1" opacity="0.2"
        strokeDasharray="4 4"
        animate={{ opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.line
        x1="250" y1="175" x2="195" y2="248"
        stroke="#3b82f6" strokeWidth="1" opacity="0.2"
        strokeDasharray="4 4"
        animate={{ opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
      />

      {/* Data extraction: floating cards */}
      <motion.g
        animate={{ y: [0, -5, 0], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <rect x="80" y="310" width="100" height="60" rx="8" fill="#171e35" stroke="#06b6d4" strokeWidth="0.5" opacity="0.6" />
        <rect x="92" y="322" width="50" height="4" rx="2" fill="#06b6d4" opacity="0.5" />
        <rect x="92" y="332" width="70" height="3" rx="1.5" fill="#4a5568" opacity="0.4" />
        <rect x="92" y="340" width="60" height="3" rx="1.5" fill="#4a5568" opacity="0.3" />
        <rect x="92" y="348" width="40" height="3" rx="1.5" fill="#4a5568" opacity="0.2" />
        <circle cx="158" cy="325" r="8" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.5" />
        <path d="M155 325 L157 327 L161 323" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      </motion.g>

      <motion.g
        animate={{ y: [0, -5, 0], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <rect x="320" y="310" width="100" height="60" rx="8" fill="#171e35" stroke="#3b82f6" strokeWidth="0.5" opacity="0.6" />
        <rect x="332" y="322" width="50" height="4" rx="2" fill="#3b82f6" opacity="0.5" />
        <rect x="332" y="332" width="70" height="3" rx="1.5" fill="#4a5568" opacity="0.4" />
        <rect x="332" y="340" width="55" height="3" rx="1.5" fill="#4a5568" opacity="0.3" />
        <rect x="332" y="348" width="45" height="3" rx="1.5" fill="#4a5568" opacity="0.2" />
        <circle cx="398" cy="325" r="8" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.5" />
        <path d="M395 325 L397 327 L401 323" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      </motion.g>

      {/* Central data stream - arrows going down */}
      <motion.g
        animate={{ y: [0, 10, 0], opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <path d="M250 285 L250 305 M245 300 L250 305 L255 300" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" />
      </motion.g>

      {/* Bottom database icon */}
      <motion.g
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ellipse cx="250" cy="400" rx="50" ry="12" fill="#171e35" stroke="#06b6d4" strokeWidth="1" opacity="0.4" />
        <rect x="200" y="388" width="100" height="12" fill="#171e35" opacity="0.4" />
        <ellipse cx="250" cy="388" rx="50" ry="12" fill="#171e35" stroke="#06b6d4" strokeWidth="1" opacity="0.4" />
        <rect x="200" y="376" width="100" height="12" fill="#171e35" opacity="0.4" />
        <ellipse cx="250" cy="376" rx="50" ry="12" fill="#171e35" stroke="#06b6d4" strokeWidth="1" opacity="0.5" />
      </motion.g>

      {/* Floating particles */}
      {[
        { cx: 120, cy: 180, delay: 0 },
        { cx: 380, cy: 160, delay: 0.5 },
        { cx: 400, cy: 280, delay: 1 },
        { cx: 100, cy: 280, delay: 1.5 },
        { cx: 300, cy: 140, delay: 2 },
        { cx: 160, cy: 160, delay: 0.8 },
      ].map((p, i) => (
        <motion.circle
          key={i}
          cx={p.cx}
          cy={p.cy}
          r="2"
          fill="#06b6d4"
          animate={{ opacity: [0, 0.6, 0], scale: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, delay: p.delay }}
        />
      ))}

      {/* Text label */}
      <text x="250" y="445" textAnchor="middle" fill="#4a5568" fontSize="11" fontFamily="system-ui">
        Extracting business data...
      </text>

      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="pinGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="pinGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="pinGrad3" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Page transition variants ──────────────────────────────────────────────

const pageVariants = {
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 40 },
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.35,
};

// ─── AuthLayout ────────────────────────────────────────────────────────────

export default function AuthLayout({ children, pageKey }) {
  return (
    <div
      className="flex min-h-screen items-center justify-center overflow-hidden px-4 py-6 sm:px-6 md:py-10"
      style={{ background: "#0c1220" }}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -left-40 -top-40 h-96 w-96 rounded-full blur-[140px]"
          style={{ background: "rgba(6,182,212,0.08)" }}
        />
        <div
          className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full blur-[140px]"
          style={{ background: "rgba(59,130,246,0.06)" }}
        />
        <div
          className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full blur-[120px]"
          style={{ background: "rgba(139,92,246,0.05)" }}
        />
      </div>

      {/* Centered card container */}
      <div
        className="relative z-20 flex w-full max-w-[1000px] flex-col overflow-hidden rounded-3xl lg:min-h-[600px] lg:flex-row"
        style={{
          background: "rgba(18,25,46,0.5)",
          border: "1px solid rgba(255,255,255,0.05)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03) inset",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Image side — top on mobile, left on desktop */}
        <div
          className="relative z-30 overflow-hidden lg:w-[48%]"
          style={{
            background: "rgba(15,21,40,0.6)",
            borderRight: "1px solid rgba(255,255,255,0.03)",
          }}
        >
          {/* Image with slide-in animation */}
          <motion.div
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative h-56 sm:h-64 lg:h-full lg:min-h-[600px]"
          >
            <img
              src="https://www.intelligentcio.com/me/wp-content/uploads/sites/12/2020/01/1000-17.jpg"
              alt="Data extraction illustration"
              className="h-full w-full object-cover"
            />
            {/* Dark overlay gradient */}
            <div
              className="absolute inset-0 z-10"
              style={{
                background: "linear-gradient(135deg, rgba(12,18,32,0.7) 0%, rgba(6,182,212,0.15) 50%, rgba(12,18,32,0.8) 100%)",
              }}
            />
            {/* Bottom text overlay */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              className="absolute bottom-0 left-0 right-0 z-20 p-6 lg:p-8"
              style={{
                background: "linear-gradient(to top, rgba(12,18,32,0.95) 0%, transparent 100%)",
              }}
            >
              <h2 className="text-lg font-bold text-white lg:text-xl">
                Extract business data at scale
              </h2>
              <p className="mt-1.5 max-w-xs text-xs text-slate-400 lg:text-sm lg:mt-2">
                Scrape Google Maps listings, get emails, phone numbers, and more. Built for lead generation.
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Form side */}
        <div className="relative z-30 flex w-full flex-col items-center justify-center px-5 py-8 sm:px-8 lg:w-[52%] lg:px-12 lg:py-12">
          {/* Animated form */}
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={pageKey}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Shared form sub-components ────────────────────────────────────────────

export function AuthCard({ children }) {
  return (
    <div
      className="rounded-2xl p-6 sm:p-8"
      style={{
        background: "rgba(23,30,53,0.6)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {children}
    </div>
  );
}

export function AuthTitle({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      {subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}

export function InputField({ icon: Icon, label, error, ...props }) {
  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />}
        <input
          {...props}
          className={`w-full rounded-xl border bg-transparent py-2.5 text-sm text-slate-200 placeholder-slate-600 transition-all focus:outline-none ${
            Icon ? "pl-10 pr-3" : "px-3"
          } ${props.className || ""}`}
          style={{
            background: "rgba(12,18,32,0.6)",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
            ...(props.style || {}),
          }}
        />
      </div>
      {error && <p className="mt-1 text-[11px] text-red-400">{error}</p>}
    </div>
  );
}

export function PasswordField({ label, value, onChange, showPassword, onToggle, error, ...props }) {
  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </label>
      )}
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600"
        >
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          className="w-full rounded-xl py-2.5 pl-10 pr-10 text-sm text-slate-200 placeholder-slate-600 transition-all focus:outline-none"
          style={{
            background: "rgba(12,18,32,0.6)",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
          }}
          {...props}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 transition-colors hover:text-slate-400"
          tabIndex={-1}
        >
          {showPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {error && <p className="mt-1 text-[11px] text-red-400">{error}</p>}
    </div>
  );
}

export function PrimarySubmitButton({ loading, loadingText, children }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.01 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
      className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
        boxShadow: "0 4px 20px rgba(6,182,212,0.3)",
      }}
    >
      {loading ? (
        <>
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
          </svg>
          {loadingText}
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}

export function ErrorAlert({ message }) {
  if (!message) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-5 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-red-300"
      style={{
        background: "rgba(239, 68, 68, 0.08)",
        border: "1px solid rgba(239, 68, 68, 0.15)",
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {message}
    </motion.div>
  );
}

export function SuccessAlert({ message }) {
  if (!message) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-5 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-emerald-300"
      style={{
        background: "rgba(16, 185, 129, 0.08)",
        border: "1px solid rgba(16, 185, 129, 0.15)",
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
      {message}
    </motion.div>
  );
}

export function PasswordStrength({ password }) {
  if (!password) return null;

  const checks = [
    { key: "length", label: "8+ characters", pass: password.length >= 8 },
    { key: "upper", label: "Uppercase", pass: /[A-Z]/.test(password) },
    { key: "lower", label: "Lowercase", pass: /[a-z]/.test(password) },
    { key: "number", label: "Number", pass: /[0-9]/.test(password) },
  ];

  const passed = checks.filter((c) => c.pass).length;
  const pct = (passed / checks.length) * 100;
  const color =
    pct <= 25 ? "#ef4444" : pct <= 50 ? "#f59e0b" : pct <= 75 ? "#06b6d4" : "#10b981";

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mt-2 space-y-2"
    >
      {/* Progress bar */}
      <div className="h-1 w-full rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map(({ key, label, pass }) => (
          <span
            key={key}
            className={`text-[10px] font-medium transition-colors ${
              pass ? "text-emerald-400" : "text-slate-600"
            }`}
          >
            {pass ? "\u2713" : "\u25CB"} {label}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
