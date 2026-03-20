import {
  GET_COMPANIES,
  GET_HISTORY,
  CREATE_SCRAPER,
  DELETE_COMPANY,
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
