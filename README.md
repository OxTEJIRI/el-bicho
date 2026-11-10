# El Bicho

**Relive every Ronaldo goal. Call the next one. Count down to 1,000 together.**

El Bicho is a fan app for Cristiano Ronaldo's road to 1,000 career goals. It remembers what each fan loves about his career using **Walrus Memory on mainnet**, and every call a fan makes is stamped with a real **Sui checkpoint read through Tatum**.

Live: **https://el-bicho-cr7.vercel.app** · Built for the [Walrus × Tatum "Total Recall" hackathon](https://tatum.io/hackathon/total-recall), **Track 1: Markets & Sports Prediction**.

## What it does

| Screen | What happens |
|---|---|
| **Home** | Live 985 / 1,000 counter. The 15 goals still to come are slots 986 to 1000, with the next one pulsing. The Oracle's call, your learned taste, and picks reordered for you. |
| **Relive** | A full-screen, swipeable feed of 31 vertical YouTube Shorts and fan edits. React with sound (Wow, Siuuu, Awww) or add a "where were you?" memory. Every reaction teaches El Bicho your taste. |
| **Call it** | Call whether he scores, how, and when. The call is saved to your Walrus memory and stamped with the latest Sui checkpoint read through Tatum's gRPC gateway. |
| **The Oracle** | El Bicho's own call before each match. It recalls its own calibration lesson from Walrus before it speaks. |
| **Road to 1,000** | Goals by shirt, the goal-1,000 date forecast, and a replay of 81 matches the Oracle had not seen. |
| **Ask El Bicho** | A Q&A that answers only from sources it can name, and says so when it cannot answer. |
| **The 1,000 Wall** | Fans leave a message for him. Messages are sealed in Walrus memory until goal 1,000; only the count is public. |
| **The crowd** | What other fans called for the next match, read back from Walrus. |
| **Share card** | A 9:16 "I called it" card with the Sui checkpoint, ready for X or WhatsApp. |
| **Welcome quiz** | 30 seconds: which Ronaldo is yours. Saved as a profile memory that counts double in your taste. |
| **You** | Your rank (Academy to Captain), taste, calls with checkpoint links, and kit picker. |

Three kit themes, one tap each: **Red (Portugal, default)**, **White (Real Madrid)**, **Gold (Al Nassr)**. Each swaps in a matching photo. Mobile and desktop layouts.

## How it uses Walrus Memory

Walrus Memory (mainnet, through the Walrus Foundation managed relayer) is where the app learns.

- **Per-fan memory:** each fan has their own namespace `elbicho-fan-<id>`: reactions (`REACTION · moment=… · reaction=… · tags=…`), calls (`CALL · match=… · scores · how=… · when=… · locked_at_checkpoint=…`) and the quiz profile (`PROFILE · eras=… · kinds=… · tags=…`).
- **Taste learning:** after every reaction El Bicho recalls your memories, turns them into a profile ("Overhead goals. Big nights. The Madrid era.") and reorders the Relive feed and Home picks. Quiz answers count double.
- **The Oracle's memory:** the Oracle's lessons live in `elbicho-oracle`. Before every call it recalls its latest calibration memory and applies it. If memory is unreachable it falls back to the raw forecast and says so on screen.
- **Shared namespaces:** `elbicho-calls` (public copies of locked calls, for the crowd board) and `elbicho-wall` (sealed messages).
- **Ask El Bicho** recalls your own memories to answer "what's my taste" and "what did I react to".

Code: [`src/lib/memory.ts`](src/lib/memory.ts), [`src/lib/taste.ts`](src/lib/taste.ts), [`src/lib/oracle-live.ts`](src/lib/oracle-live.ts), [`src/lib/ask.ts`](src/lib/ask.ts), [`src/app/api`](src/app/api).

## How it uses Tatum

Tatum's Sui JSON-RPC endpoint returns 404 for `sui_*` methods, so El Bicho talks to Sui mainnet over **native gRPC** at `sui-mainnet-grpc.gateway.tatum.io:443`, with the API key sent as `x-api-key` metadata (`@mysten/sui` `SuiGrpcClient` + `@protobuf-ts/grpc-transport`). This runs on the server only.

Every call reads the **latest Sui checkpoint** (sequence number, digest, timestamp) and stores it with the call, so each call is tied to a public point in Sui's history. The receipt, the share card and the You page link to the checkpoint on Suiscan.

