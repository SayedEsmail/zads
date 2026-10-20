import path from "node:path";

export const API_PORT = 3100;
export const APP_PORT = 3101;
export const API_URL = `http://127.0.0.1:${API_PORT}`;
export const APP_URL = `http://127.0.0.1:${APP_PORT}`;
/** Written by ../zads-api/scripts/e2e-server.js once the demo teachers exist. */
export const FIXTURES_FILE = path.join(__dirname, "..", "..", "test-results", "e2e-fixtures.json");

export type AppLocale = "ar" | "en";
