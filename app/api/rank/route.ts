import { redis } from "@/lib/redis";

export const runtime = "edge";

export async function GET() {
  const [rank, historyRaw] = await Promise.all([
    redis.get<number | null>("melon:current_rank"),
    redis.lrange<string>("melon:history", 0, 47),
  ]);

  const history = (historyRaw as string[]).map((h) => {
    try {
      return JSON.parse(h) as { timestamp: number; rank: number | null };
    } catch {
      return null;
    }
  }).filter(Boolean);

  return Response.json({ rank, history });
}
