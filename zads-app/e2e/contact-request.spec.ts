import { API_URL } from "./support/env";
import { createParent, demoTeachers, expect, signIn, test } from "./support/test";

test("a parent sends a contact request and it is recorded as pending", async ({ page, request, appLocale }) => {
  const { math } = demoTeachers();
  const parent = await createParent(request, appLocale === "ar" ? "ولي أمر تواصل" : "Contact Parent");
  const teacherPath = `/${appLocale}/client/teacher/${math.id}`;
  await signIn(page, appLocale, parent, teacherPath);

  // The contact dialog copy is Arabic in both locales (current product behaviour).
  await page.getByRole("button", { name: "طلب تواصل مباشر" }).click();
  await page.locator("textarea").fill(appLocale === "ar" ? "أرغب في حصص رياضيات للثانوية." : "Looking for secondary math lessons.");
  await page.getByRole("button", { name: "إرسال الطلب" }).click();

  await expect(page.getByText("تم إرسال طلب التواصل المباشر بنجاح!")).toBeVisible();
  await expect(page.getByText("طلب تواصل معلق")).toBeVisible();

  // Recorded server-side and listed for the parent who sent it.
  const res = await request.get(`${API_URL}/api/contact-requests/my`, {
    headers: { Authorization: `Bearer ${parent.token}` },
  });
  expect(res.ok()).toBeTruthy();
  const { data } = await res.json();
  expect(data).toHaveLength(1);
  expect(data[0]).toMatchObject({ teacherId: math.id, status: "pending" });
});
