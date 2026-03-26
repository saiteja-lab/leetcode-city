const DEV_SESSION_STORAGE_KEY = "leetcode_city_dev_session";
const DEV_AUTH_EVENT = "leetcode-city-auth-change";

export function getStoredDevelopmentSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawSession = window.localStorage.getItem(DEV_SESSION_STORAGE_KEY);
  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession);
  } catch {
    window.localStorage.removeItem(DEV_SESSION_STORAGE_KEY);
    return null;
  }
}

export function setStoredDevelopmentSession(session) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DEV_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredDevelopmentSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(DEV_SESSION_STORAGE_KEY);
}

export function emitDevelopmentAuthChange(session) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(DEV_AUTH_EVENT, {
      detail: session,
    }),
  );
}

export function subscribeDevelopmentAuthChange(callback) {
  if (typeof window === "undefined") {
    return {
      unsubscribe() {},
    };
  }

  const handler = (event) => {
    callback(event.detail || null);
  };

  window.addEventListener(DEV_AUTH_EVENT, handler);

  return {
    unsubscribe() {
      window.removeEventListener(DEV_AUTH_EVENT, handler);
    },
  };
}
