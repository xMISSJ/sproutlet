/**
 * Tiny localStorage helpers shared by care + custom plant DBs.
 */

export function readCache(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeCache(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    const quota =
      err?.name === "QuotaExceededError" ||
      err?.code === 22 ||
      err?.code === 1014;
    if (quota) {
      throw new Error(
        "Browser storage is full. Try a smaller plant photo, or remove some plants.",
      );
    }
    throw err;
  }
}

export function readCacheFlag(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeCacheFlag(key, value = "1") {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Non-critical migration flags — ignore quota failures
  }
}
