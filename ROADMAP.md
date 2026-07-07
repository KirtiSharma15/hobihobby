# HobiHobby — Product Roadmap

> **Source of truth.** Update the Sprint Status table at the start and end of every sprint. Keep `.cursorrules` Active Sprint block in sync with this file.

**Last updated:** June 2026
**Stage:** Early-stage, solo founder + one team member. No hard launch deadline. Quality over speed.
**Markets:** UAE (Abu Dhabi + Dubai) first → India (Sprint 7)

---

## ⚠️ Team Member Notice

The original product spec references **React Native, Expo, and OpenAI**. All three have changed. Do not use the original spec as a technology reference.

| Original Spec | Current Reality |
|---|---|
| React Native + Expo | React 18 + Vite web app. React Native is Sprint 7 only. |
| OpenAI | Gemini 2.0 Flash — already deployed |
| Express + MongoDB | Retired — Firebase-native only |
| Micro-frontend setup | Abandoned — single `web/` Vite app |
| Stripe only | Stripe (UAE) + Razorpay (India) — Sprint 6/7 |

**This ROADMAP.md is the source of truth. The original spec is product vision context only.**

---

## Table of Contents

- [Vision](#vision)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Target Audience](#target-audience)
- [Key Differentiators](#key-differentiators)
- [MVP Features](#mvp-features)
- [AI Features Roadmap](#ai-features-roadmap)
- [Monetization Plan](#monetization-plan)
- [Market Strategy](#market-strategy)
- [Tech Stack](#tech-stack)
- [Architecture Decisions (Locked)](#architecture-decisions-locked)
- [Folder Structure](#folder-structure)
- [Redux Slices](#redux-slices)
- [Design System](#design-system)
- [Sprint Status Overview](#sprint-status-overview)
- [Sprint 1 — Foundation](#sprint-1--foundation-✅-complete)
- [Sprint 2 — AI Hook](#sprint-2--ai-hook-🔄-in-progress)
- [Sprint 3 — Retention Engine](#sprint-3--retention-engine)
- [Sprint 4 — Local Discovery](#sprint-4--local-discovery)
- [Sprint 5 — Mood-Based Recommendations](#sprint-5--mood-based-recommendations)
- [Sprint 6 — Monetization](#sprint-6--monetization)
- [Sprint 7 — Scale, Mobile & India](#sprint-7--scale-mobile--india)
- [MCP Integration Plan](#mcp-integration-plan)
- [Long-Term Vision](#long-term-vision)
- [Known Issues & Gotchas](#known-issues--gotchas)
- [Decision Log](#decision-log)

---

## Vision

HobiHobby is an AI-powered hobby discovery and growth platform that helps people discover new hobbies, learn them, find nearby classes and events, connect with like-minded people, track progress, and purchase required supplies.

Unlike Meetup (event discovery only), HobiHobby covers the full journey:

**discovery → learning → practice → community → growth**

One platform for the complete hobby journey.

---

## Problem Statement

Millions of people want hobbies but struggle with:

- Not knowing what hobby suits them
- Lack of time to research options
- Difficulty finding nearby classes or communities
- Information scattered across YouTube, Google, Reddit, and social media
- No structured learning path for beginners
- Lack of motivation and accountability

---

## Solution

An AI-powered platform that:

- Recommends hobbies based on interests, personality, budget, available time, and goals
- Creates personalised hobby learning paths
- Finds nearby hobby classes, workshops, events, and communities
- Curates tutorials and learning resources
- Recommends starter kits and supplies
- Tracks hobby progress and achievements
- Builds small interest-based local circles

---

## Target Audience

**Primary:** 25–45 year old professionals, expats, parents, people seeking better work-life balance

**Secondary:** Students, retirees, hobby enthusiasts

**Markets:**
- UAE (Abu Dhabi + Dubai) — launch market
- India (Mumbai, Delhi, Bangalore, Pune, Hyderabad) — Sprint 7

---

## Key Differentiators

| Platform | What it does |
|---|---|
| Pinterest | Inspiration only |
| Skillshare | Learning only |
| Meetup | Events only |
| Amazon | Supplies only |
| **HobiHobby** | **All of the above + AI coaching + progress tracking** |

---

## MVP Features

### 1. AI Hobby Discovery Quiz
Users answer questions about interests, personality, available time, budget, indoor/outdoor preference, and solo/group preference.

Output: recommended hobbies with match score and reasoning.

### 2. Hobby Explorer
Browse hobbies by category, difficulty, budget, and time commitment.

Examples: Photography, Gardening, Pottery, Painting, Running, Hiking, Baking, Music, Chess.

India additions (Sprint 7): Classical dance (Bharatnatyam, Kathak), Tabla, Sitar, Yoga, Rangoli, Mehndi, Block printing, Cricket.

### 3. Hobby Detail Page
Includes: description, difficulty level, time commitment, estimated cost, starter kit, tutorials, local classes, related communities.

### 4. Hobby Map
Find nearby hobby classes, workshops, stores, clubs, and events using Google Maps + Places API.

UAE: Abu Dhabi + Dubai · India Sprint 7: Mumbai, Delhi, Bangalore first.

### 5. My Hobbies
Save hobbies, track progress, create goals, track streaks, 365-day journey.

### 6. Community Circles
Small groups based on hobby + skill level + location.

Examples: Beginner Painters Abu Dhabi, Weekend Cyclists Dubai.

### 7. AI Hobby Coach
Chat assistant that suggests hobbies, creates learning plans, answers questions, recommends resources, and keeps users motivated.

---

## AI Features Roadmap

### Phase 1 — Sprints 2–3
- **Hobby Recommendation Engine** — quiz inputs → ranked hobby recommendations (Gemini 2.0 Flash)
- **AI Hobby Coach** — multi-turn chat, context-aware (Gemini 2.0 Flash)
- **Tutorial Summarization** — long tutorials → beginner guides, checklists, learning plans (Gemini 2.0 Flash-Lite)

### Phase 2 — Sprints 5–6
- **Mood-Based Recommendations** — stress → drawing/yoga, high energy → running/cycling
- **Personalised Weekly Plans** — "30 mins/day painting plan", "weekend photography roadmap"
- **MCP-powered Coach** — Coach calls real tools (user progress, nearby places, hobby catalog) instead of answering from training data only

### Phase 3 — Sprint 7+
- **Hindi language AI Coach** — Gemini 2.0 Flash handles Hindi natively
- **India-specific recommendations** — culturally relevant hobby suggestions for Indian audience

---

## Monetization Plan

### Freemium
- **Free:** Basic hobby discovery, Hobby Explorer, Hobby Detail
- **Premium:** AI Coach, personalised plans, advanced recommendations

### Affiliate Revenue
Starter kits and supplies via:
- UAE: Amazon, Decathlon, local hobby stores
- India: Amazon India, Flipkart, Hobby Ideas, Itsy Bitsy (art supplies), Bajaao (music)

### Sponsored Listings
Classes, workshops, and hobby businesses pay for featured placement on map and events feed.

### Future
Marketplace for instructors and hobby creators.

> ⚠️ **Rule:** Do not activate monetization until ~1,000 weekly active users. Premature monetization kills early growth.

---

## Market Strategy

### UAE First (Sprints 1–6)
- Small, English-speaking, high-spending audience
- Forgiving of early bugs — good for validation
- Expat community has strong hobby interest
- Start with Abu Dhabi only → expand to Dubai

### India (Sprint 7)
Strong market fit:
- 1.4 billion people, massive growing middle class
- Hobby culture exploding post-COVID
- No dominant player doing what HobiHobby does
- Tier 1 cities: Mumbai, Delhi, Bangalore, Pune, Hyderabad

What changes for India:
| Dimension | UAE | India |
|---|---|---|
| Language | English | English + Hindi |
| Currency | AED | INR |
| Payments | Stripe | Razorpay (UPI, cards, net banking) |
| Hobby catalog | Standard | + Classical dance, Tabla, Yoga, Rangoli etc. |
| Pricing | Premium ($50–200) | Budget-sensitive ($5–30) |
| Maps | Google Places UAE | Google Places India (Tier 1 cities first) |

### Why not launch India simultaneously
- Two markets with 2 people splits focus and slows both
- UAE validates the core product before India scale
- India requires Hindi, Razorpay, India hobby catalog, React Native — all Sprint 7

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend (web) | React 18 + Vite + TypeScript + TailwindCSS |
| Frontend (mobile) | React Native + Expo — **Sprint 7 only, not yet active** |
| State management | Redux Toolkit + Redux Persist |
| Backend | Firebase Cloud Functions (2nd gen / v2 SDK), Node.js |
| Database | Firestore (NoSQL, security-rules enforced) |
| Auth | Firebase Authentication — Google provider, redirect flow |
| Storage | Firebase Storage (progress photos — Sprint 3+) |
| Hosting | Firebase Hosting — hobihobby.com |
| AI | Gemini 2.0 Flash (quiz, coach), Gemini 2.0 Flash-Lite (summarization) |
| Maps | Google Maps + Places API — Sprint 4 |
| Payments (UAE) | Stripe — Sprint 6 |
| Payments (India) | Razorpay — Sprint 7 |
| Localization | i18n + Hindi — Sprint 7 |
| Networking | Axios |
| Firebase plan | Blaze (pay-as-you-go) |
| Dev tooling | Cursor Pro + Claude |
| Repo | `github.com/KirtiSharma15/hobihobby` (monorepo) |

---

## Architecture Decisions (Locked)

Do not revisit without a strong reason. Log any changes in the [Decision Log](#decision-log).

- ✅ **Firebase-native only.** No Express, no MongoDB, no Mongoose. Firestore is the single database.
- ✅ **No micro-frontends.** Legacy `root-config` / `micro-frontends/` scaffolding exists in the repo — ignore it entirely. All work is in `web/` as a single Vite app.
- ✅ **All AI calls through Cloud Functions.** Gemini API key stored in Firebase Functions secrets only. Never in frontend `.env`. Never committed to git.
- ✅ **Cloud Functions v2 SDK only.** Use `firebase-functions/v2/https`. Never use `functions.runWith` or v1 `functions.https.onCall`.
- ✅ **Firebase Hosting only.** Vercel fully decommissioned.
- ✅ **Gemini 2.0 Flash** over Gemma 4 or OpenAI. Better JSON reliability, same free tier, Google-native.
- ✅ **Web-first.** React Native is Sprint 7. All current work targets `web/`.
- ✅ **UAE-first.** India market launches in Sprint 7 with Hindi, Razorpay, and React Native together.

---

## Folder Structure

### Active web app (`web/src/`)

```
web/src/
├── components/
│   ├── coach/
│   │   ├── CoachChat.tsx
│   │   ├── CoachInput.tsx
│   │   └── CoachMessage.tsx
│   └── ui/                     ← shared UI components
├── hooks/
│   ├── useAuth.ts
│   ├── useHobbyCoach.ts
│   ├── useHobbyQuiz.ts
│   └── useSaveHobby.ts
├── pages/
│   ├── LoginPage.tsx
│   ├── QuizPage.tsx
│   ├── QuizResultsPage.tsx
│   └── CoachPage.tsx
├── services/
│   └── firebase.ts
├── store/
│   ├── index.ts
│   └── slices/
│       ├── userSlice.ts
│       ├── hobbiesSlice.ts
│       └── aiSlice.ts
└── types/
```

### Cloud Functions (`functions/`)

```
functions/
└── index.js    ← syncUser, hobbyQuiz, hobbyCoach, summarizeTutorial
```

### Target structure for React Native (Sprint 7)

```
mobile/src/
├── api/
├── assets/
├── components/
├── features/
│   ├── user/
│   ├── hobbies/
│   ├── community/
│   ├── ai/
│   └── ui/
├── hooks/
├── navigation/
├── screens/
├── services/
├── store/
├── types/
├── constants/
├── utils/
└── theme/
```

---

## Redux Slices

### Active slices

| Slice | State |
|---|---|
| `user` | profile, isAuthenticated, isLoading, error |
| `hobbies` | savedHobbyIds, isLoading |
| `ai` | chatHistory, recommendations, quizAnswers, isCoachLoading, isQuizLoading, error |

### Planned slices

| Slice | State | Sprint |
|---|---|---|
| `journey` | activeJourneys, streaks, milestones, completedDays | 3 |
| `community` | circles, events, members | 4 |
| `ui` | loading states, theme, modals | 4 |

### React Native slices (Sprint 7)

| Slice | State |
|---|---|
| `user` | profile, preferences, onboarding answers |
| `hobbies` | hobby list, hobby details, recommendations, saved hobbies |
| `community` | groups, events |
| `ai` | chat history, recommendations, learning plans |
| `ui` | loading, errors, theme |

---

## Design System

### Artisan Theme (locked)

| Token | Value |
|---|---|
| Background | Warm Cream `#F5F0E8` |
| Surface / Cards | `#FFFCF7` |
| Primary CTA | Terracotta `#C4522A` |
| Accent | Olive `#6B7C3A` |
| Text Primary | Deep Warm Brown `#2C1810` |
| Text Secondary | `#6B5B52` |
| Streak / Success | Amber `#F59E0B` |
| Error | `#DC2626` |
| Border / Divider | `#E8E0D5` |

### Typography
Font: **Plus Jakarta Sans**

| Style | Size | Weight |
|---|---|---|
| Display | 32px | Bold |
| H1 | 24px | Bold |
| H2 | 20px | Semibold |
| H3 | 17px | Semibold |
| Body | 15px | Regular |
| Caption | 13px | Regular |
| Label | 12px | Medium |

### Screens designed (via Claude Design)
- ✅ Brand style guide + logo
- ✅ Hobby Explorer
- ✅ Hobby Detail Page
- ✅ AI Quiz (intro, question, loading screens)
- ✅ Quiz Results
- ✅ AI Coach Chat
- ✅ My Hobbies Dashboard
- ✅ Hobby Map
- ✅ Login / Onboarding

### Design principles
- Mobile-first
- Clean and modern, warm not corporate
- Fast performance
- Offline-friendly where possible
- Reusable components
- Strong TypeScript typing
- AI-first experience
- Minimal business logic inside components

---

## Sprint Status Overview

| Sprint | Focus | Status |
|---|---|---|
| 1 | Auth, save hobbies, Firebase hosting | ✅ Complete |
| 2 | AI Discovery Quiz + AI Hobby Coach | ✅ Complete |
| 3 | 365-day journey, streaks, retention | 🔄 In Progress |
| 4 | Hobby Map, local discovery, Community Circles | 🔲 Not started |
| 5 | Mood-based recommendations + MCP Coach | 🔲 Not started |
| 6 | Monetization — Stripe, freemium, affiliate | 🔲 Not started |
| 7 | React Native + Hindi + Razorpay + India launch | 🔲 Not started |

---

## Sprint 1 — Foundation ✅ COMPLETE

**Goal:** Persistent per-user state, working auth, deployed app.

### Delivered
- [x] Firebase Auth — Google Sign-In (redirect flow)
- [x] Firestore with security rules
- [x] User profile auto-created on first login
- [x] Save / unsave hobby per user
- [x] Hobby Explorer + Hobby Detail pages (seed data)
- [x] Firebase Hosting — replaced Vercel
- [x] Custom domain `hobihobby.com`
- [x] Firebase Blaze plan
- [x] Cloud Functions (v2 SDK) deployed

### Key files
```
web/src/services/firebase.ts
web/src/hooks/useAuth.ts
web/src/hooks/useSaveHobby.ts
web/src/store/slices/userSlice.ts
web/src/store/slices/hobbiesSlice.ts
functions/index.js                  ← syncUser
firestore.rules
```

---

## Sprint 2 — AI Hook 🔄 IN PROGRESS

**Goal:** The feature that makes HobiHobby feel different from a Google search.

### Scope
- [ ] AI Hobby Discovery Quiz — 7 questions, one per screen, progress bar
- [ ] Quiz results — 5 ranked hobby recommendations with match score + reasoning
- [ ] AI Hobby Coach — WhatsApp-style chat, dedicated `/coach` page
- [ ] Tutorial Summarization Cloud Function — backend only, no UI this sprint

### The 7 quiz questions

| # | Question | Options |
|---|---|---|
| 1 | How do you like to spend your free time? | Indoors / Outdoors / Both |
| 2 | Do you prefer solo or social activities? | Solo / With others / Mix |
| 3 | What's your weekly time budget? | <2 hrs / 2–5 hrs / 5+ hrs |
| 4 | What's your starter budget? | Under $50 / $50–$200 / $200+ |
| 5 | What do you want from a hobby? | Relaxation / Creativity / Fitness / Learning / Social |
| 6 | Physical or mental activities? | Physical / Mental / Both |
| 7 | Any areas that interest you? | Art / Music / Tech / Nature / Food / Sport / Writing |

### AI models

| Feature | Model |
|---|---|
| Quiz + Coach | `gemini-2.5-flash` |
| Tutorial summarization | `gemini-2.5-flash-lite` |

### Out of scope this sprint
- Mood-based recommendations → Sprint 5
- Floating coach on hobby detail pages → Sprint 3
- Tutorial summarization UI → Sprint 3
- MCP integration → Sprint 3+
- Hindi language → Sprint 7

### Key files (new)
```
web/src/store/slices/aiSlice.ts
web/src/hooks/useHobbyQuiz.ts
web/src/hooks/useHobbyCoach.ts
web/src/components/coach/CoachChat.tsx
web/src/components/coach/CoachMessage.tsx
web/src/components/coach/CoachInput.tsx
web/src/pages/QuizPage.tsx
web/src/pages/QuizResultsPage.tsx
web/src/pages/CoachPage.tsx
functions/index.js                  ← + hobbyQuiz, hobbyCoach, summarizeTutorial
```

### Definition of done
- [ ] User completes 7-question quiz → sees 5 AI recommendations
- [ ] User saves a recommended hobby from results screen
- [ ] User chats with AI Coach and gets contextual replies
- [ ] Gemini API key never visible in browser dev tools
- [ ] Deployed and verified on hobihobby.com

> Full implementation code: see `HobiHobby_Sprint2_Handoff.docx` in the repo.

---

## Sprint 3 — Retention Engine

**Goal:** The Duolingo moment — a daily reason to open the app.

### Scope
- [ ] 365-day hobby journey per hobby — progressive daily tasks
- [ ] Seed 7 days of content for 3 pilot hobbies (Photography, Painting, Pottery)
- [ ] Streak tracking per user per hobby
- [ ] Weekly milestone badges
- [ ] "Comeback challenge" after a missed day — no shame messaging
- [ ] Progress photo timeline (Firebase Storage)
- [ ] Personalised AI weekly plans via Gemini Cloud Function
- [ ] "My Hobbies" dashboard — streaks, journeys, saved hobbies
- [ ] Floating AI Coach on hobby detail pages (context-aware)
- [ ] Tutorial summarization UI
- [ ] Beginner win notifications ("You've practiced 3 days in a row")

### Firestore schema additions
```
users/{uid}/journeys/{hobbyId}/
  startedAt
  currentDay
  lastActivityAt
  streak
  completedDays[]
  milestones[]
```

### MCP integration — first MCP server
**User Progress MCP Server**

Tools: `get_user_hobbies`, `get_streak`, `get_journey_progress`

Without this: Coach gives generic advice.
With this: Coach says "You're on day 12 of your pottery journey — today's task is centring a larger ball of clay."

---

## Sprint 4 — Local Discovery

**Goal:** Real-world utility that's hard for competitors to copy.

### Scope
- [ ] Hobby Map — Google Maps + Places API
- [ ] Nearby classes, workshops, stores, clubs
- [ ] Hobby events feed
- [ ] Hobby compatibility matching — "find someone at your level nearby"
- [ ] Community Circles — groups by hobby + skill level + location

### Notes
- **UAE: Start with Abu Dhabi only** — nail local data quality before expanding to Dubai
- **India (Sprint 7): Start with Mumbai, Delhi, Bangalore only**
- Gate Community Circles behind minimum local user count — empty groups kill momentum

### MCP integration
**Google Places MCP Server**

Tools: `find_nearby_classes`, `find_hobby_stores`, `get_upcoming_events`

Enables the Coach to answer "find me a pottery class near me this weekend" with real Places API data.

---

## Sprint 5 — Mood-Based Recommendations

**Goal:** Make the AI feel like it actually knows the user.

### Scope
- [ ] Mood input → 2–3 contextual hobby suggestions
- [ ] Full hobby history + recent activity passed via Gemini's 256K context
- [ ] Surface contextually: after inactivity, on-demand from Coach, weekly check-in

### Mood mapping

| Mood | Suggestions |
|---|---|
| Stressed | Drawing, Yoga, Gardening |
| Social isolation | Group hobbies, Community Circles |
| High energy | Running, Cycling, Rock climbing |
| Low energy | Reading, Painting, Journaling |

### MCP integration
**Hobby Content MCP Server + Activity MCP Server**

Tools: `get_hobby_details`, `search_hobbies`, `get_recent_activity`

Enables data-driven mood recommendations instead of hardcoded mappings.

---

## Sprint 6 — Monetization

**Goal:** Revenue without breaking the experience.

> ⚠️ Do not activate until ~1,000 weekly active users.

### Scope
- [ ] Freemium gate — Coach + plans + advanced recs → premium; discovery → free
- [ ] Affiliate links on hobby detail pages (UAE: Amazon, Decathlon; India: Amazon India, Flipkart, Bajaao)
- [ ] Sponsored listings on map and events feed
- [ ] Stripe subscriptions for UAE users (monthly + annual)

### MCP integration
**E-commerce MCP Server**

Tools: `search_products`, `get_starter_kit`

Enables live product recommendations with real pricing instead of static affiliate links.

---

## Sprint 7 — Scale, Mobile & India

**Goal:** React Native app + India market launch.

### Scope

**Mobile app**
- [ ] React Native + Expo — reuse `shared/` package for types and Redux slices
- [ ] Push notifications — streak reminders, comeback challenges
- [ ] Offline mode — basic hobby plans without connectivity
- [ ] Social sharing — progress cards, milestone images

**India launch**
- [ ] i18n setup — `i18next` + `react-i18next`
- [ ] Hindi translations for all UI strings
- [ ] Hindi AI Coach — Gemini 2.0 Flash handles Hindi natively, update Cloud Function system prompt
- [ ] India-specific hobby catalog — Classical dance, Tabla, Yoga, Rangoli, Mehndi, Cricket
- [ ] Razorpay integration — UPI, cards, net banking
- [ ] INR pricing across hobby catalog and affiliate links
- [ ] India affiliate partners — Amazon India, Flipkart, Hobby Ideas, Itsy Bitsy, Bajaao
- [ ] Noto Sans Devanagari font for Hindi text
- [ ] India Google Places — Mumbai, Delhi, Bangalore first

**Analytics**
- [ ] Internal analytics dashboard
- [ ] Performance optimisation for traffic spikes

### India localization approach
```
locales/
├── en.json    ← "explorer.headline": "Find your perfect hobby"
└── hi.json    ← "explorer.headline": "अपना परफेक्ट शौक खोजें"
```

Hindi AI Coach system prompt addition:
```
Respond only in Hindi. Keep responses warm and conversational.
```

---

## MCP Integration Plan

> MCP (Model Context Protocol) lets the AI call real tools — database queries, API lookups, live data — instead of answering from training data only. This is the difference between a generic chatbot and a coach that actually knows you.

### Without MCP (current — Sprint 2)
```
User asks Coach → Gemini answers from training data → generic response
```

### With MCP (Sprint 3+)
```
User asks Coach → Gemini calls get_user_progress, find_nearby_classes
               → personalised, data-driven response
```

### Rollout by sprint

| Sprint | MCP Server | Tools | Unlocks |
|---|---|---|---|
| 3 | User Progress | `get_streak`, `get_journey_progress`, `get_user_hobbies` | Context-aware Coach |
| 4 | Google Places | `find_nearby_classes`, `find_hobby_stores`, `get_upcoming_events` | Location-aware Coach |
| 5 | Hobby Content + Activity | `get_hobby_details`, `search_hobbies`, `get_recent_activity` | Data-driven mood recs |
| 6 | E-commerce | `search_products`, `get_starter_kit` | Live affiliate recommendations |

### MCP vs. direct prompt injection

| Use MCP when | Use prompt injection when |
|---|---|
| Data is user-specific (streak, progress) | Context is static (hobby description) |
| Data is live (places, prices) | Context is already known (quiz answers) |
| Same data needed across multiple AI features | One-off context for a single feature |

---

## Long-Term Vision

Become the world's largest hobby ecosystem where users can discover, learn, buy, meet hobby partners, join communities, track progress, and receive AI guidance — all in one place.

**UAE → India → Global**

---

## Known Issues & Gotchas

### Google Sign-In popup blocked (COOP)
`signInWithPopup` triggers Cross-Origin-Opener-Policy errors in Chrome. Fixed with `signInWithRedirect` + `getRedirectResult`. Do not revert.

### `functions.runWith` is not a function
Deprecated v1 Functions API. Use v2 exclusively:
```js
const { onCall, HttpsError } = require('firebase-functions/v2/https');
exports.myFn = onCall({ secrets: ['GEMINI_API_KEY'] }, async (request) => { ... });
```

### Firestore rules compilation error: `mismatched input '{'`
Stray character at line 1 of `firestore.rules`. Fix: select all → delete → repaste fresh.

### Custom domain ACME challenge failed (404)
Old registrar A record (`216.198.79.1`) conflicted with Firebase's A record (`199.36.158.100`). Delete old A records from DNS provider, then re-verify in Firebase Console → Hosting.

### Legacy Express backend / MongoDB
Original HLD references Express + MongoDB + Mongoose. Superseded. Do not resurrect.

### Legacy micro-frontend scaffolding
`root-config`, `micro-frontends/hobbies`, `micro-frontends/auth` scripts exist in the repo. Ignore them. All work is in `web/`.

### Razorpay not yet integrated
Stripe is planned for Sprint 6 (UAE). Razorpay for India is Sprint 7. Do not add payment integrations earlier.

---

## Decision Log

| Date | Decision | Reasoning |
|---|---|---|
| 2026-06 | Firebase-native backend | Solo founder; minimise ops overhead; scales automatically |
| 2026-06 | Firebase Hosting over Vercel | One platform, one bill, one `firebase deploy` command |
| 2026-06 | Blaze plan | Required for Cloud Functions; free tier within Blaze covers MVP scale |
| 2026-06 | Gemini 2.0 Flash over Gemma 4 / OpenAI | Better JSON reliability for quiz; cost delta negligible at current scale |
| 2026-06 | No micro-frontends | Zero benefit for solo founder; single `web/` Vite app |
| 2026-06 | Cloud Functions v2 SDK | v1's `functions.runWith` broke deployment |
| 2026-06 | Web-first, React Native deferred to Sprint 7 | Ship and validate product before investing in native mobile |
| 2026-06 | MCP deferred to Sprint 3 | Sprint 2 Coach is simple enough for prompt injection; MCP pays off when multiple features share data sources |
| 2026-06 | UAE-first, India Sprint 7 | Two markets with 2 people splits focus; UAE validates product before India scale |
| 2026-06 | Razorpay for India (not Stripe) | Stripe has limited India support; Razorpay supports UPI, cards, net banking natively |
| 2026-06 | Hindi deferred to Sprint 7 | UAE primary market is English-first; Hindi adds 3–4 weeks effort best spent on core product |
| 2026-06 | Artisan design theme locked | Warm Cream + Terracotta + Olive — distinctive, premium, warm; chosen after evaluating 9 palette options |

---

*Update the Sprint Status table at the start and end of every sprint. Keep `.cursorrules` Active Sprint block in sync with this file.*