"use client";

import React from "react";
import { usePathname } from "next/navigation";
import BottomNav from "@/components/admin/BottomNav";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return (
      <AdminAuthGuard>
        <div className="min-h-screen bg-white font-sans antialiased">
          {children}
        </div>
      </AdminAuthGuard>
    );
  }

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-[#F5F5F5] font-sans antialiased">
        <div className="max-w-lg mx-auto min-h-screen flex flex-col">
          <main className="flex-1 px-4 pt-6 pb-28 overflow-y-auto">
            {children}
          </main>
          <BottomNav />
        </div>
      </div>
    </AdminAuthGuard>
  );
}
