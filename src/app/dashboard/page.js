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
  Send,
  Target,
  Clock,
  XCircle,
  MailCheck,
} from "lucide-react";
import {
  fetchCompanies,
  startScrape,
  deleteCompany,
  fetchHistory,
  exportCompanies,
  getAllCompanyIds,
  runOutreach,
  fetchOutreachStats,
  fetchOutreachHistory,
  deleteHistory,
  deleteOutreach,
} from "@/app/lib/dashboardApi";
import { logoutApi, isAuthenticated, getCurrentUser } from "@/app/lib/authApi";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { Country, State, City } from "country-state-city";

const COMPANY_LIMIT = 10;
const HISTORY_LIMIT = 5;

const MAX_RESULTS_OPTIONS = [5, 10, 20, 50, 100];

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

const ALL_COUNTRIES = Country.getAllCountries().map((c) => ({
  label: c.name,
  value: c.isoCode,
}));

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
  const [queryCountry, setQueryCountry] = useState("");
  const [queryState, setQueryState] = useState("");
  const [queryCity, setQueryCity] = useState("");
  const [scrapeOnlyNoWebsite, setScrapeOnlyNoWebsite] = useState(false);
  const [onlyWithoutWebsite, setOnlyWithoutWebsite] = useState(false);
  const [enableOutreach, setEnableOutreach] = useState(false);
  const [maxResults, setMaxResults] = useState(20);

  // Dynamic state/city lists based on selected country/state
  const stateOptions = queryCountry
    ? State.getStatesOfCountry(queryCountry).map((s) => ({ label: s.name, value: s.isoCode }))
    : [];
  const cityOptions = queryCountry && queryState
    ? City.getCitiesOfState(queryCountry, queryState).map((c) => ({ label: c.name, value: c.name }))
    : queryCountry
      ? City.getCitiesOfCountry(queryCountry).map((c) => ({ label: c.name, value: c.name }))
      : [];

  const countryName = queryCountry ? Country.getCountryByCode(queryCountry)?.name : "";
  const stateName = queryState && queryCountry
    ? State.getStateByCodeAndCountry(queryState, queryCountry)?.name
    : "";

  const query = queryType && queryCity
    ? `${queryType} in ${queryCity}${stateName ? `, ${stateName}` : ""}${countryName ? `, ${countryName}` : ""}`
    : "";
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
    search: "", city: "", state: "", country: "", category: "", minRating: "", hasWebsite: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    search: "", city: "", state: "", country: "", category: "", minRating: "", hasWebsite: "",
  });

  // Dynamic filter options based on selected filter country
  const filterCountryCode = filters.country
    ? Country.getAllCountries().find((c) => c.name === filters.country)?.isoCode
    : "";
  const filterStateOptions = filterCountryCode
    ? State.getStatesOfCountry(filterCountryCode).map((s) => s.name)
    : [];
  const filterCityOptions = filterCountryCode
    ? (() => {
        if (filters.state) {
          const stCode = State.getStatesOfCountry(filterCountryCode)
            .find((s) => s.name === filters.state)?.isoCode;
          return stCode
            ? City.getCitiesOfState(filterCountryCode, stCode).map((c) => c.name)
            : [];
        }
        return City.getCitiesOfCountry(filterCountryCode).map((c) => c.name);
      })()
    : [];

  // ── History table ──
  const [historyData, setHistoryData] = useState([]);
  const [historyMeta, setHistoryMeta] = useState({ page: 1, pageSize: HISTORY_LIMIT, totalCount: 0, totalPages: 1 });
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);

  // ── Outreach ──
  const [outreachStats, setOutreachStats] = useState(null);
  const [outreachData, setOutreachData] = useState([]);
  const [outreachMeta, setOutreachMeta] = useState({ page: 1, pageSize: 5, totalCount: 0, totalPages: 1 });
  const [outreachPage, setOutreachPage] = useState(1);
  const [outreachFilter, setOutreachFilter] = useState("");
  const [outreachLoading, setOutreachLoading] = useState(false);
  const [outreachRunning, setOutreachRunning] = useState(false);
  const [outreachResult, setOutreachResult] = useState(null);
  const [outreachLimit, setOutreachLimit] = useState(10);
  const [emailType, setEmailType] = useState("job_application");

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
  const [exportDropdown, setExportDropdown] = useState(false);

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
        if (appliedFilters.hasWebsite) filters.hasWebsite = appliedFilters.hasWebsite;

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

  // ── Expand rows (see more/less) ──
  const [expandedRows, setExpandedRows] = useState(new Set());
  const toggleExpand = (id) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ── Delete ──
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deletingHistoryId, setDeletingHistoryId] = useState(null);
  const [deletingOutreachId, setDeletingOutreachId] = useState(null);

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
      if (appliedFilters.hasWebsite) payload.hasWebsite = appliedFilters.hasWebsite;

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

  // ── Fetch outreach ──
  const loadOutreachStats = useCallback(async () => {
    try {
      const stats = await fetchOutreachStats();
      setOutreachStats(stats);
    } catch {
      // silent
    }
  }, []);

  const loadOutreachHistory = useCallback(async () => {
    try {
      setOutreachLoading(true);
      const result = await fetchOutreachHistory({ page: outreachPage, pageSize: 5, status: outreachFilter || undefined });
      setOutreachData(result.data || []);
      setOutreachMeta(result.meta || { page: 1, pageSize: 5, totalCount: 0, totalPages: 1 });
    } catch {
      // silent
    } finally {
      setOutreachLoading(false);
    }
  }, [outreachPage, outreachFilter]);

  // Close export dropdown on outside click
  useEffect(() => {
    if (!exportDropdown) return;
    const close = () => setExportDropdown(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [exportDropdown]);

  useEffect(() => { loadCompanies(); }, [loadCompanies]);
  useEffect(() => { loadHistory(); }, [loadHistory]);
  useEffect(() => { loadOutreachStats(); }, [loadOutreachStats]);
  useEffect(() => { loadOutreachHistory(); }, [loadOutreachHistory]);

  // ── Handlers ──
  const handleScrape = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setScraping(true);
    setScrapeResult(null);
    setScrapeError(null);
    try {
      const result = await startScrape({
        query: query.trim(),
        maxResults: Number(maxResults),
        ...(scrapeOnlyNoWebsite && { scrapeWebsites: true }),
        ...(onlyWithoutWebsite && { onlyWithoutWebsite: true }),
        ...(enableOutreach && { onlyWithEmail: true }),
      });
      setScrapeResult(result);
      loadCompanies();
      loadHistory();

      // Auto-run outreach only if user enabled it
      if (enableOutreach) {
        try {
          setOutreachRunning(true);
          const outreach = await runOutreach({ limit: 20 });
          setOutreachResult(outreach);
        } catch {
          // outreach failed silently
        } finally {
          setOutreachRunning(false);
        }
        loadOutreachStats();
        loadOutreachHistory();
      }
    } catch (err) {
      setScrapeError(err.message || "Scraping failed");
    } finally {
      setScraping(false);
    }
  };

  const handleDeleteHistory = async (id, query) => {
    if (!confirm(`Delete history "${query}"?`)) return;
    setDeletingHistoryId(id);
    try {
      await deleteHistory(id);
      loadHistory();
    } catch {
      // silent
    } finally {
      setDeletingHistoryId(null);
    }
  };

  const handleDeleteOutreach = async (id, name) => {
    if (!confirm(`Remove outreach for "${name}"? This will reset its lead status.`)) return;
    setDeletingOutreachId(id);
    try {
      await deleteOutreach(id);
      loadOutreachHistory();
      loadOutreachStats();
    } catch {
      // silent
    } finally {
      setDeletingOutreachId(null);
    }
  };

  const handleRunOutreach = async () => {
    setOutreachRunning(true);
    setOutreachResult(null);
    try {
      const result = await runOutreach({ limit: outreachLimit, emailType });
      setOutreachResult(result);
      loadOutreachStats();
      loadOutreachHistory();
      loadCompanies();
    } catch (err) {
      setOutreachResult({ error: err.message || "Outreach failed" });
    } finally {
      setOutreachRunning(false);
    }
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    setCompanyPage(1);
  };

  const handleResetFilters = () => {
    const empty = { search: "", city: "", state: "", country: "", category: "", minRating: "", hasWebsite: "" };
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
    const headers = ["Name","Category","Address","City","State","Country","Phone","Phone Numbers","Website","Email","Emails","Rating","Total Reviews","Status","Created At"];
    const rows = data.map((c) =>
      [c.name,c.category,c.address,c.city,c.state,c.country,c.phone,
        Array.isArray(c.phoneNumbers) ? c.phoneNumbers.join("; ") : "",
        c.website,c.email,
        Array.isArray(c.emails) ? c.emails.join("; ") : "",
        c.rating,c.totalReviews,c.status,
        c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN") : ""]
        .map((v) => (v == null ? "" : `"${String(v).replace(/"/g, '""')}"`)),
    );
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mapscrape-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = (data) => {
    const headers = ["Name","Category","City","Phone","Email","Website","Rating"];
    const colWidths = [180, 80, 80, 90, 120, 100, 40];
    const pageW = colWidths.reduce((a, b) => a + b, 0) + 40;
    const rowH = 18;
    const headerH = 22;
    const margin = 20;
    const pageH = 842;
    const maxRowsPerPage = Math.floor((pageH - margin * 2 - headerH - 40) / rowH);

    const truncate = (str, max) => {
      if (!str) return "";
      return str.length > max ? str.slice(0, max - 2) + ".." : str;
    };

    const pages = [];
    for (let i = 0; i < data.length; i += maxRowsPerPage) {
      pages.push(data.slice(i, i + maxRowsPerPage));
    }

    let pdf = `%PDF-1.4\n`;
    const objects = [];
    const addObj = (content) => { objects.push(content); return objects.length; };

    // Catalog
    addObj("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj");
    // Pages placeholder (update later)
    addObj(""); // placeholder for pages obj

    const pageObjIds = [];
    const streamObjIds = [];

    for (let p = 0; p < pages.length; p++) {
      const rows = pages[p];
      const contentH = margin + 30 + headerH + rows.length * rowH + 20;
      const actualH = Math.max(pageH, contentH);

      let stream = "";
      // Title
      stream += `BT /F1 14 Tf ${margin} ${actualH - margin - 14} Td (MapScrape - Companies Export) Tj ET\n`;
      stream += `BT /F1 8 Tf ${margin} ${actualH - margin - 26} Td (Page ${p + 1} of ${pages.length} | Total: ${data.length} | Generated: ${new Date().toLocaleDateString("en-IN")}) Tj ET\n`;

      const tableTop = actualH - margin - 40;

      // Header bg
      stream += `0.1 0.15 0.25 rg\n`;
      stream += `${margin} ${tableTop - headerH} ${pageW - margin * 2} ${headerH} re f\n`;

      // Header text
      stream += `1 1 1 rg\n`;
      let hx = margin + 4;
      for (let i = 0; i < headers.length; i++) {
        stream += `BT /F1 7 Tf ${hx} ${tableTop - headerH + 7} Td (${headers[i]}) Tj ET\n`;
        hx += colWidths[i];
      }

      // Rows
      for (let r = 0; r < rows.length; r++) {
        const c = rows[r];
        const y = tableTop - headerH - (r + 1) * rowH;
        const vals = [
          truncate(c.name, 40), truncate(c.category, 18), truncate(c.city, 16),
          truncate(c.phone, 18), truncate(c.email, 26), truncate(c.website?.replace(/^https?:\/\/(www\.)?/, ""), 22),
          c.rating != null ? String(c.rating) : "",
        ];

        // Alternate row bg
        if (r % 2 === 0) {
          stream += `0.93 0.95 0.97 rg\n`;
          stream += `${margin} ${y} ${pageW - margin * 2} ${rowH} re f\n`;
        }

        // Row text
        stream += `0.15 0.15 0.15 rg\n`;
        let rx = margin + 4;
        for (let i = 0; i < vals.length; i++) {
          const safe = vals[i].replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
          stream += `BT /F1 6.5 Tf ${rx} ${y + 5} Td (${safe}) Tj ET\n`;
          rx += colWidths[i];
        }
      }

      const streamId = addObj("");
      streamObjIds.push(streamId);
      objects[streamId - 1] = `${streamId} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}endstream\nendobj`;

      const pageId = addObj(`X 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${actualH}] /Contents ${streamId} 0 R /Resources << /Font << /F1 ${pages.length * 2 + 3} 0 R >> >> >>\nendobj`);
      objects[pageId - 1] = objects[pageId - 1].replace("X", String(pageId));
      pageObjIds.push(pageId);
    }

    // Font
    const fontId = addObj(`${objects.length + 1} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`);
    objects[fontId - 1] = `${fontId} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`;

    // Pages object
    objects[1] = `2 0 obj\n<< /Type /Pages /Kids [${pageObjIds.map(id => `${id} 0 R`).join(" ")}] /Count ${pageObjIds.length} >>\nendobj`;

    // Build PDF
    const offsets = [];
    let body = "";
    for (let i = 0; i < objects.length; i++) {
      offsets.push(pdf.length + body.length);
      body += objects[i] + "\n";
    }
    pdf += body;

    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (const off of offsets) {
      pdf += `${String(off).padStart(10, "0")} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    const blob = new Blob([pdf], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mapscrape-${Date.now()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async (format) => {
    setExporting(true);
    setExportDropdown(false);
    try {
      let data;
      if (selectedIds.size > 0) {
        data = await exportCompanies({ ids: [...selectedIds] });
      } else {
        data = await exportCompanies({ filters: appliedFilters });
      }
      if (format === "pdf") {
        downloadPDF(data);
      } else {
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
      <div className="mx-auto max-w-1xl space-y-5 p-3 mr-7 ml-7 sm:p-4 md:p-5">

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

          <form onSubmit={handleScrape} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">Business type</label>
                <SearchableSelect
                  value={queryType}
                  onChange={setQueryType}
                  options={CATEGORY_OPTIONS}
                  placeholder="Select business type…"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">Country</label>
                <SearchableSelect
                  value={queryCountry}
                  onChange={(v) => {
                    setQueryCountry(v);
                    setQueryState("");
                    setQueryCity("");
                  }}
                  options={ALL_COUNTRIES}
                  placeholder="Select country…"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">State</label>
                <SearchableSelect
                  value={queryState}
                  onChange={(v) => {
                    setQueryState(v);
                    setQueryCity("");
                  }}
                  options={stateOptions}
                  placeholder={queryCountry ? "Select state…" : "Select country first"}
                  disabled={!queryCountry}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">City</label>
                <SearchableSelect
                  value={queryCity}
                  onChange={setQueryCity}
                  options={cityOptions}
                  placeholder={queryCountry ? "Select city…" : "Select country first"}
                  disabled={!queryCountry}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">Max results</label>
                <SearchableSelect
                  value={maxResults}
                  onChange={(v) => setMaxResults(Number(v))}
                  options={MAX_RESULTS_OPTIONS.map((n) => ({ label: `${n} results`, value: n }))}
                  placeholder="Select…"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyWithoutWebsite}
                    onChange={(e) => setOnlyWithoutWebsite(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500 focus:ring-offset-0"
                  />
                  <span className="text-xs font-medium text-slate-400">
                    Only save businesses without website
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={scrapeOnlyNoWebsite}
                    onChange={(e) => setScrapeOnlyNoWebsite(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                  />
                  <span className="text-xs font-medium text-slate-400">
                    Also scrape company websites for contact info
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={enableOutreach}
                    onChange={(e) => setEnableOutreach(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                  />
                  <span className="text-xs font-medium text-slate-400">
                    Auto-send outreach emails after scrape
                  </span>
                </label>
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
            </div>
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
              {scrapeResult.outreach && scrapeResult.outreach.sent > 0 && (
                <div
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-cyan-300"
                  style={{
                    background: "rgba(6,182,212,0.08)",
                    border: "1px solid rgba(6,182,212,0.2)",
                  }}
                >
                  <Send className="h-4 w-4 shrink-0" />
                  Outreach: Sent <strong>{scrapeResult.outreach.sent}</strong> emails to businesses without websites
                  {scrapeResult.outreach.failed > 0 && (
                    <>&nbsp;·&nbsp;Failed <strong>{scrapeResult.outreach.failed}</strong></>
                  )}
                </div>
              )}
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
                  {["Query", "Requested", "Saved", "Dup.", "Failed", "Total", "Duration", "Source", "Status", "When", ""].map((h) => (
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
                      {[40, 10, 10, 10, 10, 10, 12, 16, 14, 24].map((w, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-3.5 animate-pulse rounded-md" style={{ width: `${w * 4}px`, background: "#1e2845" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                )}
                {!historyLoading && historyData.length === 0 && (
                  <tr>
                    <td colSpan={12} className="px-4 py-8 text-center text-slate-600">
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
                      {h.source ? (
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-medium text-slate-300"
                          style={{ background: "rgba(255,255,255,0.06)" }}
                        >
                          {h.source}
                        </span>
                      ) : <span className="text-xs text-slate-700">—</span>}
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
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteHistory(h.id, h.query)}
                        disabled={deletingHistoryId === h.id}
                        className="rounded-lg p-1.5 text-slate-600 transition hover:text-red-400 disabled:opacity-50"
                        aria-label="Delete"
                      >
                        {deletingHistoryId === h.id ? (
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

        {/* ── Outreach Section ── */}
        <section className="neu-card p-5 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-white">
              <Send className="h-4 w-4 text-cyan-400" />
              Email Outreach
              <span className="text-sm font-normal text-slate-500">
                (Auto-email businesses without websites)
              </span>
            </h2>
          </div>

          {/* Stats Cards */}
          {outreachStats && (
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Total Leads", value: outreachStats.totalLeads, icon: Target, color: "cyan" },
                { label: "Emails Sent", value: outreachStats.emailsSent, icon: MailCheck, color: "emerald" },
                { label: "Failed", value: outreachStats.emailsFailed, icon: XCircle, color: "red" },
                { label: "Pending", value: outreachStats.pending, icon: Clock, color: "amber" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div
                  key={label}
                  className="rounded-xl p-3"
                  style={{
                    background: `rgba(${color === "cyan" ? "6,182,212" : color === "emerald" ? "16,185,129" : color === "red" ? "239,68,68" : "245,158,11"},0.08)`,
                    border: `1px solid rgba(${color === "cyan" ? "6,182,212" : color === "emerald" ? "16,185,129" : color === "red" ? "239,68,68" : "245,158,11"},0.2)`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 text-${color}-400`} />
                    <span className="text-xs font-medium text-slate-400">{label}</span>
                  </div>
                  <p className={`mt-1 text-xl font-bold text-${color}-400`}>{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Run Outreach Controls */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="w-full sm:w-48">
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Email type</label>
              <SearchableSelect
                value={emailType}
                onChange={setEmailType}
                options={[
                  { label: "Job Application (Full Stack Dev)", value: "job_application" },
                  { label: "Website Offer (No Website)", value: "website_offer" },
                ]}
                placeholder="Select type…"
              />
            </div>
            <div className="w-full sm:w-40">
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Emails to send</label>
              <SearchableSelect
                value={outreachLimit}
                onChange={(v) => setOutreachLimit(Number(v))}
                options={[5, 10, 20, 30, 50].map((n) => ({ label: `${n} emails`, value: n }))}
                placeholder="Select…"
              />
            </div>
            <button
              type="button"
              onClick={handleRunOutreach}
              disabled={outreachRunning || !outreachStats?.pending}
              className="neu-btn-primary inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold"
            >
              {outreachRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Run Outreach
                  {outreachStats?.pending > 0 && (
                    <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]">
                      {outreachStats.pending} pending
                    </span>
                  )}
                </>
              )}
            </button>
          </div>

          {/* Outreach Result */}
          {outreachResult && (
            <div className="mb-4">
              {outreachResult.error ? (
                <div
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-red-300"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {outreachResult.error}
                </div>
              ) : (
                <div
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-emerald-300"
                  style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Outreach done! Sent <strong>{outreachResult.sent}</strong>&nbsp;·&nbsp;
                  Failed <strong>{outreachResult.failed}</strong>&nbsp;·&nbsp;
                  New leads detected <strong>{outreachResult.newLeads}</strong>
                </div>
              )}
            </div>
          )}

          {/* Outreach History Table */}
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Filter:</span>
            {["", "sent", "pending", "failed"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { setOutreachFilter(s); setOutreachPage(1); }}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  outreachFilter === s
                    ? "text-cyan-300 bg-cyan-500/10 border border-cyan-500/25"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {s || "All"}
              </button>
            ))}
          </div>

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
                  {["Business", "Category", "Email", "Location", "Status", "Summary", "Sent At", ""].map((h) => (
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
                {outreachLoading && (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      {[30, 20, 28, 24, 12, 36, 20, 6].map((w, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-3.5 animate-pulse rounded-md" style={{ width: `${w * 4}px`, background: "#1e2845" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                )}
                {!outreachLoading && outreachData.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-600">
                      No outreach data yet. Scrape businesses without websites to generate leads.
                    </td>
                  </tr>
                )}
                {!outreachLoading && outreachData.map((o) => (
                  <tr
                    key={o.id}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                    className="transition hover:bg-white/2"
                  >
                    <td className="px-4 py-3 min-w-[180px] max-w-[280px]">
                      <span className="font-medium text-white break-words text-sm">{o.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      {o.category ? (
                        <span className="rounded-full px-2 py-0.5 text-xs text-slate-300" style={{ background: "rgba(255,255,255,0.06)" }}>
                          {o.category}
                        </span>
                      ) : <span className="text-xs text-slate-700">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <a href={`mailto:${o.email}`} className="text-xs text-cyan-400 hover:underline break-all">{o.email}</a>
                    </td>
                    <td className="px-4 py-3 min-w-[140px]">
                      <span className="text-xs text-slate-400 break-words">
                        {[o.city, o.state, o.country].filter(Boolean).join(", ") || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          o.mailSent
                            ? "text-emerald-400"
                            : o.mailError
                              ? "text-red-400"
                              : "text-amber-400"
                        }`}
                        style={{
                          background: o.mailSent
                            ? "rgba(16,185,129,0.1)"
                            : o.mailError
                              ? "rgba(239,68,68,0.1)"
                              : "rgba(245,158,11,0.1)",
                        }}
                      >
                        {o.mailSent ? "Sent" : o.mailError ? "Failed" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 min-w-[200px] max-w-[300px]">
                      {(() => {
                        const text = o.mailSummary || o.mailError || "";
                        if (!text) return <span className="text-xs text-slate-700">—</span>;
                        const isExpanded = expandedRows.has(`summary-${o.id}`);
                        return (
                          <div>
                            <p className={`text-xs text-slate-400 ${isExpanded ? "break-words" : "line-clamp-2"}`}>
                              {text}
                            </p>
                            {text.length > 80 && (
                              <button
                                type="button"
                                onClick={() => toggleExpand(`summary-${o.id}`)}
                                className="mt-1 text-[10px] font-medium text-cyan-500 hover:text-cyan-400 transition"
                              >
                                {isExpanded ? "show less" : "show more"}
                              </button>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                      {o.mailSentAt ? new Date(o.mailSentAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteOutreach(o.id, o.name)}
                        disabled={deletingOutreachId === o.id}
                        className="rounded-lg p-1.5 text-slate-600 transition hover:text-red-400 disabled:opacity-50"
                        aria-label="Remove outreach"
                      >
                        {deletingOutreachId === o.id ? (
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

          {/* Outreach Pagination */}
          {outreachMeta.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <p className="text-slate-600">
                Page {outreachMeta.page} of {outreachMeta.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOutreachPage((p) => Math.max(1, p - 1))}
                  disabled={outreachPage <= 1}
                  className="neu-btn p-2 disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setOutreachPage((p) => Math.min(outreachMeta.totalPages, p + 1))}
                  disabled={outreachPage >= outreachMeta.totalPages}
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
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setExportDropdown(!exportDropdown)}
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
                {exportDropdown && (
                  <div
                    className="absolute right-0 top-full z-50 mt-1 min-w-[120px] rounded-xl py-1 shadow-xl"
                    style={{ background: "#1a2340", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <button
                      type="button"
                      onClick={() => handleExport("csv")}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs text-slate-300 hover:text-white transition"
                      style={{ background: "transparent" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <Download className="h-3.5 w-3.5" />
                      Export CSV
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExport("pdf")}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs text-slate-300 hover:text-white transition"
                      style={{ background: "transparent" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <Download className="h-3.5 w-3.5" />
                      Export PDF
                    </button>
                  </div>
                )}
              </div>
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
                    onChange={(v) => setFilters((f) => ({ ...f, country: v, state: "", city: "" }))}
                    options={ALL_COUNTRIES.map((c) => c.label)}
                    placeholder="All countries"
                    size="sm"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">State</label>
                  <SearchableSelect
                    value={filters.state}
                    onChange={(v) => setFilters((f) => ({ ...f, state: v, city: "" }))}
                    options={filterStateOptions}
                    placeholder={filters.country ? "All states" : "Select country first"}
                    size="sm"
                    disabled={!filters.country}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">City</label>
                  <SearchableSelect
                    value={filters.city}
                    onChange={(v) => setFilters((f) => ({ ...f, city: v }))}
                    options={filterCityOptions}
                    placeholder={filters.country ? "All cities" : "Select country first"}
                    size="sm"
                    disabled={!filters.country}
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

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Website</label>
                  <SearchableSelect
                    value={filters.hasWebsite}
                    onChange={(v) => setFilters((f) => ({ ...f, hasWebsite: v }))}
                    options={[
                      { value: "yes", label: "Has website" },
                      { value: "no", label: "No website" },
                    ]}
                    placeholder="All"
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
                  {["Name", "Category", "Location", "Address", "Phone", "Email", "Website", "Rating", "Status", "Created At", "Action"].map((h) => (
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
                    <td colSpan={12} className="px-4 py-10 text-center text-red-400">
                      Failed to load data. Please try again.
                    </td>
                  </tr>
                )}
                {!companyLoading && !companyError && companies.length === 0 && (
                  <tr>
                    <td colSpan={12} className="px-4 py-10 text-center text-slate-600">
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
                      <td className="px-4 py-3 min-w-[180px] max-w-[250px]">
                        <p className="font-medium text-white break-words">{c.name}</p>
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
                      <td className="px-4 py-3 min-w-[180px] max-w-[280px]">
                        <p className="flex items-start gap-1 text-xs text-slate-400">
                          <MapPin className="h-3 w-3 shrink-0 text-slate-600 mt-0.5" />
                          <span className="break-words">
                            {[c.city, c.state, c.country].filter(Boolean).join(", ") || "—"}
                          </span>
                        </p>
                      </td>
                      <td className="px-4 py-3 min-w-[200px] max-w-[300px]">
                        <p className="text-xs text-slate-400 break-words">
                          {c.address || "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3 w-44">
                        {(() => {
                          const phones = c.phoneNumbers?.length > 0
                            ? c.phoneNumbers
                            : c.phone ? [c.phone] : [];
                          if (phones.length === 0) return <span className="text-xs text-slate-700">—</span>;
                          const isExpanded = expandedRows.has(`phone-${c.id}`);
                          const visible = isExpanded ? phones : phones.slice(0, 1);
                          return (
                            <div className="flex flex-col gap-0.5">
                              {visible.map((p, i) => (
                                <a key={i} href={`tel:${p}`} className="text-xs text-cyan-400 hover:underline truncate max-w-40">{p}</a>
                              ))}
                              {phones.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => toggleExpand(`phone-${c.id}`)}
                                  className="mt-0.5 text-[10px] font-medium text-slate-500 hover:text-cyan-400 transition text-left"
                                >
                                  {isExpanded ? "show less" : `+${phones.length - 1} more`}
                                </button>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3 w-48">
                        {(() => {
                          const emails = c.emails?.length > 0
                            ? c.emails
                            : c.email ? [c.email] : [];
                          if (emails.length === 0) return <span className="text-xs text-slate-700">—</span>;
                          const isExpanded = expandedRows.has(`email-${c.id}`);
                          const visible = isExpanded ? emails : emails.slice(0, 1);
                          return (
                            <div className="flex flex-col gap-0.5">
                              {visible.map((e, i) => (
                                <a key={i} href={`mailto:${e}`} className="flex items-center gap-1 text-xs text-cyan-400 hover:underline">
                                  {i === 0 && <Mail className="h-3 w-3 shrink-0" />}
                                  <span className="truncate max-w-40">{e}</span>
                                </a>
                              ))}
                              {emails.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => toggleExpand(`email-${c.id}`)}
                                  className="mt-0.5 text-[10px] font-medium text-slate-500 hover:text-cyan-400 transition text-left"
                                >
                                  {isExpanded ? "show less" : `+${emails.length - 1} more`}
                                </button>
                              )}
                            </div>
                          );
                        })()}
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
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs text-slate-500">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </span>
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
