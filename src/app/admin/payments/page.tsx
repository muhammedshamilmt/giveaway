"use client";

import React, { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, RefreshCw } from "lucide-react";
import ActivityList from "@/components/admin/ActivityList";
import PaymentDetailSheet from "@/components/admin/PaymentDetailSheet";
import PromoBanner from "@/components/admin/PromoBanner";
import { ActivitySkeleton } from "@/components/admin/Skeleton";
import { adminCard, adminPillButton } from "@/components/admin/adminStyles";
import type { Payment } from "@/lib/admin/mockData";

interface DbPayment {
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

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function toMockPayment(p: DbPayment): Payment {
  const statusMap = { success: "Success", pending: "Pending", failed: "Failed" } as const;
  return {
    id: p.session_id?.slice(-8).toUpperCase() ?? p.id.slice(-8).toUpperCase(),
    user: p.giveaway_participants?.full_name ?? "Unknown",
    userId: p.giveaway_participants?.id ?? "",
    method: p.payment_method,
    amount: `₹${Number(p.amount).toFixed(2)}`,
    amountRaw: Number(p.amount),
    status: statusMap[p.status],
    date: new Date(p.created_at).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    timeAgo: timeAgo(p.created_at),
    fee: "₹0.00",
    campaign: "Giveaway",
  };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Payment | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payments");
      if (res.ok) {
        const raw: DbPayment[] = await res.json();
        setPayments(raw.map(toMockPayment));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const successPayments = payments.filter((p) => p.status === "Success");
  const totalRevenue = successPayments.reduce((sum, p) => sum + p.amountRaw, 0);

  const items = payments.map((p) => ({
    id: p.id,
    icon:
      p.status === "Success" ? (
        <ArrowDownLeft size={18} className="text-[#34C759]" />
      ) : p.status === "Failed" ? (
        <ArrowUpRight size={18} className="text-red-400" />
      ) : (
        <ArrowUpRight size={18} className="text-gray-400" />
      ),
    title: `${p.user} · ${p.id}`,
    subtitle: p.timeAgo,
    amount: p.amount,
    amountSub: p.status,
    amountColor:
      p.status === "Success"
        ? ("green" as const)
        : p.status === "Failed"
          ? ("red" as const)
          : ("default" as const),
  }));

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500 mt-1">Track all incoming transactions</p>
        </div>
        <button
          onClick={fetchData}
          className={`w-10 h-10 flex items-center justify-center text-gray-700 rounded-full ${adminPillButton}`}
          aria-label="Refresh"
        >
          <RefreshCw size={16} strokeWidth={1.8} className={loading ? "animate-spin" : ""} />
        </button>
      </header>

      <div className={`${adminCard} p-5`}>
        <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">
          {loading ? "—" : `₹${totalRevenue.toFixed(2)}`}
        </p>
        <p className="text-sm text-[#34C759] font-semibold mt-1">
          {loading ? "Loading..." : `${successPayments.length} of ${payments.length} payments successful`}
        </p>
      </div>

      <PromoBanner title="Boost revenue — share your giveaway link" />

      {loading ? (
        <ActivitySkeleton title="All Transactions" rows={6} />
      ) : (
        <ActivityList
          title="All Transactions"
          items={items}
          onItemClick={(id) => {
            const payment = payments.find((p) => p.id === id) ?? null;
            setSelected(payment);
          }}
        />
      )}

      <PaymentDetailSheet
        payment={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
