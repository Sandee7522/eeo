import {
  GET_COMPANIES,
  GET_HISTORY,
  CREATE_SCRAPER,
  DELETE_COMPANY,
  EXPORT_COMPANIES,
} from "@/utils/api";

// ─── helpers ────────────────────────────────────────────────────────────────

function getToken() {
  return sessionStorage.getItem("token");
}

function buildOptions(data) {
  return {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
}

// ─── API functions ───────────────────────────────────────────────────────────

/**
 * Fetch companies with pagination, search, and filters.
 */
export async function fetchCompanies({ page = 1, pageSize = 5, search, ...filters } = {}) {
  const data = { page, pageSize, search, ...filters };
  const res = await fetch(GET_COMPANIES, buildOptions(data));
  const result = await res.json();

  if (result?.status === 200) {
    return {
      data: result.data || [],
      meta: result.meta,
    };
  }

  if (result?.status === 404) {
    return { data: [], meta: result.meta };
  }

  throw new Error(result?.message || "Failed to fetch companies");
}

/**
 * Fetch scrape history with pagination, search, and filters.
 */
export async function fetchHistory({ page = 1, pageSize = 5, search, ...filters } = {}) {
  const data = { page, pageSize, search, ...filters };
  const res = await fetch(GET_HISTORY, buildOptions(data));
  const result = await res.json();

  if (result?.status === 200) {
    return {
      data: result.data || [],
      meta: result.meta,
    };
  }

  if (result?.status === 404) {
    return { data: [], meta: result.meta };
  }

  throw new Error(result?.message || "Failed to fetch history");
}

/**
 * Start a new Google Maps scrape.
 */
export async function startScrape({ query, maxResults }) {
  const res = await fetch(CREATE_SCRAPER, buildOptions({ query, maxResults }));
  const result = await res.json();

  if (result?.status === 200) {
    return result.data;
  }

  throw new Error(result?.message || "Scraping failed");
}

/**
 * Delete a company by ID.
 */
export async function deleteCompany(id) {
  const res = await fetch(DELETE_COMPANY, buildOptions({ id }));
  const result = await res.json();

  if (result?.status === 200) {
    return result;
  }

  throw new Error(result?.message || "Delete failed");
}

/**
 * Export companies — selected IDs or all (with current filters).
 */
export async function exportCompanies({ ids, filters } = {}) {
  const data = {};
  if (ids && ids.length > 0) data.ids = ids;
  if (filters) {
    if (filters.search) data.search = filters.search;
    if (filters.city) data.city = filters.city;
    if (filters.state) data.state = filters.state;
    if (filters.country) data.country = filters.country;
    if (filters.category) data.category = filters.category;
    if (filters.minRating) data.minRating = Number(filters.minRating);
  }
  const res = await fetch(EXPORT_COMPANIES, buildOptions(data));
  const result = await res.json();

  if (result?.status === 200) {
    return result.data || [];
  }

  throw new Error(result?.message || "Export failed");
}

/**
 * Get all company IDs (for select all across pages).
 * Uses exportCompanies API with onlyIds flag.
 */
export async function getAllCompanyIds(filters = {}) {
  const data = { onlyIds: true };
  if (filters.search) data.search = filters.search;
  if (filters.city) data.city = filters.city;
  if (filters.state) data.state = filters.state;
  if (filters.country) data.country = filters.country;
  if (filters.category) data.category = filters.category;
  if (filters.minRating) data.minRating = Number(filters.minRating);
  const res = await fetch(EXPORT_COMPANIES, buildOptions(data));
  const result = await res.json();

  if (result?.status === 200) {
    return result.data || [];
  }

  throw new Error(result?.message || "Failed to fetch IDs");
}
