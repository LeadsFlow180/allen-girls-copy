export const NAV_ACCOUNT_SYNC_EVENT = "aga:nav-account-sync";

export function broadcastNavAccountSync() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(NAV_ACCOUNT_SYNC_EVENT));
}
