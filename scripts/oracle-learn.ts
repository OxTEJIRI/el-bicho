// Writes the Oracle's own lessons to Walrus Memory (mainnet), from a walk-forward backtest.
// Run once: npx tsx scripts/oracle-learn.ts   (needs .env loaded: node --env-file=.env)
import { MemWal } from '@mysten-incubation/memwal';
import { MATCHES, backtest, forecast1000, reasons } from '../src/lib/oracle';

const NS = 'elbicho-oracle';
const m = MemWal.create({
  key: process.env.MEMWAL_PRIVATE_KEY!,
  accountId: process.env.MEMWAL_ACCOUNT_ID!,
  serverUrl: process.env.MEMWAL_SERVER_URL || 'https://relayer.memory.walrus.xyz',
  namespace: NS,
});

const b = backtest();
const f = forecast1000(15);
const asof = MATCHES[MATCHES.length - 1].date;
const f3 = (n: number) => n.toFixed(3);
const lines: string[] = [
  `ORACLE · calibration · asof=${asof} · shrink=${b.shrink} · trained_on=${b.trainMatches} matches · tested_on=${b.testMatches} later matches · brier_coin=${f3(b.test.brierCoin)} · brier_raw=${f3(b.test.brierRaw)} · brier_learned=${f3(b.test.brierLearned)} · lesson="Raw forecasts were overconfident, worse than a coin flip. Pull them toward 50/50 by a factor of ${b.shrink}."`,
  ...b.worstMiss.map((w) => `ORACLE · lesson · date=${w.date} · opponent=${w.opponent} · forecast=${Math.round(w.p * 100)}% to score · outcome=${w.scored ? 'scored' : 'blanked'} · lesson="A hot streak did not carry into this match. Do not trust recent form alone."`),
  `ORACLE · forecast · asof=${asof} · goals_to_go=15 · goals_per_match=${f.goalsPerMatch.toFixed(2)} · club_matches_per_week=${f.matchesPerWeek.toFixed(2)} · goal_1000_range=${f.p10} to ${f.p90} · median=${f.p50}`,
  `ORACLE · form · asof=${asof} · ${reasons().join(' ')}`,
];

async function main() {
  console.log(lines.length, 'memories to write');
  for (const [i, text] of lines.entries()) {
    const job = await m.remember(text, NS);
    const done = await m.waitForRememberJob(job.job_id);
    console.log(i + 1, 'written', done.blob_id);
  }
  console.log('done');
}
main().catch((e) => { console.error('FAILED', String(e.message || e).slice(0, 300)); process.exit(1); });
