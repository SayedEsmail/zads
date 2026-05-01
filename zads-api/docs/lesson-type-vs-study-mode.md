# LessonType vs StudyMode — Coexistence Note

**Last updated:** April 2026 (PE-5)

---

## Two separate concepts

| Field | Model | Values | What it means |
|---|---|---|---|
| `LessonType` (enum) | `TutorRequest.preferredLessonType`, `Teacher.lessonTypes` | `at_teacher`, `at_student`, `group`, `any` | **Where** the physical lesson takes place |
| `StudyMode` (enum) | `TutorRequest.studyMode`, search filter | `online`, `offline`, `both` | **Whether** the lesson is online or in-person |

---

## Why both exist

`LessonType` was the original model for lesson location (at teacher's home, at student's home, group session, or flexible). It is a valid *in-person* sub-classification.

`StudyMode` was added in the PE-1 migration (April 2026) to satisfy the product requirement that any lesson can be **online** (video call, regardless of location) or **offline** (physical presence). A client booking an online lesson does not care about `at_teacher` vs `at_student`; they only care about connectivity.

---

## Relationship

```
studyMode = 'online'   → lesson is remote; LessonType is irrelevant (ignore or default to 'any')
studyMode = 'offline'  → lesson is in-person; LessonType specifies the venue
studyMode = 'both'     → client accepts either; show all lesson type options
```

---

## Current status

Both fields **coexist** in v1. There is no plan to remove `LessonType` in the near term because:

1. Existing API data uses `LessonType`.
2. Teacher profiles use `lessonTypes` (JSON array) to indicate which in-person formats they support.
3. Removing it would require a coordinated migration of all client and teacher UIs.

**Decision:** Keep `LessonType` for in-person venue sub-classification. Use `StudyMode` for the primary online/offline filter throughout the new `zads-app` (Next.js). Do a consolidation pass if the product team decides to unify them in a future release.

---

## Next.js app (zads-app) guidance

- Tutor request form: show `studyMode` picker (online / offline / both) as the primary field. Show `preferredLessonType` only when `studyMode` is `offline` or `both`.
- Teacher search filter: use `studyMode` as the top-level filter. `LessonType` is a secondary filter (sub-filter for in-person).
- Teacher subjects pricing: show `priceOnline` / `priceOffline` columns prominently; show legacy `priceAtTeacher` / `priceAtStudent` / `priceGroup` as secondary "in-person" fields.
