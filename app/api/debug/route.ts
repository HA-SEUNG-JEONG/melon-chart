import * as cheerio from "cheerio";

const MELON_URL = "https://www.melon.com/chart/index.htm";
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Referer": "https://www.melon.com",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "ko-KR,ko;q=0.9",
};

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(MELON_URL, { headers: HEADERS, cache: "no-store" });
  const html = await res.text();
  const $ = cheerio.load(html);

  const rows = $("tr.lst50, tr.lst100").toArray();
  const top10 = rows.slice(0, 10).map((row) => {
    const title = $(row).find(".ellipsis.rank01 span a").text().trim();
    const rank = $(row).find(".rank").first().text().trim();
    return { rank, title };
  });

  const target = rows.reduce<{ rank: string; title: string } | null>((found, row) => {
    if (found) return found;
    const title = $(row).find(".ellipsis.rank01 span a").text().trim();
    const rank = $(row).find(".rank").first().text().trim();
    if (title.includes("Heavy Serenade")) return { rank, title };
    return null;
  }, null);

  return Response.json({
    status: res.status,
    rowCount: rows.length,
    heavySerenade: target ?? "NOT IN TOP100",
    top10,
  });
}
