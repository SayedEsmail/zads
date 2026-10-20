import { expect, randomPassword, test, uniquePhone } from "./support/test";

test("a parent registers and lands signed in on the client dashboard", async ({ page, appLocale }) => {
  const name = appLocale === "ar" ? "منى عبد الله" : "Mona Abdallah";

  await page.goto(`/${appLocale}/auth/register/client`);
  await expect(page.locator("html")).toHaveAttribute("dir", appLocale === "ar" ? "rtl" : "ltr");

  await page.locator('input[name="name"]').fill(name);
  await page.locator('input[name="phone"]').fill(uniquePhone());
  await page.locator('input[name="password"]').fill(randomPassword());
  await page.locator('button[type="submit"]').click();

  // Registration signs the user in and routes to the role home.
  await page.waitForURL(`**/${appLocale}/client`);
  await expect(page.getByRole("main").getByText(name)).toBeVisible();
});
