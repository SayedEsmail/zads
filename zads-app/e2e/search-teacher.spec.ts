import { createParent, demoTeachers, expect, signIn, test } from "./support/test";

test("a signed-in parent finds a teacher by area and subject", async ({ page, request, appLocale }) => {
  const { math, english } = demoTeachers();
  const parent = await createParent(request, appLocale === "ar" ? "ولي أمر بحث" : "Search Parent");
  await signIn(page, appLocale, parent, `/${appLocale}/client/teacher`);

  // Both demo teachers are listed before filtering.
  await expect(page.getByText(math.name).first()).toBeVisible();
  await expect(page.getByText(english.name).first()).toBeVisible();

  await page.getByRole("button", { name: appLocale === "ar" ? "فلتر" : "Filter" }).click();
  await page.locator(`select:has(option[value="${math.subject.subjectId}"])`).selectOption(math.subject.subjectId);
  await page.locator(`select:has(option[value="${math.governorateId}"])`).selectOption(math.governorateId);
  // City and area options load from the API after each parent choice.
  await page.locator(`select:has(option[value="${math.cityId}"])`).selectOption(math.cityId);
  await page.locator(`select:has(option[value="${math.areaId}"])`).selectOption(math.areaId);
  await page.getByRole("button", { name: appLocale === "ar" ? "بحث" : "Search", exact: true }).click();

  await expect(page.getByText(math.name).first()).toBeVisible();
  await expect(page.getByText(english.name)).toHaveCount(0);
});
