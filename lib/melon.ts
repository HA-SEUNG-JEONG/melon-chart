import * as cheerio from "cheerio";

const SONG = "Heavy Serenade";
const MELON_URL = "https://www.melon.com/chart/index.htm";
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Referer": "https://www.melon.com",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "ko-KR,ko;q=0.9",
};

export async function getChartRank(): Promise<number | null> {
  const res = await fetch(MELON_URL, { headers: HEADERS, cache: "no-store" });
  if (!res.ok) throw new Error(`Melon HTTP ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  for (const row of $("tr.lst50, tr.lst100").toArray()) {
    const titleEl = $(row).find(".ellipsis.rank01 span a");
    const rankEl = $(row).find(".rank").first();
    if (titleEl.text().includes(SONG)) {
      const rankText = rankEl.text().trim();
      const rank = parseInt(rankText, 10);
      if (!isNaN(rank)) return rank;
    }
  }
  return null;
}
