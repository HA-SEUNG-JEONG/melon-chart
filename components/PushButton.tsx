"use client";

import { useState, useEffect } from "react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function PushButton() {
  const [state, setState] = useState<"loading" | "unsupported" | "subscribed" | "unsubscribed">("loading");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    navigator.serviceWorker.register("/sw.js").then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setState(sub ? "subscribed" : "unsubscribed");
    });
  }, []);

  async function toggle() {
    const reg = await navigator.serviceWorker.ready;

    if (state === "subscribed") {
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await fetch("/api/subscribe", { method: "DELETE", body: JSON.stringify(sub), headers: { "Content-Type": "application/json" } });
      }
      setState("unsubscribed");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
    await fetch("/api/subscribe", { method: "POST", body: JSON.stringify(sub), headers: { "Content-Type": "application/json" } });
    setState("subscribed");
  }

  if (state === "loading") return null;
  if (state === "unsupported") return (
    <p className="text-zinc-500 text-sm text-center">이 브라우저는 푸쉬 알림 미지원</p>
  );

  return (
    <button
      onClick={toggle}
      className={`mt-4 px-5 py-2 rounded-full text-sm font-medium transition-colors ${
        state === "subscribed"
          ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          : "bg-melon text-black hover:opacity-90"
      }`}
    >
      {state === "subscribed" ? "🔕 알림 해제" : "🔔 순위 변동 알림 받기"}
    </button>
  );
}
