"use client";

import React, { useEffect, useState } from "react";
import {
  CreditCard,
  Users,
  Activity,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Filter,
  RefreshCw,
} from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import ActivityList from "@/components/admin/ActivityList";
import PromoBanner from "@/components/admin/PromoBanner";
import { ActivitySkeleton } from "@/components/admin/Skeleton";
import { adminCardLg, adminPillButton } from "@/components/admin/adminStyles";
import { getAdminSession } from "@/lib/admin/auth";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: "pending" | "success" | "failed";
  session_id: string | null;
  created_at: string;
  giveaway_participants: {
    id: string;
    full_name: string;
    phone: string;
  } | null;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function AdminDashboard() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payments");
      if (res.ok) setPayments(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const session = getAdminSession();
    if (session?.email) setAdminEmail(session.email);
    fetchData();
  }, []);

  const successPayments = payments.filter((p) => p.status === "success");
  const totalRevenue = successPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const uniqueParticipants = new Set(
    payments.map((p) => p.giveaway_participants?.id).filter(Boolean)
  ).size;

  const initials = adminEmail ? adminEmail.slice(0, 2).toUpperCase() : "A";

  const recentItems = payments.slice(0, 4).map((p) => ({
    id: p.id,
    icon:
      p.status === "success" ? (
        <ArrowDownLeft size={18} className="text-[#34C759]" />
      ) : p.status === "failed" ? (
        <ArrowUpRight size={18} className="text-red-400" />
      ) : (
        <ArrowUpRight size={18} className="text-gray-400" />
      ),
    title: `${p.giveaway_participants?.full_name ?? "Unknown"} · ${p.session_id?.slice(-6) ?? p.id.slice(-6)}`,
    subtitle: timeAgo(p.created_at),
    amount: `₹${Number(p.amount).toFixed(2)}`,
    amountSub: p.payment_method,
    amountColor:
      p.status === "success"
        ? ("green" as const)
        : p.status === "failed"
          ? ("red" as const)
          : ("default" as const),
  }));

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{getGreeting()}</p>
          <h1 className="text-[26px] font-bold text-gray-900 mt-0.5 leading-tight">
            Admin!
          </h1>
        </div>
        <div className="w-11 h-11 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold shadow-admin-button">
          {initials}
        </div>
      </header>

      <div className={`${adminCardLg} p-6`}>
        <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
        <p className="text-[40px] font-bold text-gray-900 tracking-tight mt-0.5 leading-none">
          {loading ? "—" : `₹${totalRevenue.toFixed(2)}`}
        </p>
        <div className="flex items-center gap-1.5 mt-2.5">
          <TrendingUp size={14} className="text-[#34C759]" />
          <span className="text-sm font-semibold text-[#34C759]">
            {loading ? "Loading..." : `${successPayments.length} successful payments`}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-gray-900 ${adminPillButton}`}
        >
          <Download size={18} strokeWidth={1.8} />
          Export
        </button>
        <button
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-gray-900 ${adminPillButton}`}
        >
          <Filter size={18} strokeWidth={1.8} />
          Filter
        </button>
        <button
          onClick={fetchData}
          className={`w-12 h-12 flex items-center justify-center text-gray-700 rounded-full ${adminPillButton}`}
          aria-label="Refresh"
        >
          <RefreshCw size={18} strokeWidth={1.8} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="Participants"
          value={loading ? "—" : String(uniqueParticipants)}
          icon={Users}
          trend=""
        />
        <StatCard
          title="Payments"
          value={loading ? "—" : String(payments.length)}
          icon={CreditCard}
          trend=""
        />
        <StatCard
          title="Success Rate"
          value={loading || payments.length === 0 ? "—" : `${Math.round((successPayments.length / payments.length) * 100)}%`}
          icon={Activity}
          trend=""
          compact
        />
        <StatCard
          title="Avg. Amount"
          value={loading || successPayments.length === 0 ? "—" : `₹${(totalRevenue / successPayments.length).toFixed(0)}`}
          icon={TrendingUp}
          trend=""
          compact
        />
      </div>

      <PromoBanner />

      {loading ? (
        <ActivitySkeleton title="Recent Activity" rows={4} />
      ) : (
        <ActivityList
          title="Recent Activity"
          seeAllHref="/admin/payments"
          items={recentItems}
        />
      )}
    </div>
  );
}
