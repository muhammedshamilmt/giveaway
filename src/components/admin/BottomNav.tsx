"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CreditCard, Users, Settings } from "lucide-react";

const links = [
  { name: "Home", href: "/admin", icon: Home },
  { name: "Payments", href: "/admin/payments", icon: CreditCard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg shadow-admin-nav">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2.5">
        {links.map((link) => {
          const isActive =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl transition-all min-w-[72px] ${
                isActive
                  ? "bg-[#F0F0F0] text-gray-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
              <span
                className={`text-[11px] ${isActive ? "font-semibold" : "font-medium"}`}
              >
                {link.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
