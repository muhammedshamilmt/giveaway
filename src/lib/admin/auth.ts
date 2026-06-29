const SESSION_KEY = "giveaway_admin_session";
const SESSION_EMAIL_KEY = "giveaway_admin_email";

/** Calls the server-side login route — credentials never leave the server. */
export async function validateCredentials(
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) return { ok: true };
    const body = await res.json().catch(() => ({}));
    return { ok: false, error: body.error ?? "Invalid email or password" };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

/** Calls the server-side OTP route — OTP secret never leaves the server. */
export async function validateOtp(
  otp: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/admin/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp }),
    });
    if (res.ok) return { ok: true };
    const body = await res.json().catch(() => ({}));
    return { ok: false, error: body.error ?? "Incorrect code. Please try again." };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

export function setAdminSession(email: string, remember: boolean): void {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify({ email, loggedInAt: Date.now() });
  if (remember) {
    localStorage.setItem(SESSION_KEY, payload);
  } else {
    sessionStorage.setItem(SESSION_KEY, payload);
  }
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

export function getAdminSession(): { email: string; loggedInAt: number } | null {
  if (typeof window === "undefined") return null;
  const raw =
    localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { email: string; loggedInAt: number };
  } catch {
    return null;
  }
}

export function isAdminAuthenticated(): boolean {
  return getAdminSession() !== null;
}
