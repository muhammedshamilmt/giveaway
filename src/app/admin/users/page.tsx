"use client";

import React, { useState } from "react";
import ActivityList from "@/components/admin/ActivityList";
import UserDetailSheet from "@/components/admin/UserDetailSheet";
import PromoBanner from "@/components/admin/PromoBanner";
import { users } from "@/lib/admin/mockData";
import type { User } from "@/lib/admin/mockData";
import { adminCard } from "@/components/admin/adminStyles";

export default function UsersPage() {
  const [selected, setSelected] = useState<User | null>(null);

  const items = users.map((u) => ({
    id: u.id,
    icon: (
      <span className="text-xs font-bold text-gray-600">{u.avatar}</span>
    ),
    title: u.name,
    subtitle: `Joined ${u.joinDate}`,
    amount: u.totalSpent,
    amountSub: `${u.totalPayments} payments`,
    amountColor: "default" as const,
  }));

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-[26px] font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage giveaway participants
        </p>
      </header>

      <div className={`${adminCard} p-5`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Users</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">1,204</p>
          </div>
          <div className="w-px h-10 bg-gray-100" />
          <div className="text-right">
            <p className="text-xs text-gray-500 font-medium">Active Today</p>
            <p className="text-2xl font-bold text-[#34C759] mt-1">89</p>
          </div>
        </div>
      </div>

      <PromoBanner title="Grow your audience — invite participants" />

      <ActivityList
        title="All Users"
        items={items}
        onItemClick={(id) => {
          const user = users.find((u) => u.id === id) ?? null;
          setSelected(user);
        }}
      />

      <UserDetailSheet
        user={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
