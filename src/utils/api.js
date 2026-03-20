const BASE = "/api/googlemapScraper";
const AUTH = "/api/auth";

// ── Auth ──
export const SIGNIN = `${AUTH}/signin`;
export const SIGNUP = `${AUTH}/signup`;
export const LOGOUT = `${AUTH}/logout`;
export const FORGOT_PASSWORD = `${AUTH}/forgotPassword`;
export const RESET_PASSWORD = `${AUTH}/resetPassword`;

// ── Scraper ──
export const GET_COMPANIES = `${BASE}/getScrapedData`;
export const GET_HISTORY = `${BASE}/getHistory`;
export const CREATE_SCRAPER = `${BASE}/createScraper`;
export const DELETE_COMPANY = `${BASE}/deleteCompany`;
export const EXPORT_COMPANIES = `${BASE}/exportCompanies`;
