import webpush from "web-push";

let initialized = false;

export function getWebPush() {
  if (!initialized) {
    webpush.setVapidDetails(
      `mailto:${process.env.VAPID_EMAIL}`,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!,
    );
    initialized = true;
  }
  return webpush;
}
