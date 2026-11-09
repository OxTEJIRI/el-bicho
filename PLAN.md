# El Bicho: build plan

An unofficial fan app for Cristiano Ronaldo. Relive his greatest moments, and follow the Road to 1,000 goals with a memory that learns *you*.
Entry for **Walrus x Tatum "Total Recall"**, Track 1 (Markets & Sports Prediction). It also aims at **Best Walrus Memory**, and at **Best Agent Payments** through a stretch feature (F12).
Deadline: **Nov 10 2026, 17:00 UTC**. Internal target: submit by **12:00 UTC** to leave a buffer.

---

## 1. The one-line story
*"El Bicho remembers every goal Ronaldo ever scored, and everything you love about them. Relive his career your way, call his next goal before kickoff, and watch the countdown to 1,000."*

Where the memory does real work (this is what the judges look for):
- **It learns your taste.** It reads your reactions and memories and reorders your Relive feed, "On this day" and the "Your Ronaldo" profile.
- **It learns who calls it right.** It scores every fan's pre-match calls, and its own calls too, and remembers the results.
- **It learns his form.** Each new goal updates its goal memory and the forecast for the date of goal 1,000.
- **It learns its own accuracy.** It remembers how well its forecasts did, then adjusts how confident it sounds.

## 2. Facts to build on (checked Nov 9 2026)
- His career total is **985 official goals** after a hat-trick vs Al Kholood (ESPN tracker). The app uses **985** as the single count, so there are 15 to go. (Decision on Nov 9: no disputed-goals ledger.)
- He's currently out of the Portugal squad, so Al Nassr (Saudi Pro League) is his only source of goals for now. Mid-November is an international break, so there's **probably no live match before our deadline**. The demo leans on the history replay; live calls start at his next Al Nassr match.
- There's no free official API for his goals. Sources:
  - Wikipedia's goal-by-goal career list (CC BY-SA, so give attribution).
  - The ESPN tracker for recent goals.
  - Manual entry by the admin for new goals and fixtures. That's fine for a fan app.
- Media: **embed only.** Use official YouTube or TikTok highlight posts (leagues, clubs, broadcasters). Never host match clips or press photos. Fans may upload **their own** photos only.
- Branding: show an "Unofficial fan project" notice. No club or league logos, and no photos of Ronaldo we don't own.

## 3. Features

