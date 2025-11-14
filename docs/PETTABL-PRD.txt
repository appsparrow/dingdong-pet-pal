# Pettabl Mobile & Web Platform

**Version:** 1.0  
**Last Updated:** November 14, 2025  
**Status:** In Review

---

## Table of Contents

1. [Executive Summary](#executive-summary)  
2. [Product Vision](#product-vision)  
3. [Target Audience](#target-audience)  
4. [User Personas](#user-personas)  
5. [User Stories](#user-stories)  
6. [Technical Architecture](#technical-architecture)  
7. [Database Schema](#database-schema)  
8. [Security & Data Isolation](#security--data-isolation)  
9. [User Flows](#user-flows)  
10. [Non-Functional Requirements](#non-functional-requirements)  
11. [Current Plans & Limits](#current-plans--limits)  
12. [Success Metrics](#success-metrics)  
13. [Future Enhancements](#future-enhancements)  
14. [Appendix](#appendix)

---

## Executive Summary

### Problem Statement
- Pet owners struggle to coordinate in-home care while traveling or working long hours.  
- Caretakers lack a unified view of schedules, instructions, and proof-of-care artifacts.  
- Current point solutions (text, spreadsheets) fail to support multi-agent collaboration.

### Solution
Pettabl orchestrates pet care between Pet Bosses (owners) and Pet Agents (caregivers) across mobile and web. The platform centralizes pet profiles, daily schedules, Pet Watches (care sessions), and activity logging with photo verification.

### Key Value Propositions
1. **Coordinated Pet Watches:** Assign Pet Agents, share schedules, and update progress in real-time.
2. **Unified Experience:** Cross-platform (Expo mobile + Vite web) with shared Supabase backend.  
3. **Evidence & Trust:** Activity checklists, photo receipts, and audit trails reduce anxiety for Pet Bosses.

---

## Product Vision

Deliver the most trusted coordination hub for in-home pet care, enabling any household to delegate confidently while ensuring pets stay healthy, happy, and safe.

### Mission
"Simplify in-home pet care with collaborative tools that make every Pet Watch transparent and stress-free."

### Values
- **Trust:** Clear permissions, transparent logs, verifiable updates.  
- **Delight:** Premium UI/UX with modern gradients, animated feedback, and smart defaults.  
- **Speed:** Rapid onboarding, minimal taps for key workflows.

---

## Target Audience

### Primary Users
**1. Pet Boss (Owner/Primary)**  
- Busy professionals or frequent travelers (25–55).  
- Tech-comfortable, rely on iOS/Android daily.  
- Pain: Hard to give precise instructions and confirm they were followed.

**2. Pet Agent (Caretaker/Sitter)**  
- Trusted sitters, family members, or professional walkers.  
- Needs mobile-first access and very clear task guidance.  
- Pain: Switching between chat threads and notes; inconsistent instructions.

### Secondary Users
**3. Multi-pet households** needing team coordination.  
**4. Agencies** supervising multiple Pet Agent assignments.

---

## User Personas

### Persona 1: Maya – Traveling Pet Boss
- Age 34, lives in Austin, product manager.  
- Coordinates 2 dogs with rotating sitters.  
- Goals: Ensure feeding/meds are tracked, receive photo proof.  
- Frustrations: Forgetting to update instructions; anxious while away.  
- Quote: “If I could see a checklist with photos, I could finally relax.”

### Persona 2: Devon – Professional Pet Agent
- Age 28, Brooklyn-based sitter walking 6–8 pets daily.  
- Uses iPhone + Apple Watch.  
- Goals: Clear schedules, quick task completion, proof-of-care attachments.  
- Frustrations: Rewriting instructions manually, chasing down clarifications.  
- Quote: “I need everything in one place while I’m on the go.”

### Persona 3: Alicia – Agency Coordinator
- Runs boutique pet sitting agency.  
- Needs oversight of staff assignments, schedule gaps, and client satisfaction.  
- Wants dashboards and exportable reports.

---

## User Stories

### Epic 1: Pet Setup & Profiles
- **US-1.1:** As a Pet Boss, I can add pets with photos, breed, age, and notes.  
- **US-1.2:** As a Pet Boss, I can edit or delete a pet profile.  
- **US-1.3:** As a Pet Agent, I can view assigned pet profiles read-only.

### Epic 2: Pet Watches (Sessions)
- **US-2.1:** As a Pet Boss, I create a Pet Watch with start/end dates, notes, and assigned Pet Agents.  
- **US-2.2:** As a Pet Boss, I edit or cancel existing Pet Watches.  
- **US-2.3:** As a Pet Agent, I view current and upcoming Pet Watches with timeline indicators.

### Epic 3: Daily Schedule & Activities
- **US-3.1:** As a Pet Boss, I define daily tasks (feed, walk, let out) with notes.  
- **US-3.2:** As a Pet Agent, I check off tasks and attach photos.  
- **US-3.3:** As a Pet Boss, I receive real-time confirmation and undo/redo options.

### Epic 4: Authentication & Roles
- **US-4.1:** Email/password auth with Supabase; optional Google OAuth.  
- **US-4.2:** Role switcher for Pet Boss vs Pet Watcher with context-aware dashboards.  
- **US-4.3:** Enforce RLS so users only see their own pets, watches, and logs.

---

## Technical Architecture

### Frontend Stack
- **Expo (React Native) + TypeScript** for iOS/Android + RN Web.  
- **React Navigation** for stacks/tabs; custom theming via `mobile/src/theme/colors.ts`.  
- **Expo Web landing experience** (same codebase on port 8083) with Supabase-backed waitlist modal and Coming Soon CTAs.  
- **Vite + React 18** for marketing landing page and lightweight admin surfaces.  
- **UI Components:** Tailwind + shadcn/ui on web, custom StyleSheet components on mobile.  
- **State/Data:** TanStack Query + Supabase client.

### Backend Stack
- **Supabase** (Postgres, Auth, Storage).  
- **Cloudflare R2** for pet image storage.  
- **Supabase Functions/Triggers** for profile auto-creation and self-assignment prevention.  
- **Environment Config:** `.env.local` (web) + `mobile/.env` (Expo) using remote project keys.

### Deployment
- **Cloudflare Pages** for Vite marketing build (Babel plugin only).  
- **Expo Application Services (EAS)** for iOS/Android builds (scheme `pettabl`).  
- **GitHub** for source; documentation consolidated under `docs/`.

---

## Database Schema

### Core Tables
1. **profiles**  
   - `id` UUID (PK, references `auth.users`)  
   - `name`, `email`, `role` (`fur_boss`/`fur_agent`)  
   - `paw_points` (int)  
2. **pets**  
   - `id` UUID (PK)  
   - `fur_boss_id` (FK -> profiles)  
   - `name`, `pet_type`, `age`, `photo_url`, `medical_info`  
3. **sessions** (Pet Watches)  
   - `id` UUID (PK)  
   - `pet_id`, `fur_boss_id` (FKs)  
   - `start_date`, `end_date`, `status`, `notes`  
4. **session_agents**  
   - Junction table mapping Pet Agents to Pet Watches.  
5. **schedules / schedule_times**  
   - Daily task templates (feed, walk, let out).  
6. **activities**  
   - Logged completions with `photo_url`, `caretaker`, timestamps.
7. **waitlist**  
   - Captures marketing signups with `name`, `email`, `source`, `context`, `created_at`, `notified`.  
   - Anonymous insert policy (join from landing page), admin-only select/update.  
   - Indexed for growth analytics by `email` + `created_at`.

### Views & Functions
- `handle_new_user()` trigger populates `profiles`.  
- `prevent_self_assignment()` prevents Pet Boss assigning themselves as Pet Agent.  
- Future: materialized view for daily rollups.

---

## Security & Data Isolation
- Supabase RLS ensures Pet Bosses access only their pets/watches.  
- Pet Agents see only watches where they’re assigned.  
- Image uploads use scoped signed URLs.  
- OAuth tokens handled via Supabase client; mobile session persists via `AuthSession`.

---

## User Flows

### Flow 1: Pet Boss Creates Pet Watch
1. Open Boss Dashboard (Pet Boss mode).  
2. Tap `New Pet Watch` → pick pet.  
3. Set dates, instructions, assign Pet Agents.  
4. Pet Agents receive watch in their dashboard.

### Flow 2: Pet Agent Completes Daily Task
1. Opens Pet Watch card; sees Today’s Schedule checklist.  
2. Marks task complete, optionally uploads photo.  
3. Photo thumbnail appears inline; Pet Boss receives confirmation.  
4. Undo available for mistakes.

### Flow 3: Role Switching
1. Tap transparent pill top-right to toggle between Pet Boss and Pet Watcher.  
2. Context (tabs, data queries) refreshes based on `activeRole`.  
3. Role persisted in local storage and Supabase session.

---

## Non-Functional Requirements
- **Performance:** Critical screens load within 2 seconds on LTE.  
- **Availability:** 99.5% uptime target for Supabase services.  
- **Scalability:** Support 10k daily active users with read-heavy workloads.  
- **Accessibility:** AA contrast, VoiceOver labels on key buttons.  
- **Localization:** English-first; architecture ready for future i18n.

---

## Current Plans & Limits
- **Free Beta Tier:** up to 5 pets, 10 concurrent Pet Watches, photo storage capped at 2GB.  
- **Future Premium:** unlimited watches, advanced analytics, agency dashboards.

---

## Success Metrics
- **Activation:** % of Pet Bosses creating first Pet Watch within 48 hours.  
- **Engagement:** Average check-ins per Pet Watch per day.  
- **Trust:** Photo attachment rate (>70%).  
- **Retention:** 30-day returning Pet Agents.  
- **Top-of-Funnel:** Weekly waitlist submissions segmented by source (Expo web, iOS, Android previews).

---

## Future Enhancements

### Phase 1 (Q1 2026)
- Push notifications for schedule reminders.  
- Offline mode for Pet Agents.

### Phase 2 (Q2 2026)
- Agency admin portal with multi-agent analytics.  
- Apple Watch companion for quick task updates.

### Phase 3 (Q3 2026)
- Marketplace for vetted Pet Agents.  
- Smart suggestions based on pet history.

---

## Appendix

### Glossary
- **Pet Watch:** Scheduled block of care tasks for a pet.  
- **Pet Boss:** Owner or coordinator responsible for pets.  
- **Pet Agent:** Caregiver assigned to Pet Watches.

### Test & Deployment References
- Test plans, OAuth setup, Cloudflare deployment guides are housed in `docs/` (see README).  
- Supabase schema migrations under `supabase/migrations/`.

### Contacts
- Product: Maya Thompson (maya@pettabl.com)  
- Engineering: Siva @ Pettabl

