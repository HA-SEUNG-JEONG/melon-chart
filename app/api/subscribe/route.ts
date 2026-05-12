import { redis } from "@/lib/redis";

export const runtime = "edge";

export async function POST(req: Request) {
  const subscription = await req.json();
  await redis.sadd("melon:subscriptions", JSON.stringify(subscription));
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const subscription = await req.json();
  await redis.srem("melon:subscriptions", JSON.stringify(subscription));
  return Response.json({ ok: true });
}
