import { NextRequest, NextResponse } from "next/server";

const isProd = process.env.NODE_ENV === "production";

// Allowed origins — set ALLOWED_ORIGIN in env for production
// Multiple origins: comma-separated e.g. "https://a.com,https://b.com"
const allowedOrigins = process.env.ALLOWED_ORIGIN
  ? process.env.ALLOWED_ORIGIN.split(",").map((o) => o.trim())
  : [];

function getCorsHeaders(origin: string | null): Record<string, string> {
  if (!isProd) {
    // Dev: allow all origins
    return {
      "Access-Control-Allow-Origin":  origin ?? "*",
      "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
  }

  // Prod: only allowed origins
  if (origin && allowedOrigins.includes(origin)) {
    return {
      "Access-Control-Allow-Origin":  origin,
      "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Vary": "Origin",
    };
  }

  return {}; // no CORS headers = browser will block cross-origin requests
}

function getSecurityHeaders(): Record<string, string> {
  return {
    // Prevent clickjacking
    "X-Frame-Options": "DENY",
    // Prevent MIME sniffing
    "X-Content-Type-Options": "nosniff",
    // Referrer policy
    "Referrer-Policy": "strict-origin-when-cross-origin",
    // Permissions policy — disable unused browser features
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(self)",
    // HSTS — only in production
    ...(isProd
      ? { "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload" }
      : {}),
    // Content Security Policy
    "Content-Security-Policy": [
      "default-src 'self'",
      // Razorpay checkout script + frame
      "script-src 'self' https://checkout.razorpay.com",
      "frame-src https://api.razorpay.com https://checkout.razorpay.com",
      // Supabase API
      `connect-src 'self' ${process.env.SUPABASE_URL ?? ""} https://api.razorpay.com`,
      "img-src 'self' data: blob:",
      "style-src 'self' 'unsafe-inline'", // Tailwind requires inline styles
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ]
      .filter(Boolean)
      .join("; "),
  };
}

export function middleware(req: NextRequest) {
  const origin = req.headers.get("origin");

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        ...getCorsHeaders(origin),
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  const res = NextResponse.next();

  // Apply security headers to all responses
  const secHeaders = getSecurityHeaders();
  for (const [k, v] of Object.entries(secHeaders)) {
    res.headers.set(k, v);
  }

  // Apply CORS headers to API routes
  if (req.nextUrl.pathname.startsWith("/api/")) {
    const corsHeaders = getCorsHeaders(origin);
    for (const [k, v] of Object.entries(corsHeaders)) {
      res.headers.set(k, v);
    }
  }

  return res;
}

export const config = {
  matcher: [
    // Apply to all routes except Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
