export const DUMMY_ADMIN = {
  email: "admin@giveaway.com",
  password: "admin123",
  otp: "12345",
} as const;

const SESSION_KEY = "giveaway_admin_session";

export function validateCredentials(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === DUMMY_ADMIN.email &&
    password === DUMMY_ADMIN.password
  );
}

export function validateOtp(otp: string): boolean {
  return otp === DUMMY_ADMIN.otp;
}

export function setAdminSession(remember: boolean): void {
  if (typeof window === "undefined") return;
  const payload = {
    email: DUMMY_ADMIN.email,
    remember,
    loggedInAt: Date.now(),
  };
  if (remember) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
  } else {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
  }
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  const raw =
    localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
  if (!raw) return false;
  try {
    const data = JSON.parse(raw) as { email?: string };
    return data.email === DUMMY_ADMIN.email;
  } catch {
    return false;
  }
}
