import 'server-only';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { GrpcTransport } from '@protobuf-ts/grpc-transport';
import { ChannelCredentials } from '@grpc/grpc-js';

// Sui mainnet through Tatum's gRPC gateway. Tatum's Sui JSON-RPC endpoint returns 404,
// so everything goes over native gRPC with the API key as request metadata.

const HOST = 'sui-mainnet-grpc.gateway.tatum.io:443';
let client: SuiGrpcClient | null = null;

function sui(): SuiGrpcClient {
  if (client) return client;
  const key = process.env.TATUM_API_KEY;
  if (!key) throw new Error('Tatum is not configured');
  const transport = new GrpcTransport({
    host: HOST,
    channelCredentials: ChannelCredentials.createSsl(),
    meta: { 'x-api-key': key },
  });
  client = new SuiGrpcClient({ network: 'mainnet', transport });
  return client;
}

function withTimeout<T>(p: Promise<T>, ms = 15000): Promise<T> {
  return Promise.race([p, new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Sui request timed out')), ms))]);
}

export type Checkpoint = { sequence: string; digest: string; time: string };

export async function latestCheckpoint(): Promise<Checkpoint> {
  const call = sui().ledgerService.getCheckpoint({
    checkpointId: { oneofKind: undefined },
    readMask: { paths: ['sequence_number', 'digest', 'summary.timestamp'] },
  });
  const response = await withTimeout(call.response);
  const cp = response.checkpoint;
  const seconds = Number(cp?.summary?.timestamp?.seconds ?? 0);
  return {
    sequence: String(cp?.sequenceNumber ?? ''),
    digest: cp?.digest ?? '',
    time: new Date(seconds * 1000).toISOString(),
  };
}
