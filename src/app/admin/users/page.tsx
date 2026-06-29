"use client";

import React, { useEffect, useState } from "react";
import { RefreshCw, Users } from "lucide-react";
import ActivityList from "@/components/admin/ActivityList";
import UserDetailSheet from "@/components/admin/UserDetailSheet";
import PromoBanner from "@/components/admin/PromoBanner";
import { ActivitySkeleton } from "@/components/admin/Skeleton";
import { adminCard, adminPillButton } from "@/components/admin/adminStyles";
import type { User } from "@/lib/admin/mockData";

interface DbParticipant {
  id: string;
  full_name: string;
  phone: string;
  created_at: string;
  giveaway_payments: {
    id: string;
    amount: number;
    status: "pending" | "success" | "failed";
  }[];
}

function toUser(p: DbParticipant): User {
  const successPayments = p.giveaway_payments.filter(
    (pay) => pay.status === "success"
  );
  const totalSpent = successPayments.reduce(
    (sum, pay) => sum + Number(pay.amount),
    0
  );
  const initials = p.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return {
    id: p.id,
    name: p.full_name,
    email: "",
    phone: p.phone,
    joinDate: new Date(p.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    status: p.giveaway_payments.length > 0 ? "Active" : "Inactive",
    totalPayments: p.giveaway_payments.length,
    totalSpent: `₹${totalSpent.toFixed(2)}`,
    avatar: initials,
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<User | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/participants");
      if (res.ok) {
        const raw: DbParticipant[] = await res.json();
        setUsers(raw.map(toUser));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeCount = users.filter((u) => u.status === "Active").length;

  const items = users.map((u) => ({
    id: u.id,
    icon: (
      <span className="text-xs font-bold text-gray-600">{u.avatar}</span>
    ),
    title: u.name,
    subtitle: `${u.phone} · Joined ${u.joinDate}`,
    amount: u.totalSpent,
    amountSub: `${u.totalPayments} payment${u.totalPayments !== 1 ? "s" : ""}`,
    amountColor: "default" as const,
  }));

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage giveaway participants
          </p>
        </div>
        <button
          onClick={fetchData}
          className={`w-10 h-10 flex items-center justify-center text-gray-700 rounded-full ${adminPillButton}`}
          aria-label="Refresh"
        >
          <RefreshCw
            size={16}
            strokeWidth={1.8}
            className={loading ? "animate-spin" : ""}
          />
        </button>
      </header>

      {/* Stats card */}
      <div className={`${adminCard} p-5`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">
              Total Participants
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {loading ? (
                <span className="inline-block w-10 h-7 bg-gray-100 rounded-lg animate-pulse" />
              ) : (
                users.length
              )}
            </p>
          </div>
          <div className="w-px h-10 bg-gray-100" />
          <div className="text-right">
            <p className="text-xs text-gray-500 font-medium">With Payments</p>
            <p className="text-2xl font-bold text-[#34C759] mt-1">
              {loading ? (
                <span className="inline-block w-8 h-7 bg-gray-100 rounded-lg animate-pulse" />
              ) : (
                activeCount
              )}
            </p>
          </div>
          <div className="w-px h-10 bg-gray-100" />
          <div className="text-right">
            <p className="text-xs text-gray-500 font-medium">No Payments</p>
            <p className="text-2xl font-bold text-gray-400 mt-1">
              {loading ? (
                <span className="inline-block w-8 h-7 bg-gray-100 rounded-lg animate-pulse" />
              ) : (
                users.length - activeCount
              )}
            </p>
          </div>
        </div>
      </div>

      <PromoBanner title="Grow your audience — invite participants" />

      {/* List or skeleton */}
      {loading ? (
        <ActivitySkeleton title="All Users" rows={6} />
      ) : users.length === 0 ? (
        <div className={`${adminCard} p-10 flex flex-col items-center gap-3`}>
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
            <Users size={24} className="text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-500">
            No participants yet
          </p>
          <p className="text-xs text-gray-400 text-center">
            Users will appear here once they start the giveaway flow.
          </p>
        </div>
      ) : (
        <ActivityList
          title="All Users"
          items={items}
          onItemClick={(id) => {
            setSelected(users.find((u) => u.id === id) ?? null);
          }}
        />
      )}

      <UserDetailSheet
        user={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
