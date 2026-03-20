"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Globe,
  Star,
  Mail,
  Trash2,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  SlidersHorizontal,
  X,
  ArrowLeft,
  History,
  LogOut,
  User,
  Search,
} from "lucide-react";
import {
  fetchCompanies,
  startScrape,
  deleteCompany,
  fetchHistory,
  exportCompanies,
  getAllCompanyIds,
} from "@/app/lib/dashboardApi";
import { logoutApi, isAuthenticated, getCurrentUser } from "@/app/lib/authApi";
import SearchableSelect from "@/components/ui/SearchableSelect";

const COMPANY_LIMIT = 10;
const HISTORY_LIMIT = 5;

const MAX_RESULTS_OPTIONS = [5, 10, 20, 50, 100];

const CITY_OPTIONS = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata",
  "Pune", "Ahmedabad", "Surat", "Jaipur", "Lucknow", "Kanpur",
  "Nagpur", "Indore", "Bhopal", "Patna", "Vadodara", "Ludhiana",
  "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Varanasi",
  "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Ranchi",
  "Coimbatore", "Visakhapatnam", "Jodhpur", "Madurai", "Raipur",
  "Kochi", "Chandigarh", "Guwahati", "Mysore", "Thiruvananthapuram",
  "Bhubaneswar", "Noida", "Gurgaon", "Navi Mumbai", "Thane", "Ghaziabad",
];

const CATEGORY_OPTIONS = [
  { label: "Restaurants", value: "restaurant" },
  { label: "Cafes & Coffee Shops", value: "coffee" },
  { label: "Bars & Nightlife", value: "bar" },
  { label: "Fast Food", value: "fast food" },
  { label: "Retail Stores", value: "store" },
  { label: "Shopping Malls", value: "mall" },
  { label: "Supermarkets", value: "supermarket" },
  { label: "Hospitals", value: "hospital" },
  { label: "Clinics & Doctors", value: "clinic" },
  { label: "Pharmacies", value: "pharmacy" },
  { label: "Dental", value: "dental" },
  { label: "Schools & Colleges", value: "school" },
  { label: "Coaching Centers", value: "coaching" },
  { label: "Hotels & Resorts", value: "hotel" },
  { label: "Banks & ATMs", value: "bank" },
  { label: "Insurance", value: "insurance" },
  { label: "Gyms & Fitness", value: "gym" },
  { label: "Salons & Spas", value: "salon" },
  { label: "Automotive", value: "automobile" },
  { label: "Car Dealers", value: "car dealer" },
  { label: "Real Estate", value: "real estate" },
  { label: "IT & Software", value: "software" },
  { label: "BPO & Call Centers", value: "bpo" },
  { label: "Lawyers & Legal", value: "lawyer" },
  { label: "Consulting", value: "consulting" },
  { label: "Logistics & Courier", value: "logistics" },
  { label: "Event Management", value: "event" },
  { label: "Tours & Travel", value: "travel" },
  { label: "Taxi & Transport", value: "transport" },
];

const COUNTRY_OPTIONS = [
  "India", "United States", "United Kingdom", "Canada", "Australia",
  "Germany", "France", "UAE", "Singapore", "Japan", "Brazil",
  "Mexico", "South Africa", "Nigeria", "Kenya",
];

const INDIA_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal", "Delhi", "Chandigarh", "Puducherry", "Jammu & Kashmir", "Ladakh",
];

