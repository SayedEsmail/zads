import fs from "node:fs";
import { randomBytes, randomInt } from "node:crypto";
import { test as base, expect, type APIRequestContext, type Page } from "@playwright/test";
import { API_URL, FIXTURES_FILE, type AppLocale } from "./env";

export interface DemoTeacher {
  id: string;
  key: string;
  name: string;
  governorateId: string;
  cityId: string;
  areaId: string;
  subject: { subjectId: string; stageId: string };
}

export interface Parent {
  name: string;
  phone: string;
  password: string;
  token: string;
}

/** Unique Egyptian mobile in the 015 range (demo teachers and the seeded admin use 010). */
export const uniquePhone = () => `015${String(randomInt(0, 1e8)).padStart(8, "0")}`;
export const randomPassword = () => randomBytes(9).toString("base64url");

export function demoTeachers(): Record<string, DemoTeacher> {
  return JSON.parse(fs.readFileSync(FIXTURES_FILE, "utf8")).teachers;
}

/** Register a parent straight through the API (setup for flows that start signed in). */
export async function createParent(request: APIRequestContext, name: string): Promise<Parent> {
  const phone = uniquePhone();
  const password = randomPassword();
  const res = await request.post(`${API_URL}/api/auth/register/parent`, { data: { phone, password, name } });
  expect(res.status(), await res.text()).toBe(201);
  const { data } = await res.json();
  return { name, phone, password, token: data.token };
}

/**
 * Sign in through the login form, then open `target`. The login page only
 * honours callbackUrl for /client/teacher/<id>; other targets land on the role
 * home first, so wait for the redirect off the login page and navigate on.
 */
export async function signIn(page: Page, locale: AppLocale, parent: Parent, target: string) {
  await page.goto(`/${locale}/auth/login?callbackUrl=${encodeURIComponent(target)}`);
  await page.locator('input[type="tel"]').fill(parent.phone);
  await page.locator('input[type="password"]').fill(parent.password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL((url) => !url.pathname.includes("/auth/login"));
  if (new URL(page.url()).pathname !== target) await page.goto(target);
}

export const test = base.extend<{ appLocale: AppLocale }>({
  appLocale: ["ar", { option: true }],
  // The app falls back to the production GA id; keep test traffic out of analytics.
  // (Fixture callback named `provide`: eslint's React hooks rule misreads `use`.)
  context: async ({ context }, provide) => {
    await context.route(/googletagmanager\.com|google-analytics\.com/, (route) => route.abort());
    await provide(context);
  },
});

export { expect };