Code: [`src/lib/sui.ts`](src/lib/sui.ts).

## The Oracle, and what it honestly learned

The Oracle forecasts whether he scores in his next match from his last 12 and 60 matches (and home or away form), then pulls that forecast toward 50/50 by a **shrink factor it learned and keeps in Walrus Memory**.

**Walk-forward test:** it learned from his first 99 matches, then forecast the next 81 using only games played before each one. Error score (Brier, lower is better):

| | Brier |
|---|---|
| A coin flip (always 50%) | 0.250 |
| Oracle with no memory | 0.256 |
| **Oracle with its memory** | **0.248** |

It is right on 52% of matches. **Scoring is close to a coin flip, and the memory helps only a little.** Its one lesson, that its raw forecasts were overconfident (shrink 0.3), turns a forecast slightly worse than a coin flip into one slightly better. We publish that rather than hide it.

The goal-1,000 forecast is a Monte Carlo over his last 25 Al Nassr games and recent fixture spacing: median **May 2027**, range Feb to Oct 2027. It assumes he plays for Al Nassr only.

Code: [`src/lib/oracle.ts`](src/lib/oracle.ts), [`scripts/oracle-learn.ts`](scripts/oracle-learn.ts).

## Data, and its limits

- **Career goals:** 985 official (ESPN goal tracker, 2026).
- **By shirt:** Real Madrid 450, Manchester United 145, Juventus 101, Sporting CP 5 (published career figures); Portugal 146. **Al Nassr is still counting**, so it is derived: 985 minus the other five, currently 138, and it moves with every goal.
- **Match log:** ESPN's public game log, 210 matches from June 2022 to October 2026 (`data/matches.json`, built by `scripts/build-matches.py`). **The log is incomplete.** Counting backwards from 985 puts goal 900 on 22 Aug 2024, but the real date was 5 Sep 2024. So it is used only for **scoring rates**, never to number goals, and the app never claims it knows which goal is which.
- **Ask El Bicho cannot split goals by type** (headers, free kicks) because the log records goals per match, not per goal. It says so instead of guessing.
- **Videos:** vertical YouTube Shorts and edits, played through YouTube's own IFrame player, one at a time. YouTube's oEmbed lookup says a video is embeddable even when the uploader has switched embedding off (error 150), so oEmbed is not enough. The feed therefore also **skips any video that refuses to play in the viewer's browser**. Uploaders are credited on the Credits page. Checker: [`scripts/check-videos.py`](scripts/check-videos.py).
- **Sounds:** the Wow, Siuuu, Awww and memory-chime reaction sounds were generated with Kokoro-82M (text-to-speech) and a synthesised chime ([`scripts/make-sounds.py`](scripts/make-sounds.py)). They are imitations, not recordings of anyone.
- **Photos:** Wikimedia Commons, used under their licences:
  - Portugal: "Cristiano Ronaldo 2018.jpg" by Анна Нэсси, CC BY-SA 3.0.
  - Real Madrid: "Cristiano Ronaldo Madrid.jpg" by KANO PHOTO, CC BY-SA 2.0.
  - Al Nassr: "Cristiano Ronaldo with Al Nassr, 19 September 2023 - 83.jpg" by Mehrdad Esfahani / Mehr News.

## Not built

- The paid stats API (x402/MPP agent payments), and a Sui collectible "I called it" badge. Both need a funded wallet and contract work.
- Scoring of fan calls. Results are scored after his next fixture is played, which falls after the hackathon deadline.

## Run it

Requires Node 22+.

```bash
npm install
cp .env.example .env   # fill in your Tatum and Walrus Memory values
npm run build && npm start
```

`.env` needs: `TATUM_API_KEY`, `TATUM_ACCOUNT_ID` (dashboard.tatum.io); `MEMWAL_PRIVATE_KEY`, `MEMWAL_ACCOUNT_ID`, `MEMWAL_AGENT_ID` (memory.walrus.xyz/dashboard); `SUI_ADDRESS`; `MEMWAL_SERVER_URL`.

## Disclaimer

El Bicho is a fan-made project. It isn't affiliated with Cristiano Ronaldo, his clubs, or the leagues.

## License

Code: MIT. Photos keep their own licences, listed above.
