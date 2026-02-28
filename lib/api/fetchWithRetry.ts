export async function fetchWithRetry(input: RequestInfo, init?: RequestInit, retries = 2, timeoutMs = 8000): Promise<Response> {
  let attempt = 0;
  while (true) {
    attempt++;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(input, { ...init, signal: controller.signal });
      clearTimeout(id);
      if (!res.ok && attempt <= retries) {
        await new Promise((r) => setTimeout(r, 300 * attempt));
        continue;
      }
      return res;
    } catch (err) {
      clearTimeout(id);
      if (attempt > retries) throw err;
      await new Promise((r) => setTimeout(r, 300 * attempt));
    }
  }
}

