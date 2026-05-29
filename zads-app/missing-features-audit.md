# Zads Application - Comprehensive Audit & Missing Features Review

This document outlines the current state of the Zads Next.js application, detailing what has been completed, what is partially implemented (mocked/stubbed), and what is entirely missing. This will serve as our roadmap for the upcoming development phases.

## 1. Authentication & Onboarding
**Status:** ✅ UI completed | 🟡 Integration partially completed | 🟡 Pending UI Adjustments
*   **Login & Register UI:** Completed and styled uniformly (Minimal/Clean design).
*   **Forgot Password:** Link exists, but the page and logic (`/auth/forgot-password`) are missing.
*   **Reset Password:** Missing UI and integration for resetting the password via email/SMS link.
*   **Verification:** Missing flow for verifying phone numbers or emails (OTP verification screen).
*   **Registration UI Adjustments (User Edits):**
    *   **Client Registration UI (`/auth/register/client`):**
        *   Move the **Account Type** (نوع الحساب) field to be the **very first field** in the form.
        *   Remove the **Confirm Password** (تأكيد كلمة المرور) field.
        *   Add a **toggle view eye icon** inside the **Password** field to show/hide the input.
    *   **Teacher Registration UI (`/auth/register/teacher`):**
        *   Remove the **Email** (البريد الإلكتروني) field.
        *   Remove the **Bio** (نبذة عني) field.
        *   Remove the **Confirm Password** (تأكيد كلمة المرور) field.
        *   Add a **toggle view eye icon** inside the **Password** field to show/hide the input.


## 2. Client Portal (Parents / Students)
**Status:** 🟡 Dashboard UI scaffolded | 🔴 Sub-pages missing
*   **Dashboard (`/client`):** Scaffolded with "Recent Requests" and "Saved Teachers" (currently using static/mock data).
*   **Teacher Search & Discovery (`/client/teacher`):** 🔴 **CRITICAL MISSING FEATURE.** The core ability to search, filter, and view teacher profiles is not built.
*   **Booking Flow:** The modal/page to send a tutoring request to a teacher is missing.
*   **Requests Management (`/client/requests`):** Needs a full table/list to view pending, accepted, and rejected requests.
*   **Dependents Management (`/client/dependents`):** If a parent, they need a UI to add/edit student profiles.
*   **Profile & Settings (`/client/profile`):** 🟡 **MERGED FLOW.** Combined into a single unified page utilizing navigation tabs (e.g., "Personal Info / Profile Edit" and "Account Security / Settings") to access all profile editing, avatar uploads, password changes, and preferences. The separate `/client/settings` route is merged into this tabbed layout.
*   **Navigation & Label Renaming (Clarification):**
    *   Rename **"طلباتي"** (My public tutoring posts) to **"طلبات التدريس العامة الخاصة بي"** (My Public Tutor Requests) to clarify they are public listings.
    *   Rename **"طلبات التواصل"** (Direct contact requests sent to tutors) to **"طلبات التواصل المباشر"** (Direct Contact Requests) to denote direct engagements.

## 3. Teacher Portal (Tutors)
**Status:** 🟡 Dashboard UI scaffolded | 🔴 Sub-pages missing
*   **Dashboard (`/teacher`):** 🟡 **UI & Layout Alignment.** Redesign and align the layout and styling to closely match the client portal's dashboard home page aesthetic. This includes matching design elements, padding, typography, card style for stats, and displaying incoming/recent contact requests in the same modern list structure used for client request feeds.
*   **Incoming Requests (`/teacher/requests`):** UI to view incoming requests from clients and Accept/Reject them.
*   **Profile, Bio & Settings (`/teacher/profile`):** 🟡 **MERGED FLOW.** Combined public bio editing, educational background, certificate uploads, password changes, and configurations into a single screen utilizing navigation tabs (e.g., "Tutor Profile" and "Security / Settings"). This completely replaces and merges the current placeholder page at `/teacher/settings` which only displays basic account details.
*   **Subjects & Pricing (`/teacher/subjects`):** UI to select which subjects they teach, grade levels, and their hourly rate.
*   **Availability/Schedule:** UI to define working hours so clients know when to book them.
*   **Wallet / Earnings:** If Zads handles payments, a page to view earnings and request payouts is missing.
*   **Navigation & Label Renaming (Clarification):**
    *   Rename **"تصفح الطلبات"** (Browse public student posts) to **"فرص التدريس المتاحة"** (Available Teaching Opportunities) or **"طلبات الطلاب العامة"** (Public Student Requests) to represent the public feed.
    *   Rename **"الطلبات"** / **"طلباتي"** (Direct requests received) to **"طلبات التواصل المباشر"** (Direct Contact Requests) or **"طلبات التواصل الواردة"** (Incoming Contact Requests).

## 4. Admin Portal
**Status:** 🔴 Mostly missing
*   **Overview:** Needs a robust dashboard with platform metrics (total users, active requests, revenue).
*   **Users Management (`/admin/users`):** Table to view, suspend, or approve teachers and clients.
*   **Content Management:** Manage global lists like "Available Subjects", "Cities/Districts", and "Grade Levels".
*   **System Settings:** Global configurations.

## 5. Public / Marketing Pages
**Status:** 🟡 Basic scaffolding exists
*   **Landing Page (`/public`):** Needs a complete marketing redesign (Hero section, Featured Teachers, Testimonials, Call to Action).
*   **About Us (`/public/about`):** Currently a placeholder.
*   **How it Works (`/public/how-it-works`):** Currently a placeholder.
*   **Contact Us:** Missing completely.

## 6. Global Systems & Infrastructure
**Status:** 🟡 In progress
*   **Chat / Messaging:** 🔴 Missing. If clients and teachers need to communicate after a request is accepted, a chat module is needed.
*   **Notifications System:** 🔴 Missing. Bell icon dropdown and push notifications for status updates on requests.
*   **File Uploads:** 🔴 Missing. Infrastructure for uploading images (avatars, certificates) to a storage bucket (e.g., S3 or similar) and saving URLs in Neon DB.
*   **Codebase Cleanup:** There are accidental rogue folders (e.g., `src/app/[locale]/client/{client...}`) that need to be deleted.
