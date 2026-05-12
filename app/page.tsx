"use client";

import { useState, useEffect } from "react";
import { RankChart } from "@/components/RankChart";
import { PushButton } from "@/components/PushButton";

interface HistoryEntry {
  timestamp: number;
  rank: number | null;
}

export default function Home() {
  const [rank, setRank] = useState<number | null | undefined>(undefined);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    fetchRank();
  }, []);

  async function fetchRank() {
    try {
      const res = await fetch("/api/rank");
      const data = await res.json();
      setRank(data.rank ?? null);
      setHistory(data.history ?? []);
      setLastChecked(new Date());
    } catch {
      setRank(null);
    }
  }

  const rankLabel =
    rank === undefined
      ? "..."
      : rank === null
      ? "TOP100 밖"
      : `${rank}위`;

  const rankColor =
    rank === undefined
      ? "text-zinc-600"
      : rank === null
      ? "text-zinc-500"
      : rank <= 10
      ? "text-melon"
      : rank <= 50
      ? "text-green-400"
      : "text-zinc-300";

  return (
    <main className="flex flex-col items-center px-4 py-12 max-w-md mx-auto">
      <p className="text-zinc-500 text-xs tracking-widest uppercase mb-1">멜론 TOP100</p>
      <h1 className="text-white font-bold text-2xl mb-8">Heavy Serenade</h1>

      <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 flex flex-col items-center gap-3">
        <p className="text-zinc-500 text-xs">현재 순위</p>
        <p className={`font-black text-6xl tabular-nums ${rankColor}`}>{rankLabel}</p>
        <p className="text-zinc-600 text-xs">
          {lastChecked
            ? `마지막 확인: ${lastChecked.toLocaleTimeString("ko-KR")}`
            : "로딩 중..."}
        </p>
        <button
          onClick={fetchRank}
          className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors mt-1"
        >
          새로고침
        </button>
      </div>

      <PushButton />

      <div className="w-full mt-2">
        <RankChart history={history} />
      </div>

      <p className="text-zinc-700 text-xs mt-10 text-center">
        매시간 자동 업데이트 · 순위 변동 시 푸쉬 알림
      </p>
    </main>
  );
}
