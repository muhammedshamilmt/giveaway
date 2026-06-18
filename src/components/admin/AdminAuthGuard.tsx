"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";

export default function AdminAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    const authed = isAdminAuthenticated();

    if (isLoginPage && authed) {
      router.replace("/admin");
      return;
    }

    if (!isLoginPage && !authed) {
      router.replace("/admin/login");
      return;
    }

    setReady(true);
  }, [isLoginPage, router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-gray-900 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
