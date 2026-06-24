# HobiHobby — Product Roadmap

> Living document. Update the **Active Sprint** section whenever sprint scope changes. This file is the source of truth for what's done, what's in progress, and what's next — keep it in sync with `.cursorrules`.

**Last updated:** June 2026
**Current stage:** Solo founder, no hard launch deadline, quality over speed.

---

## Table of Contents

- [Vision](#vision)
- [Tech Stack](#tech-stack)
- [Architecture Decisions (Locked)](#architecture-decisions-locked)
- [Sprint Status Overview](#sprint-status-overview)
- [Sprint 1 — Foundation](#sprint-1--foundation-✅-complete)
- [Sprint 2 — AI Hook](#sprint-2--ai-hook-🔄-in-progress)
- [Sprint 3 — Retention Engine](#sprint-3--retention-engine)
- [Sprint 4 — Local Discovery](#sprint-4--local-discovery)
- [Sprint 5 — Mood-Based Recommendations](#sprint-5--mood-based-recommendations)
- [Sprint 6 — Monetization](#sprint-6--monetization)
- [Sprint 7 — Scale & Polish](#sprint-7--scale--polish)
- [Known Issues & Gotchas](#known-issues--gotchas)
- [Decision Log](#decision-log)

---

## Vision

HobiHobby is an AI-powered hobby discovery and growth platform. Unlike Meetup (event discovery only), HobiHobby covers the full journey: **discovery → learning → practice → community → growth.**

**Target audience:** 25–45 year old professionals, expats, parents seeking work-life balance (primary); students, retirees, hobby enthusiasts (secondary).

**Differentiator:** Pinterest (inspiration) + Skillshare (learning) + Meetup (events) + Amazon (supplies) — combined into one AI-guided experience.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript + TailwindCSS |
| State management | Redux Toolkit |
| Backend | Firebase Cloud Functions (2nd gen / v2 SDK), Node.js |
| Database | Firestore (NoSQL, security-rules enforced) |
| Auth | Firebase Authentication — Google provider, redirect flow |
| Hosting | Firebase Hosting (custom domain: hobihobby.com) |
| AI provider | Google Gemini API — `gemini-2.0-flash` (quiz, coach), `gemini-2.0-flash-lite` (summarization) |
| Plan | Firebase Blaze (pay-as-you-go; free tier covers MVP-scale usage) |
| Dev tooling | Cursor Pro (day-to-day coding), Claude (architecture/planning/review) |
| Repo | `github.com/KirtiSharma15/hobihobby` (monorepo) |

---

## Architecture Decisions (Locked)

These are intentional, settled decisions. Don't revisit without a strong reason — and if you do, log it in the [Decision Log](#decision-log).

- ✅ **Firebase-native only.** No Express backend, no MongoDB, no Mongoose. Firestore is the single source of truth.
- ✅ **No micro-frontends.** The repo has legacy `root-config` / `micro-frontends/` scaffolding from early setup — **ignore it.** All active development is in `web/` as a single React + Vite app. Micro-frontend complexity is for multi-team orgs, not a solo founder.
- ✅ **All AI calls go through Cloud Functions.** The Gemini API key lives only in Firebase Functions secrets — never in frontend code, never in `.env` files committed to git.
- ✅ **Cloud Functions use the v2 SDK.** Import from `firebase-functions/v2/https`, not the legacy `functions.https.onCall` / `functions.runWith` v1 API.
- ✅ **Firebase Hosting only.** Vercel has been fully decommissioned.

---

## Sprint Status Overview

| Sprint | Focus | Status |
|---|---|---|
| 1 | Auth, save hobbies, hosting | ✅ Complete |
| 2 | AI Discovery Quiz + AI Coach | 🔄 In Progress |
| 3 | 365-day journey, streaks | 🔲 Not started |
| 4 | Hobby Map, local discovery | 🔲 Not started |
| 5 | Mood-based recommendations | 🔲 Not started |
| 6 | Monetization | 🔲 Not started |
| 7 | Scale & polish (mobile, push, offline) | 🔲 Not started |

---

## Sprint 1 — Foundation ✅ COMPLETE

**Goal:** Something worth showing people, with persistent per-user state.

### Delivered
- [x] Firebase Auth — Google Sign-In (redirect flow, not popup — see [Known Issues](#known-issues--gotchas))
- [x] Firestore database with security rules (users can only read/write their own data)
- [x] User profile auto-created in Firestore on first login
- [x] Save / unsave hobby, persisted per user
- [x] Hobby Explorer + Hobby Detail pages (live, seed data)
- [x] Firebase Hosting deployment — replaced Vercel entirely
- [x] Custom domain `hobihobby.com` connected
- [x] Firebase upgraded to Blaze plan (required for Cloud Functions)

### Key files
```
web/src/services/firebase.ts        — Firebase app init (auth, firestore)
web/src/hooks/useAuth.ts            — auth state, login/logout
web/src/hooks/useSaveHobby.ts       — save/unsave hobby logic
web/src/store/slices/userSlice.ts
web/src/store/slices/hobbiesSlice.ts
functions/index.js                  — syncUser Cloud Function
firestore.rules
```

---

## Sprint 2 — AI Hook 🔄 IN PROGRESS

**Goal:** The feature that makes HobiHobby feel different from a Google search.

### Scope
- [ ] AI Hobby Discovery Quiz — 7 questions, one per screen, progress bar
- [ ] Quiz → ranked recommendations with match score + reasoning (via `hobbyQuiz` Cloud Function)
- [ ] AI Hobby Coach — WhatsApp-style chat interface (via `hobbyCoach` Cloud Function)
- [ ] Tutorial summarization Cloud Function (`summarizeTutorial`) — backend only this sprint, no UI yet

### Out of scope this sprint
- Mood-based recommendations (→ Sprint 5)
- Floating coach widget on hobby detail pages (dedicated `/coach` page only for now)
- Tutorial summarization UI

### AI model choices
| Feature | Model | Why |
|---|---|---|
| Hobby quiz | `gemini-2.0-flash` | Reliable structured JSON output |
| Hobby coach | `gemini-2.0-flash` | Fast, good conversational reasoning |
| Tutorial summarization | `gemini-2.0-flash-lite` | Lighter task, lower cost |

> **Note on model choice:** Gemma 4 was evaluated and rejected for this stage. The cost difference vs. Gemini 2.0 Flash is under $2/month at MVP scale, while Gemini 2.0 Flash is materially more reliable at returning well-formed JSON — which the quiz feature depends on. Revisit only at meaningful scale (10,000+ DAU).

### Key files (new)
```
web/src/store/slices/aiSlice.ts             — chat history, quiz answers, recommendations
web/src/hooks/useHobbyQuiz.ts               — quiz flow + Cloud Function call
web/src/hooks/useHobbyCoach.ts              — coach chat + Cloud Function call
web/src/components/coach/CoachChat.tsx
web/src/components/coach/CoachMessage.tsx
web/src/components/coach/CoachInput.tsx
web/src/pages/QuizPage.tsx
web/src/pages/QuizResultsPage.tsx
web/src/pages/CoachPage.tsx
functions/index.js                          — + hobbyQuiz, hobbyCoach, summarizeTutorial
```

### Definition of done
- [ ] Signed-in user completes 7-question quiz, sees 5 AI-generated recommendations
- [ ] User can save any recommended hobby directly from results screen
- [ ] User can chat with AI Coach and get contextual replies
- [ ] No Gemini API key ever exposed in frontend/network tab
- [ ] Deployed and verified on live Firebase Hosting URL

> Full implementation spec (complete code for every file): see `HobiHobby_Sprint2_Handoff.docx` or the Sprint 2 handoff thread.

---

## Sprint 3 — Retention Engine

**Goal:** The Duolingo moment — a daily reason to open the app.

### Scope
- [ ] 365-day hobby journey — progressive daily tasks per hobby (data model extends existing `Hobby` schema with `journeyDays[]`)
- [ ] Streak tracking per user, per hobby
- [ ] Weekly milestone badges (survive a broken streak, unlike daily-only streaks)
- [ ] "Comeback challenge" prompt after a missed day — no shame messaging
- [ ] Progress photo timeline (Firebase Storage)
- [ ] Personalized AI weekly plans (e.g. "30 mins/day painting plan") — built on Gemini, reuses `hobbyCoach`-style Cloud Function pattern
- [ ] "My Hobbies" dashboard — streaks, saved hobbies, active journeys in one view

### Notes
- Seed 7 days of journey content for 2–3 pilot hobbies first (e.g. Photography, Painting, Pottery) before scaling to all hobbies
- Beginner win notifications ("You've practiced 3 days in a row — most people quit by day 2") are a cheap, high-impact addition once streaks exist

---

## Sprint 4 — Local Discovery

**Goal:** Real-world utility that's hard for competitors to copy.

### Scope
- [ ] Hobby Map — Google Maps + Places API integration
- [ ] Nearby classes, workshops, hobby stores
- [ ] Hobby events feed
- [ ] Hobby compatibility matching — "find someone at your level nearby" (more compelling than generic group browsing)
- [ ] Community Circles — small local groups by hobby + skill level + location

### Notes
- **Pick one city to nail first** — Abu Dhabi or Dubai — before going wide. Local data quality matters more than coverage breadth at this stage.
- Don't launch Community Circles before there are enough users to populate them. An empty group page kills momentum — sequence this carefully or gate it behind a minimum local user count.

---

## Sprint 5 — Mood-Based Recommendations

**Goal:** Make the AI feel like it actually knows the user, not just their quiz answers.

### Scope
- [ ] Mood input (e.g. "stressed," "low energy," "social isolation") → 2–3 contextual hobby suggestions
- [ ] Leverages Gemini's long context window — pass full saved-hobby history + recent activity in a single call
- [ ] Surface mood prompt contextually (e.g. after several days of inactivity, or on-demand from the Coach)

### Example prompt pattern
```
User mood: "stressed"
Saved hobbies: [...]
Recent activity: [...]
→ Suggest 2-3 hobbies to do right now with a brief reason for each.
```

---

## Sprint 6 — Monetization              

**Goal:** Revenue without breaking the experience.

> **Rule:** Don't activate monetization until ~1,000 weekly active users. Premature monetization kills early growth — prioritize retention data first.

### Scope
- [ ] Freemium gate — AI Coach, personalized plans, advanced recommendations behind a paywall; basic discovery stays free
- [ ] Affiliate links — Amazon, Decathlon, local hobby stores on hobby detail pages (starter kits)
- [ ] Sponsored listings — local classes/workshops pay for featured placement
- [ ] Stripe integration for subscriptions (architecture for this already exists in the original HLD — implement when this sprint starts)

---

## Sprint 7 — Scale & Polish

**Goal:** Ready for real growth and investment conversations.

### Scope
- [ ] React Native mobile app (Expo) — reuse `shared/` package for types and business logic
- [ ] Push notifications — streak reminders, new challenges, comeback nudges
- [ ] Offline mode — basic hobby plans available without connectivity
- [ ] Social sharing — progress cards, milestone shares
- [ ] Performance optimization for traffic spikes
- [ ] Internal analytics dashboard

---

## Known Issues & Gotchas

Carried forward from Sprint 1 & 2 — check here before re-debugging something already solved.

### Google Sign-In popup blocked by Cross-Origin-Opener-Policy
`signInWithPopup` triggers COOP console errors in Chrome. **Fix:** use `signInWithRedirect` + `getRedirectResult` instead. Already implemented — don't revert.

### `functions.runWith` is not a function
That's the deprecated v1 Functions API. This project uses the **v2 SDK** exclusively:
```js
const { onCall, HttpsError } = require('firebase-functions/v2/https');
// secrets passed via options object:
onCall({ secrets: ['GEMINI_API_KEY'] }, handler)
```

### Firestore rules compilation error: `mismatched input '{'`
Usually a stray character or duplicate brace at the very top of `firestore.rules`. Fix by selecting all content, deleting it, and repasting the rules block fresh — don't try to patch in place.

### Custom domain ACME challenge failed (404)
Caused by a leftover A record from the domain registrar's default parking page conflicting with Firebase's required A record (`199.36.158.100`) and TXT verification record. Check the DNS provider for conflicting old A records before re-verifying in Firebase Console → Hosting.

### Legacy Express backend / MongoDB references
The original HLD references an Express + MongoDB backend with Stripe. This was **superseded** by the Firebase-native architecture. Do not resurrect Express routes or Mongoose models — Firestore + Cloud Functions is the permanent backend.

---

## Decision Log

| Date | Decision | Reasoning |
|---|---|---|
| 2026-06 | Firebase-only backend (no Express, no MongoDB) | Solo founder; minimize ops overhead; Firebase free tier covers MVP scale |
| 2026-06 | Firebase Hosting over Vercel | One platform, one bill, simpler deployment with Cloud Functions in the mix |
| 2026-06 | Upgraded to Blaze plan | Required for Cloud Functions; free tier within Blaze is generous enough that cost is ~$0 until real traction |
| 2026-06 | Gemini 2.0 Flash over Gemma 4 | Better structured JSON reliability for quiz output; cost difference negligible at current scale |
| 2026-06 | No micro-frontends | Added complexity with zero benefit for a solo founder; consolidated into single `web/` app |
| 2026-06 | Cloud Functions v2 SDK | v1's `functions.runWith` is deprecated and broke deployment |

---

*This file should be updated at the start and end of every sprint. Keep `.cursorrules`' "Active Sprint" block in sync with the Sprint Status Overview table above.*