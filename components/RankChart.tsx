"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface HistoryEntry {
  timestamp: number;
  rank: number | null;
}

interface Props {
  history: HistoryEntry[];
}

function fmt(ts: number) {
  return new Date(ts).toLocaleString("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function RankChart({ history }: Props) {
  if (history.length === 0) {
    return <p className="text-center text-zinc-600 text-sm mt-8">데이터 없음</p>;
  }

  const data = [...history].reverse().map((e) => ({
    time: fmt(e.timestamp),
    rank: e.rank,
  }));

  return (
    <div className="mt-8 w-full">
      <p className="text-zinc-400 text-xs mb-3 text-center">순위 변동 (최근 48시간)</p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="time"
            tick={{ fill: "#71717a", fontSize: 10 }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            reversed
            domain={[1, 100]}
            tick={{ fill: "#71717a", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8 }}
            labelStyle={{ color: "#a1a1aa", fontSize: 11 }}
            formatter={(v) => [(v != null ? `${v}위` : "TOP100 밖"), ""]}
          />
          <ReferenceLine y={50} stroke="#27272a" strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey="rank"
            stroke="#00CD3C"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
