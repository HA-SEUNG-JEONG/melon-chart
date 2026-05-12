import { getChartRank } from "@/lib/melon";
import { redis } from "@/lib/redis";
import { getWebPush } from "@/lib/push";

export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let current: number | null;
  try {
    current = await getChartRank();
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 502 });
  }

  const prev = await redis.get<number | null>("melon:current_rank");

  await Promise.all([
    redis.set("melon:current_rank", current),
    redis.lpush("melon:history", JSON.stringify({ timestamp: Date.now(), rank: current })),
    redis.ltrim("melon:history", 0, 167),
  ]);

  if (prev !== current) {
    const subs = await redis.smembers<string[]>("melon:subscriptions");
    if (subs.length > 0) {
      const { title, body } = buildNotification(prev as number | null, current);
      await Promise.allSettled(
        subs.map((raw) => {
          try {
            const sub = JSON.parse(raw as string);
            return getWebPush().sendNotification(sub, JSON.stringify({ title, body }));
          } catch {
            return Promise.resolve();
          }
        }),
      );
    }
  }

  return Response.json({ rank: current, prev, changed: prev !== current });
}

function buildNotification(
  prev: number | null,
  current: number | null,
): { title: string; body: string } {
  if (prev === null && current !== null) {
    return { title: "🎵 Heavy Serenade", body: `TOP100 진입! ${current}위` };
  }
  if (prev !== null && current === null) {
    return { title: "Heavy Serenade 📉", body: `TOP100 탈락 (이전: ${prev}위)` };
  }
  if (prev !== null && current !== null) {
    const dir = current < prev ? "⬆️" : "⬇️";
    return { title: `${dir} Heavy Serenade`, body: `${prev}위 → ${current}위` };
  }
  return { title: "Heavy Serenade", body: "순위 변동" };
}
