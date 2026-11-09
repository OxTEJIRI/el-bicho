# El Bicho

**Relive every Ronaldo goal. Call the next one. Count down to 1,000 together.**

El Bicho is a fan app for Cristiano Ronaldo's road to 1,000 career goals. It remembers what each fan loves about his career, using **Walrus Memory on mainnet**. Every call a fan makes is stamped with a real **Sui checkpoint, read through Tatum**.

Built for the [Walrus × Tatum "Total Recall" hackathon](https://tatum.io/hackathon/total-recall), **Track 1: Markets & Sports Prediction**.

## What it does

| Screen | What happens |
|---|---|
| **Home** | A live 985 / 1,000 counter. The 15 goals still to come are slots 986–1000, with the next one pulsing. Picks are reordered by your learned taste. |
| **Relive** | His greatest moments. React (Unreal, SIUUU, Tears) or add "where were you?" memories. |
| **Call it** | Before a match, call whether he scores, how, and when. The call is saved to your Walrus memory and stamped with the latest Sui checkpoint, read through Tatum's Sui gRPC gateway. |
| **Road to 1,000** | Goals by shirt, milestones, and the goal-1,000 forecast. |

Three kit themes are switchable in one tap: **Red (Portugal, default)**, **White (Real Madrid)** and **Gold (Al Nassr)**. Each one swaps in a matching photo.

## How it uses Walrus Memory

- Each fan has their own namespace (`elbicho-fan-<id>`) on Walrus Memory mainnet, through the Walrus Foundation managed relayer.
- **Reactions** are written as memory lines: `REACTION · moment=<id> · reaction=<name> · tags=<…>`.
- **Calls** are written as: `CALL · match=<…> · scores · how=<…> · when=<…> · locked_at_checkpoint=<n> · checkpoint_time=<iso>`.
- **Learning:** after every reaction, El Bicho recalls your reaction memories, turns them into a taste profile (for example "Overhead goals. Big nights. The Madrid era."), and reorders your picks. The memory visibly changes the product.

Code: [`src/lib/memory.ts`](src/lib/memory.ts), [`src/lib/taste.ts`](src/lib/taste.ts), [`src/app/api`](src/app/api).

## How it uses Tatum

Tatum's Sui JSON-RPC endpoint returns 404 for `sui_*` methods, so El Bicho talks to Sui mainnet over **native gRPC** at `sui-mainnet-grpc.gateway.tatum.io:443`, with the API key sent as `x-api-key` metadata (`@mysten/sui` `SuiGrpcClient` + `@protobuf-ts/grpc-transport`).

Every call reads the **latest Sui checkpoint** (sequence number, digest, timestamp) and stores it with the call, so each call is tied to a public point in Sui's history. The receipt links to the checkpoint on Suiscan.

Code: [`src/lib/sui.ts`](src/lib/sui.ts).

## Run it

Requires Node 22+.

```bash
npm install
cp .env.example .env   # fill in your Tatum and Walrus Memory values
npm run build && npm start
```

`.env` needs these values:
- `TATUM_API_KEY` and `TATUM_ACCOUNT_ID`, from dashboard.tatum.io.
- `MEMWAL_PRIVATE_KEY`, `MEMWAL_ACCOUNT_ID` and `MEMWAL_AGENT_ID`, from memory.walrus.xyz/dashboard.
- `SUI_ADDRESS`.
- `MEMWAL_SERVER_URL`.

## Data and credits

- **Goal count:** 985 career goals, per the ESPN goal tracker (2026).
- **Goals by shirt:** Real Madrid 450, Manchester United 145, Juventus 101 and Sporting CP 5 are published career figures. Portugal and Al Nassr show "—" until verified.
- **Photos:** Wikimedia Commons, used under their licences:
  - Portugal: "Cristiano Ronaldo 2018.jpg" by Анна Нэсси, CC BY-SA 3.0.
  - Real Madrid: "Cristiano Ronaldo Madrid.jpg" by KANO PHOTO, CC BY-SA 2.0.
  - Al Nassr: "Cristiano Ronaldo with Al Nassr, 19 September 2023 - 83.jpg" by Mehrdad Esfahani / Mehr News.

El Bicho is a fan-made project. It isn't affiliated with Cristiano Ronaldo, his clubs, or the leagues.

## License

Code: MIT. Photos keep their own licences, listed above.
