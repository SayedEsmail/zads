# Zads Application - Comprehensive Audit & Missing Features Review

This document outlines the current state of the Zads Next.js application, detailing what has been completed, what is partially implemented (mocked/stubbed), and what is entirely missing. This will serve as our roadmap for the upcoming development phases.

## 1. Authentication & Onboarding
**Status:** ✅ UI completed | 🟡 Integration partially completed
*   **Login & Register UI:** Completed and styled uniformly (Minimal/Clean design).
*   **Forgot Password:** Link exists, but the page and logic (`/auth/forgot-password`) are missing.
*   **Reset Password:** Missing UI and integration for resetting the password via email/SMS link.
*   **Verification:** Missing flow for verifying phone numbers or emails (OTP verification screen).

## 2. Client Portal (Parents / Students)
**Status:** 🟡 Dashboard UI scaffolded | 🔴 Sub-pages missing
*   **Dashboard (`/client`):** Scaffolded with "Recent Requests" and "Saved Teachers" (currently using static/mock data).
*   **Teacher Search & Discovery (`/client/teacher`):** 🔴 **CRITICAL MISSING FEATURE.** The core ability to search, filter, and view teacher profiles is not built.
*   **Booking Flow:** The modal/page to send a tutoring request to a teacher is missing.
*   **Requests Management (`/client/requests`):** Needs a full table/list to view pending, accepted, and rejected requests.
*   **Dependents Management (`/client/dependents`):** If a parent, they need a UI to add/edit student profiles.
*   **Profile (`/client/profile`):** Page to view and edit personal information and avatar.
*   **Settings (`/client/settings`):** Change password, update notification preferences.

## 3. Teacher Portal (Tutors)
**Status:** 🟡 Dashboard UI scaffolded | 🔴 Sub-pages missing
*   **Dashboard (`/teacher`):** Scaffolded with stats and "Recent Contacts" (static data).
*   **Incoming Requests (`/teacher/requests`):** UI to view incoming requests from clients and Accept/Reject them.
*   **Profile & Bio (`/teacher/profile`):** Essential for teachers to market themselves. Needs UI for editing bio, education, and uploading certificates.
*   **Subjects & Pricing (`/teacher/subjects`):** UI to select which subjects they teach, grade levels, and their hourly rate.
*   **Availability/Schedule:** UI to define working hours so clients know when to book them.
*   **Wallet / Earnings:** If Zads handles payments, a page to view earnings and request payouts is missing.

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