### Core (ship by the deadline)
| # | Feature | What it does | Memory / chain role |
|---|---|---|---|
| F1 | **Relive feed** | About 25 curated top moments (bicycle kick vs Juventus, the 2018 hat-trick vs Spain, Champions League finals, Euro 2016, the World Cup knockout goal vs Croatia…), each an official YouTube or TikTok embed plus a short stats card | Seed content lives in the repo |
| F2 | **Reactions** | One-tap reactions: 🔥 GOAT, 😮 Unreal, 😢 Tears, **SIUUU** | Each reaction updates your taste memory |
| F3 | **Fan memories** | "Where were you?": text, voice note or your own photo attached to a moment | Saved to Walrus Memory (mainnet), cited later |
| F4 | **Your Ronaldo** | A learned profile: "You're a Madrid-era, big-night, free-kick fan", with evidence | Rebuilt from memory recall; it visibly changes as you react |
| F5 | **On this day** | Today's best match from his history, picked for *your* taste | Recall ranked by taste memory |
| F6 | **Road to 1,000 tracker** | Live counter: 985/1,000. Splits by club, competition and goal type (head, left, right, penalty, free kick). | Goal records come from the data file, and new goals are written as memories |
| F7 | **Call it** | Before each match, fans log a call: scores yes or no, how (header, penalty…), which half. Calls lock at kickoff | Each call is a memory, timestamped on Sui (see §5) and read back through Tatum |
| F8 | **The Oracle (El Bicho's own call)** | El Bicho calls each match from his history in similar fixtures (opponent strength, home or away, competition, recent form), with reasons | Its past accuracy is remembered and adjusts its confidence |
| F9 | **Goal 1,000 date forecast** | "Most likely: early March 2027 (range Feb–Apr)", updated after every match. A chart shows the forecast narrowing over time | Each update is saved as a memory, and the history is the learning curve |
| F10 | **Callers leaderboard** | Which fans called his goals right, by type | Results kept in memory |

### Cool extras (after the core; pick by time)
| # | Feature | Why it's cool |
|---|---|---|
| F11 | **Ask El Bicho** (chat; voice later) | "How many headers vs Atlético?", "What was I doing when he scored the bicycle kick?" Answers come from his goal memory *and your memories*, with citations. Your own memories carry over to any AI tool through the Walrus Memory plugin (Claude, Cursor) |
| F12 | **El Bicho stats API, paid per call (MPP)** | Other bots and agents can query El Bicho's goal memory for $0.001 USDC per call, gaslessly on Sui (`@suimpp/mpp`), with each payment checked through Tatum. This qualifies for **Best Agent Payments** |
| F13 | **"I called it" badge** | When goal 1,000 lands, everyone who called the right match gets a Sui collectible, a permanent proof that they called it |
| F14 | **The 1,000 Wall** | Fans leave a message for Ronaldo, revealed in one cinematic moment when he scores goal 1,000 |
| F15 | **Shareable cards** | "My Ronaldo DNA", "I called goal #993", "985/1,000" countdown cards, sized for X and WhatsApp status |
| F16 | **Eras timeline** | Sporting → United → Madrid → Juventus → United → Al Nassr + Portugal, with your memories pinned on the timeline |
| F17 | **What-if replay** | Replays history to show what El Bicho would have forecast for goals 900, 950 and 985 compared with when they actually came. This is honest evidence that its forecasting learns |

## 4. Architecture
- **App:** Next.js (App Router) + TypeScript, deployed on Vercel. Mobile-first, because fans are on phones. Dark stadium style with Ronaldo-red and gold accents, all original styling.
- **Data:**
  - `data/goals.json`: one row per goal, with id, date, club or country, opponent, competition, minute, type, home or away, and a disputed flag.
  - `data/moments.json`: the curated moments and their embed URLs.
  - `data/fixtures.json`: upcoming matches, entered by the admin.
- **Walrus Memory (mainnet, managed relayer):** SDK `@mysten-incubation/memwal`. Namespaces:
  - `fan:<id>`: reactions, fan memories, taste profile lines.
  - `calls:<matchId>`: fan calls and El Bicho's call.
  - `oracle`: forecast history, accuracy, lessons.
  - `goals:new`: each new goal as it happens.
- **App store:** a small Postgres (Neon free tier) or Vercel KV for counters, leaderboards and the fan ID ↔ wallet link. Walrus holds what the app learns; the database does the arithmetic.
- **Fans:** sign in with a handle by default (no wallet needed). Optionally connect a Sui wallet (Slush via dapp-kit), needed for the F13 badges.
- **Tatum Sui RPC (gRPC + JSON-RPC):**
  1. Read back the Sui timestamp of each call to prove it was made before kickoff.
  2. Check every MPP payment in F12.
  3. Look up badge ownership for F13.
  4. Read wallet SuiNS names for display.
- **LLM for Ask El Bicho (F11):** use a free-tier key if you have one. Otherwise, F11 answers with structured templates over recalled memories (no LLM needed).

## 5. Proving calls were made before kickoff
Plan A: each call is written as a Walrus Memory before kickoff. The Walrus blob is a Sui object, so its creation checkpoint time (read through Tatum) proves when the call existed. **Verify on day 1** that the relayer's write result gives us a blob ID we can trace to an on-chain object.
Plan B: at kickoff the app hashes all calls into one Merkle root and posts it on-chain with a tiny Move `anchor` package (costs fractions of a cent in SUI). The "verify" page re-checks it through Tatum.

## 6. Build order (from approval to submission)
**Phase 0, setup (you, about 30 min, at the start):**
- A Tatum account and API key (free), plus the account ID from the dashboard.
- A Walrus Memory account at memory.walrus.xyz with a delegate key. Save the Account ID, the delegate private key and the public key (MEMWAL_AGENT_ID).
- Your Sui address. Fund an app wallet with about 1 SUI, only if Plan B is needed.
- GitHub (OxTEJIRI) and Vercel logins.
- Optional: a free LLM API key for F11.

**Phase 1, foundation (me, about 4 h):**
- Repo scaffold, data files (goal list + about 25 curated moments with verified official embed links), and the Walrus Memory client.
- Tatum client. Verify the Plan A blob trace.
- First 10+ memories on mainnet (the hackathon requires at least 10).

**Phase 2, core features (about 8 h):** F1–F10, the Tatum verify page and the disputed goals ledger.

**Phase 3, learning evidence (about 3 h):** F17 what-if replay and the F9 forecast chart. A "What El Bicho learned" panel showing what was added or changed in memory and why.

**Phase 4, deploy + polish (about 3 h):** Vercel deploy, mobile check, README with architecture and the memory design, honest notes on what's simulated.

**Phase 5, extras by time:** F11 → F12 (Agent Payments) → F15 → F13/F14 (these can finish after the hackathon).

**Phase 6, submission package (about 4 h, by Nov 10 12:00 UTC):**
- **Blog post (required):** what El Bicho does, how it uses Tatum and Walrus, and how it learned over time.
- **2–3 min demo video:** your fan story, then react → feed changes → call it → forecast → verify on Sui.
- **X post:** tag @Tatum_io and @WalrusFoundation for bonus points, plus a LinkedIn post.
- **Fill the form.** Track 1 must be named in the description, since the form has no track field. The blog URL goes in "Additional documentation". The form also needs your MEMWAL_AGENT_ID and Sui address.

## 7. Risks
| Risk | Plan |
|---|---|
| No live match before the deadline | The demo uses the replay (F17) plus an open call for his next Al Nassr fixture. Be honest about it in the blog and video |
| An embedded video gets removed or blocked | Prefer official channels. Check each embed. Fall back to a stats card plus a link |
| Walrus relayer downtime (one outage on Oct 30–31) | Write memories early and cache locally, with a retry queue |
| Rights / impersonation | "Unofficial fan project" banner. Embeds only, fans' own photos only, no logos |
| Time | Core first (F1–F10). Everything else is optional |

## 7b. Scope decision (Nov 9)
All features F1-F17 are in scope, not just the core set. Build order stays core-first, but nothing is cut.

## 7c. UI/UX design (decided Nov 9)

**Concept: "Matchday".** A dark stadium-at-night feel on mobile (fans are on phones). Big numbers, fast taps, instant reactions.

**Themes** (CSS variables, switchable in one tap, **default Red**):
| Theme | Accent | Highlight | Background |
|---|---|---|---|
| Red (default) | #E4261B | #FFD84A | near-black red-tinted |
| Gold | #FFD100 | white | deep navy |
| White | #B8891A gold | #C8102E | warm off-white (the only light theme) |
| Black and white | white | grey | black |
| Green | #00A650 | white | near-black green-tinted |
The chosen theme is saved as a memory in the fan's Walrus profile, so it follows them across devices. Colours only: no club logos.

**Background art:** a bold, stylised **silhouette** (arms-out celebration pose, no face) in the theme accent at about 15% opacity, over floodlight beams. No photos, and no photorealistic or AI-generated likeness of him (see rights notes). A plain "7" may appear as typography; avoid the CR7 logo.

**Navigation:** bottom tab bar with five tabs: Relive, Road, Call, Ask, You.

**Screens:**
1. **Home:** giant 985/1,000 counter, progress bar, "15 to go", date forecast, next-match card with countdown and a "Call it" button, plus an "On this day, picked for you" card with reaction buttons.
2. **Relive:** a TikTok-style vertical, snap-scrolling feed of moments (official embeds). Reactions: Unreal, SIUUU, Tears, Remember (add your memory). A "Learned about you" ribbon appears after a few reactions.
3. **Road:** goal tracker, splits by club, competition and type, the forecast chart narrowing, the What-if replay, and the eras timeline.
4. **Call:** pre-match call form (scores? how? which half?) that locks at kickoff, El Bicho's own Oracle call with its reasons, a "Verified on Sui" receipt, and the callers leaderboard.
5. **Ask:** chat with El Bicho, with citations to the goals and memories it used.
6. **You:** "Your Ronaldo" taste profile, fan XP and rank, streak, badges, share cards, the theme picker, and memory export/portability.

**Engagement loops:**
- **Matchday streak:** open the app or log a call on consecutive match days.
- **Fan ranks:** Academy, Reserves, First team, Captain, Legend, earned from reactions, memories and correct calls.
- **Instant feedback:** a reaction burst animation and a one-line "El Bicho learned..." message, so the memory is visible every time.
- **Share cards** after calls and milestones, built for X and WhatsApp.
- **Goal 1,000 moment:** a full-screen takeover with the fans' messages scrolling and the badge claim.
- Sound is **off by default**, and there's no copyrighted audio.

**Accessibility:** contrast checked on every theme, reduced-motion respected, large tap targets, and captions on voice features.

## 7d. Design update (Nov 9, v2, on the Claude Design canvas)
Canvas: https://claude.ai/artifact/7pRhpLa9WEjfddS7i6Bi94. Seven boards:
- Mobile: Home (live theme switch), Relive, Call it (working call form), Ask, You (kit picker).
- Desktop: Home (fluid; columns stack at phone width).
- Mobile: Goal 1,000 takeover.

Decisions:
- **Themes = kits:**
  - **Red / Portugal (default)**, photo "Cristiano Ronaldo 2018.jpg" by Анна Нэсси, CC BY-SA 3.0.
  - **White / Real Madrid**, photo "Cristiano Ronaldo Madrid.jpg" by KANO PHOTO, CC BY-SA 2.0.
  - **Gold / Al Nassr**, photo "Cristiano Ronaldo with Al Nassr, 19 September 2023 - 83.jpg" by Mehrdad Esfahani / Mehr News, attribution licence. That's the navy-and-gold kit: Wikimedia has no freely licensed photo in the yellow home kit.
- All photos come from Wikimedia Commons. The required photo credit shows in small print.
- The "Unofficial fan project" badge is removed at the user's request.
- Type: Anton for display numbers and titles, Inter for UI.
- Bracketed values like [opponent], [date] and [x] are real-data slots to fill.
- Local copies: `el-bicho/design/assets/`. Canvas source: `el-bicho/design/canvas/project/`.

## 8. Decisions needed from you
1. Approve this plan, or change the feature list.
2. Your personal Ronaldo story for the blog and video: your favourite moment and where you watched it. Real stories are what Walrus amplifies.
3. Do you have an LLM API key for F11?
4. Will you do the voiceover yourself, or should I generate one (Kokoro)?