const RATING_OPTIONS = [
  { label: "3.0+", value: "3" },
  { label: "3.5+", value: "3.5" },
  { label: "4.0+", value: "4" },
  { label: "4.5+", value: "4.5" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // ── Auth guard ──
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/signin");
      return;
    }
    setUser(getCurrentUser());
  }, [router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutApi();
    } catch {
      // Clear session anyway
    }
    router.push("/signin");
  };

  // ── Scrape form ──
  const [queryType, setQueryType] = useState("");
  const [queryCity, setQueryCity] = useState("");
  const [maxResults, setMaxResults] = useState(20);
  const query = queryType && queryCity ? `${queryType} in ${queryCity}` : "";
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState(null);
  const [scrapeError, setScrapeError] = useState(null);

  // ── Companies table ──
  const [companies, setCompanies] = useState([]);
  const [companyMeta, setCompanyMeta] = useState({ page: 1, pageSize: COMPANY_LIMIT, totalCount: 0, totalPages: 1 });
  const [companyPage, setCompanyPage] = useState(1);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyError, setCompanyError] = useState(null);

  // ── Filters ──
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: "", city: "", state: "", country: "", category: "", minRating: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    search: "", city: "", state: "", country: "", category: "", minRating: "",
  });

  // ── History table ──
  const [historyData, setHistoryData] = useState([]);
  const [historyMeta, setHistoryMeta] = useState({ page: 1, pageSize: HISTORY_LIMIT, totalCount: 0, totalPages: 1 });
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);

  // ── Search (live) ──
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCompanyPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ── Selection ──
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [exporting, setExporting] = useState(false);

  const [selectingAll, setSelectingAll] = useState(false);
  const allSelected = selectedIds.size > 0 && selectedIds.size >= companyMeta.totalCount;
  const pageAllSelected = companies.length > 0 && companies.every((c) => selectedIds.has(c.id));

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = async () => {
    if (allSelected || pageAllSelected) {
      // Deselect all
      setSelectedIds(new Set());
    } else {
      // Fetch ALL IDs from backend and select them
      setSelectingAll(true);
      try {
        const filters = {};
        if (debouncedSearch || appliedFilters.search) filters.search = debouncedSearch || appliedFilters.search;
        if (appliedFilters.city) filters.city = appliedFilters.city;
        if (appliedFilters.state) filters.state = appliedFilters.state;
        if (appliedFilters.country) filters.country = appliedFilters.country;
        if (appliedFilters.category) filters.category = appliedFilters.category;
        if (appliedFilters.minRating) filters.minRating = appliedFilters.minRating;

        const ids = await getAllCompanyIds(filters);
        setSelectedIds(new Set(ids));
      } catch {
        // Fallback: select current page only
        setSelectedIds(new Set(companies.map((c) => c.id)));
      } finally {
        setSelectingAll(false);
      }
    }
  };

  // ── Delete ──
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  // ── Fetch companies ──
  const loadCompanies = useCallback(async () => {
    try {
      setCompanyLoading(true);
      setCompanyError(null);

      const payload = {};
      if (debouncedSearch || appliedFilters.search) payload.search = debouncedSearch || appliedFilters.search;
      if (appliedFilters.city) payload.city = appliedFilters.city;
      if (appliedFilters.state) payload.state = appliedFilters.state;
      if (appliedFilters.country) payload.country = appliedFilters.country;
      if (appliedFilters.category) payload.category = appliedFilters.category;
      if (appliedFilters.minRating) payload.minRating = Number(appliedFilters.minRating);

      const result = await fetchCompanies({ page: companyPage, pageSize: COMPANY_LIMIT, ...payload });
      setCompanies(result.data || []);
      setCompanyMeta(result.meta || { page: 1, pageSize: COMPANY_LIMIT, totalCount: 0, totalPages: 1 });
    } catch (err) {
      setCompanyError(err.message || "Failed to fetch companies");
    } finally {
      setCompanyLoading(false);
    }
  }, [companyPage, appliedFilters, debouncedSearch]);

  // ── Fetch history ──
  const loadHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const result = await fetchHistory({ page: historyPage, pageSize: HISTORY_LIMIT });
      setHistoryData(result.data || []);
      setHistoryMeta(result.meta || { page: 1, pageSize: HISTORY_LIMIT, totalCount: 0, totalPages: 1 });
    } catch {
      // silent
    } finally {
      setHistoryLoading(false);
    }
  }, [historyPage]);

  useEffect(() => { loadCompanies(); }, [loadCompanies]);
  useEffect(() => { loadHistory(); }, [loadHistory]);

  // ── Handlers ──
  const handleScrape = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setScraping(true);
    setScrapeResult(null);
    setScrapeError(null);
    try {
      const result = await startScrape({ query: query.trim(), maxResults: Number(maxResults) });
      setScrapeResult(result);
      loadCompanies();
      loadHistory();
    } catch (err) {
      setScrapeError(err.message || "Scraping failed");
    } finally {
      setScraping(false);
    }
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    setCompanyPage(1);
  };

  const handleResetFilters = () => {
    const empty = { search: "", city: "", state: "", country: "", category: "", minRating: "" };
    setFilters(empty);
    setAppliedFilters(empty);
    setCompanyPage(1);
    setShowFilters(false);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    setDeleteError(null);
    try {
      await deleteCompany(id);
      loadCompanies();
    } catch (err) {
      setDeleteError(err.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const downloadCSV = (data) => {
    const headers = ["Name","Category","Address","City","State","Country","Phone","Website","Email","Rating","Total Reviews","Status"];
    const rows = data.map((c) =>
      [c.name,c.category,c.address,c.city,c.state,c.country,c.phone,c.website,c.email,c.rating,c.totalReviews,c.status]
        .map((v) => (v == null ? "" : `"${String(v).replace(/"/g, '""')}"`)),
    );
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mapscrape-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      if (selectedIds.size > 0) {
        // Export only selected rows
        const data = await exportCompanies({ ids: [...selectedIds] });
        downloadCSV(data);
      } else {
        // Export ALL data (with current filters applied)
        const data = await exportCompanies({ filters: appliedFilters });
        downloadCSV(data);
      }
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;

  return (
    <div className="min-h-screen text-slate-100" style={{ background: "#12192e" }}>
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-5 md:p-6">

        {/* ── Header ── */}
        <header className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="neu-btn flex items-center justify-center p-2.5 text-slate-400 hover:text-white transition"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Google Maps Scraper
            </p>
            <h1 className="mt-0.5 text-2xl font-bold text-white sm:text-3xl">
              Scraper <span className="text-cyan-400">Dashboard</span>
            </h1>
          </div>
          {/* User info + Logout */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden items-center gap-2 sm:flex">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-cyan-300"
                  style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.25)" }}
                >
                  {user.name?.[0]?.toUpperCase() || <User className="h-3.5 w-3.5" />}
                </div>
                <span className="text-sm font-medium text-slate-300">{user.name}</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="neu-btn inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-red-400"
            >
              {loggingOut ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <LogOut className="h-3.5 w-3.5" />
              )}
              Logout
            </button>
          </div>
        </header>

        {/* ── Scrape Form ── */}
        <section className="neu-card p-5 sm:p-6">
          <h2 className="mb-4 text-base font-semibold text-white">
            Start a new scrape
          </h2>

          {query && (
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xs text-slate-500">Query:</span>
              <span
                className="rounded-full px-3 py-1 text-xs font-medium text-cyan-300"
                style={{
                  background: "rgba(6,182,212,0.1)",
                  border: "1px solid rgba(6,182,212,0.25)",
                }}
              >
                &quot;{query}&quot;
              </span>
            </div>
          )}

          <form onSubmit={handleScrape} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Business type</label>
              <SearchableSelect
                value={queryType}
                onChange={setQueryType}
                options={CATEGORY_OPTIONS}
                placeholder="Select business type…"
              />
            </div>

            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-slate-400">City / Location</label>
              <SearchableSelect
                value={queryCity}
                onChange={setQueryCity}
                options={CITY_OPTIONS}
                placeholder="Select city…"
              />
            </div>

            <div className="w-full sm:w-36">
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Max results</label>
              <SearchableSelect
                value={maxResults}
                onChange={(v) => setMaxResults(Number(v))}
                options={MAX_RESULTS_OPTIONS.map((n) => ({ label: `${n} results`, value: n }))}
                placeholder="Select…"
              />
            </div>

            <button
              type="submit"
              disabled={scraping || !queryType || !queryCity.trim()}
              className="neu-btn-primary inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold"
            >
              {scraping ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scraping…
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  Scrape
                </>
              )}
            </button>
          </form>

          {scraping && (
            <p className="mt-3 flex items-center gap-2 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
              Scraping Google Maps — this may take a minute…
            </p>
          )}

          {scrapeResult && (
            <div className="mt-3 flex flex-col gap-2">
              <div
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-emerald-300"
                style={{
                  background: "rgba(16, 185, 129, 0.08)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                }}
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Done! Saved <strong>{scrapeResult.saved}</strong>&nbsp;·&nbsp;
                Duplicates <strong>{scrapeResult.duplicates}</strong>&nbsp;·&nbsp;
                Failed <strong>{scrapeResult.failed}</strong>&nbsp;·&nbsp;Total{" "}
                <strong>{scrapeResult.total}</strong>
              </div>
              {scrapeResult.exhausted && (
                <div
                  className="flex items-start gap-2 rounded-xl px-4 py-3 text-sm text-amber-300"
                  style={{
                    background: "rgba(245, 158, 11, 0.08)",
                    border: "1px solid rgba(245, 158, 11, 0.25)",
                  }}
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  <span>
                    <strong>Koi aur results nahi mile</strong> —{" "}
                    Google Maps ne sirf{" "}
                    <strong>{scrapeResult.foundCount}</strong> businesses show ki{" "}
                    <strong>&quot;{query}&quot;</strong> ke liye.
                    Is city ya location mein is category ke sab businesses scrape ho chuke hain.
                  </span>
                </div>
              )}
            </div>
          )}

          {scrapeError && (
            <div
              className="mt-3 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-red-300"
              style={{
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
              }}
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {scrapeError}
            </div>
          )}
        </section>

        {/* ── Scrape History ── */}
        <section className="neu-card p-5 sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-white">
            <History className="h-4 w-4 text-cyan-400" />
            Scrape History
            {historyMeta.totalCount > 0 && (
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({historyMeta.totalCount} total)
              </span>
            )}
          </h2>
          <div
            className="overflow-x-auto rounded-xl"
            style={{
              background: "#12192e",
              border: "1px solid rgba(255,255,255,0.04)",
              boxShadow: "inset -3px -3px 7px rgba(16,24,60,0.45), inset 3px 3px 8px rgba(0,0,0,0.45)",
            }}
          >
            <table className="w-full min-w-150 text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#0f1528" }}>
                  {["Query", "Requested", "Saved", "Duplicates", "Failed", "Total", "Duration", "Status", "When"].map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historyLoading && (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      {[40, 10, 10, 10, 10, 10, 12, 14, 24].map((w, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-3.5 animate-pulse rounded-md" style={{ width: `${w * 4}px`, background: "#1e2845" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                )}
                {!historyLoading && historyData.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-600">
                      No scrape runs yet. Start a scrape above.
                    </td>
                  </tr>
                )}
                {!historyLoading && historyData.map((h) => (
                  <tr
                    key={h.id}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                    className="transition hover:bg-white/2"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-white">{h.query}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{h.maxResults}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-emerald-400">{h.saved}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={h.duplicates > 0 ? "font-semibold text-amber-400" : "text-slate-600"}>
                        {h.duplicates}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={h.failed > 0 ? "font-semibold text-red-400" : "text-slate-600"}>
                        {h.failed}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{h.total}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {h.durationSec != null ? `${h.durationSec}s` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          h.status === "completed" ? "text-emerald-400" : "text-red-400"
                        }`}
                        style={{
                          background: h.status === "completed" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                        }}
                      >
                        {h.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                      {new Date(h.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* History Pagination */}
          {historyMeta.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <p className="text-slate-600">
                Page {historyMeta.page} of {historyMeta.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                  disabled={historyPage <= 1}
                  className="neu-btn p-2 disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryPage((p) => Math.min(historyMeta.totalPages, p + 1))}
                  disabled={historyPage >= historyMeta.totalPages}
                  className="neu-btn p-2 disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ── Filters + Table ── */}
        <section className="neu-card overflow-hidden">
          {/* Sticky toolbar */}
          <div
            className="sticky top-0 z-20 flex flex-wrap items-center gap-3 px-5 py-4 sm:px-6"
            style={{
              background: "#171e35",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <h2 className="text-base font-semibold text-white">
              Scraped Companies
              {companyMeta.totalCount > 0 && (
                <span className="ml-2 text-sm font-normal text-slate-500">
                  ({companyMeta.totalCount.toLocaleString()} total)
                </span>
              )}
            </h2>
            {/* Search bar */}
            <div className="relative flex-1 min-w-48 max-w-xs">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search companies..."
                className="neu-input w-full py-2 pl-9 pr-3 text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 && (
                <span className="text-xs text-cyan-400 font-medium">
                  {selectedIds.size} selected
                </span>
              )}
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                className="neu-btn inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters
                {activeFilterCount > 0 && (
                  <span
                    className="ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6)" }}
                  >
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={handleExportCSV}
                disabled={exporting}
                className="neu-btn inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-40"
              >
                {exporting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                {selectedIds.size > 0 ? `Export ${selectedIds.size} Selected` : "Export All"}
              </button>
            </div>
          </div>

          <div className="px-5 py-4 sm:px-6">
          {/* Filters panel */}
          {showFilters && (
            <div className="neu-inner-panel mb-4 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Filters
                </p>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="neu-btn rounded-lg p-1.5 text-slate-500 hover:text-white"
                  aria-label="Close filters"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Name</label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                    placeholder="Search name…"
                    className="neu-input w-full px-3 py-2 text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Category</label>
                  <SearchableSelect
                    value={filters.category}
                    onChange={(v) => setFilters((f) => ({ ...f, category: v }))}
                    options={CATEGORY_OPTIONS}
                    placeholder="All categories"
                    size="sm"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Country</label>
                  <SearchableSelect
                    value={filters.country}
                    onChange={(v) => setFilters((f) => ({ ...f, country: v }))}
                    options={COUNTRY_OPTIONS}
                    placeholder="All countries"
                    size="sm"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">State</label>
                  <SearchableSelect
                    value={filters.state}
                    onChange={(v) => setFilters((f) => ({ ...f, state: v }))}
                    options={INDIA_STATES}
                    placeholder="All states"
                    size="sm"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">City</label>
                  <SearchableSelect
                    value={filters.city}
                    onChange={(v) => setFilters((f) => ({ ...f, city: v }))}
                    options={CITY_OPTIONS}
                    placeholder="All cities"
                    size="sm"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Min Rating</label>
                  <SearchableSelect
                    value={filters.minRating}
                    onChange={(v) => setFilters((f) => ({ ...f, minRating: v }))}
                    options={RATING_OPTIONS}
                    placeholder="Any rating"
                    size="sm"
                  />
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={handleApplyFilters}
                  className="neu-btn-primary px-4 py-1.5 text-xs font-semibold"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="neu-btn inline-flex items-center gap-1 px-4 py-1.5 text-xs"
                >
                  <X className="h-3 w-3" />
                  Reset
                </button>
              </div>
            </div>
          )}

          {deleteError && (
            <div
              className="mb-3 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-red-300"
              style={{
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
              }}
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {deleteError}
            </div>
          )}

          {/* Table */}
          <div
            className="overflow-x-auto rounded-xl"
            style={{
              background: "#12192e",
              border: "1px solid rgba(255,255,255,0.04)",
              boxShadow: "inset -3px -3px 7px rgba(16,24,60,0.45), inset 3px 3px 8px rgba(0,0,0,0.45)",
            }}
          >
            <table className="w-full min-w-225 text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#0f1528" }}>
                  <th className="w-10 px-3 py-3 text-center">
                    {selectingAll ? (
                      <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin text-cyan-400" />
                    ) : (
                      <input
                        type="checkbox"
                        checked={allSelected || pageAllSelected}
                        onChange={toggleSelectAll}
                        className="h-3.5 w-3.5 cursor-pointer rounded accent-cyan-500"
                      />
                    )}
                  </th>
                  {["Name", "Category", "Location", "Phone", "Email", "Website", "Rating", "Status", "Action"].map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {companyLoading &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      {[4, 36, 24, 32, 24, 28, 28, 14, 20, 6].map((w, j) => (
                        <td key={j} className="px-4 py-3">
                          <div
                            className="h-3.5 animate-pulse rounded-md"
                            style={{ width: `${w * 4}px`, background: "#1e2845" }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                {companyError && !companyLoading && (
                  <tr>
                    <td colSpan={10} className="px-4 py-10 text-center text-red-400">
                      Failed to load data. Please try again.
                    </td>
                  </tr>
                )}
                {!companyLoading && !companyError && companies.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-10 text-center text-slate-600">
                      No companies found. Start a scrape above or adjust your filters.
                    </td>
                  </tr>
                )}
                {!companyLoading && !companyError &&
                  companies.map((c) => (
                    <tr
                      key={c.id}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.03)",
                        background: selectedIds.has(c.id) ? "rgba(6,182,212,0.04)" : undefined,
                      }}
                      className="transition hover:bg-white/2"
                    >
                      <td className="w-10 px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(c.id)}
                          onChange={() => toggleSelect(c.id)}
                          className="h-3.5 w-3.5 cursor-pointer rounded accent-cyan-500"
                        />
                      </td>
                      <td className="max-w-70 px-4 py-3">
                        <p className="truncate font-medium text-white max-w-36">{c.name}</p>
                      </td>
                      <td className="px-4 py-3 w-40">
                        {c.category ? (
                          <span
                            className="w-full truncate rounded-full px-2 py-0.5 text-xs text-slate-300"
                            style={{ background: "rgba(255,255,255,0.06)" }}
                            title={c.category}
                          >
                            {c.category}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-700">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="flex items-center gap-1 text-xs text-slate-400">
                          <MapPin className="h-3 w-3 shrink-0 text-slate-600" />
                          <span className="truncate max-w-40">
                            {[c.city, c.state, c.country].filter(Boolean).join(", ") || c.address || "—"}
                          </span>
                        </p>
                      </td>
                      <td className="px-4 py-3 w-20">
                        {c.phone ? (
                          <a href={`tel:${c.phone}`} className="flex items-center gap-1 text-xs text-cyan-400 hover:underline">
                            <span className="truncate max-w-36">{c.phone}</span>
                          </a>
                        ) : (
                          <span className="text-xs text-slate-700">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {c.email ? (
                          <a href={`mailto:${c.email}`} className="flex items-center gap-1 text-xs text-cyan-400 hover:underline">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="max-w-36 truncate">{c.email}</span>
                          </a>
                        ) : (
                          <span className="text-xs text-slate-700">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {c.website ? (
                          <a
                            href={c.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-cyan-400 hover:underline"
                          >
                            <Globe className="h-3 w-3 shrink-0" />
                            <span className="max-w-30 truncate">
                              {c.website.replace(/^https?:\/\/(www\.)?/, "")}
                            </span>
                          </a>
                        ) : (
                          <span className="text-xs text-slate-700">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {c.rating != null ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-amber-400">
                            <Star className="h-3 w-3 fill-amber-400" />
                            {c.rating}
                            {c.totalReviews != null && (
                              <span className="font-normal text-slate-600">
                                ({c.totalReviews.toLocaleString()})
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-700">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {c.status ? (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                              c.status === "OPERATIONAL"
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                            style={{
                              background:
                                c.status === "OPERATIONAL"
                                  ? "rgba(16,185,129,0.1)"
                                  : "rgba(239,68,68,0.1)",
                            }}
                          >
                            {c.status}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-700">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id, c.name)}
                          disabled={deletingId === c.id}
                          className="rounded-lg p-1.5 text-slate-600 transition hover:text-red-400 disabled:opacity-50"
                          style={{ background: "transparent" }}
                          aria-label="Delete"
                        >
                          {deletingId === c.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Company Pagination */}
          {companyMeta.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <p className="text-slate-600">
                Page {companyMeta.page} of {companyMeta.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCompanyPage((p) => Math.max(1, p - 1))}
                  disabled={companyPage <= 1}
                  className="neu-btn p-2 disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCompanyPage((p) => Math.min(companyMeta.totalPages, p + 1))}
                  disabled={companyPage >= companyMeta.totalPages}
                  className="neu-btn p-2 disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          </div>
        </section>
      </div>
    </div>
  );
}
