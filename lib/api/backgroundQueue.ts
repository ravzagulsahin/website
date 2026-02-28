import { fetchWithRetry } from "./fetchWithRetry";

type QueuedReq = {
  id: string;
  url: string;
  init?: RequestInit;
};

const STORAGE_KEY = "bg_queue_v1";
let queue: QueuedReq[] = [];
let processing = false;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) queue = JSON.parse(raw);
  } catch {
    queue = [];
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {}
}

export function enqueueRequest(url: string, init?: RequestInit) {
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const item: QueuedReq = { id, url, init };
  queue.push(item);
  save();
  processQueue();
}

export async function processQueue() {
  if (processing) return;
  processing = true;
  if (typeof window === "undefined") {
    processing = false;
    return;
  }
  load();
  while (queue.length > 0) {
    const item = queue[0];
    try {
      await fetchWithRetry(item.url, item.init, 2, 8000);
      queue.shift();
      save();
    } catch (e) {
      // stop and retry later
      break;
    }
  }
  processing = false;
}

// attempt processing on load
if (typeof window !== "undefined") {
  load();
  setTimeout(() => processQueue(), 2000);
  window.addEventListener("online", () => processQueue());
}

