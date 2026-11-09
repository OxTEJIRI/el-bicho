import 'server-only';
import { MemWal } from '@mysten-incubation/memwal';

// Walrus Memory on mainnet, through the Walrus Foundation managed relayer.
// Each fan gets their own namespace, so recall never mixes fans.

let client: MemWal | null = null;

function memwal(): MemWal {
  if (client) return client;
  const key = process.env.MEMWAL_PRIVATE_KEY;
  const accountId = process.env.MEMWAL_ACCOUNT_ID;
  if (!key || !accountId) throw new Error('Walrus Memory is not configured');
  client = MemWal.create({
    key,
    accountId,
    serverUrl: process.env.MEMWAL_SERVER_URL || 'https://relayer.memory.walrus.xyz',
    namespace: 'elbicho',
  });
  return client;
}

export function fanNamespace(fanId: string) {
  return 'elbicho-fan-' + fanId.replace(/[^a-z0-9-]/gi, '').slice(0, 40);
}

export async function remember(text: string, namespace: string) {
  const m = memwal();
  const job = await m.remember(text, namespace);
  const done = await m.waitForRememberJob(job.job_id);
  return { blobId: done.blob_id, namespace };
}

export async function recall(query: string, namespace: string, limit = 8) {
  const res = await memwal().recall({ query, limit, namespace });
  return res.results.map((r) => ({ text: r.text, blobId: r.blob_id }));
}
