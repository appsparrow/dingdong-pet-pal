# Pettabl – Regression Test Cases

**Version:** 1.0  
**Last Updated:** November 14, 2025  
**Scope:** Core mobile (Expo) and supporting web experiences

---

## Legend
- **Role:** PB (Pet Boss), PA (Pet Agent)  
- **Env:** Local Expo dev unless noted  
- **Pre-Req:** Unless specified, assume seeded Supabase project, valid credentials, and fresh app install/cache clear.

---

## TC-001 — PB Signup & Login (Mobile)
- **Role:** PB
- **Steps:**
  1. Launch app, select signup.
  2. Enter email + strong password.
  3. Select `Pet Boss` role, submit.
  4. Confirm email toast appears.
- **Expected:**
  - Supabase `profiles` entry created with `role=fur_boss`.
  - App routes to marketing screen post-confirmation.

## TC-002 — Add Pet
- **Role:** PB
- **Steps:**
  1. From boss dashboard, tap `Add Pet`.
  2. Fill pet name, type, photo, age; save.
- **Expected:**
  - Pet card appears under `My Pets` with accurate metadata.
  - Supabase `pets` row linked to PB.

## TC-003 — Create Watch Session
- **Role:** PB
- **Pre-Req:** At least one pet.
- **Steps:**
  1. Tap `New Pet Watch` from Quick Actions.
  2. Pick dates, add notes, search and assign existing Pet Agent.
  3. Save.
- **Expected:**
  - Success toast/log.
  - `sessions` row created with `status=planned`.
  - `session_agents` row for each assigned agent.

## TC-004 — View Upcoming Watch (Read-Only)
- **Role:** PB
- **Pre-Req:** Existing planned session starting in future.
- **Steps:**
  1. Open Pet Watch list.
  2. Tap upcoming watch.
- **Expected:**
  - Modal title `View Watch Details`.
  - Notes and agent chips visible but not editable.
  - Date pickers disabled; bottom shows `Close` only.

## TC-005 — Update Active Watch
- **Role:** PB
- **Pre-Req:** Session with `status=active` (start date <= today).
- **Steps:**
  1. Open watch, change notes, modify assigned agent list.
  2. Save.
- **Expected:**
  - Modal allows editing.
  - Updates persisted to Supabase rows.

## TC-006 — Switch Modes from Dashboard Pill
- **Role:** PB/PA
- **Steps:**
  1. On boss dashboard, tap top-right pill.
  2. Confirm mode toggles to `Pet Watcher`.
- **Expected:**
  - Role context updates, agent dashboard loads.
  - Local storage persists new `activeRole`.

## TC-007 — Switch Modes from Profile Screen
- **Role:** PB/PA
- **Steps:**
  1. Open profile screen.
  2. Tap `Switch to <role>` button.
- **Expected:**
  - Alert reflects new role name.
  - Dashboard refreshes to appropriate view.

## TC-008 — Agent Dashboard Pet Watch Cards
- **Role:** PA
- **Steps:**
  1. Sign in as assigned agent.
  2. Review `My Pet Watches` tabs (current/upcoming).
- **Expected:**
  - Cards render with timeline dots, status, and start/end dates.
  - Upcoming watches appear only in `Upcoming` tab.

## TC-009 — Agent Daily Checklist Completion
- **Role:** PA
- **Pre-Req:** Active watch with schedule.
- **Steps:**
  1. Open Pet Watch, mark task as done, upload photo.
- **Expected:**
  - Task list shows inline photo in avatar circle.
  - Pet Boss dashboard reflects completion timestamp.

## TC-010 — Undo Completed Activity
- **Role:** PA
- **Steps:**
  1. After completing task, tap `Undo`.
- **Expected:**
  - Activity removed from Supabase `activities` table.
  - Checklist reverts to pending state.

## TC-011 — Role Access Control (RLS Sanity)
- **Role:** Mixed
- **Steps:**
  1. As Pet Agent, attempt to query Supabase for other PB pets.
- **Expected:** Supabase returns 401/RLS violation; data remains isolated.

## TC-012 — Docs & Deployment References
- **Role:** QA/DevOps
- **Steps:**
  1. Inspect `README.md` and `docs/` content.
- **Expected:** Links to PRD (`docs/PETTABL-PRD.md`) and deployment guides resolve.

---

## Notes
- Automate TC-004/005/006/007 with Detox (mobile) when feasible.
- Performance metrics recorded separately (see `docs/PETTABL-PRD.md`).
- Update this suite alongside major feature toggles.

