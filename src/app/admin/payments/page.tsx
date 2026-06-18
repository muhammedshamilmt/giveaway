"use client";

import React, { useState } from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import ActivityList from "@/components/admin/ActivityList";
import PaymentDetailSheet from "@/components/admin/PaymentDetailSheet";
import PromoBanner from "@/components/admin/PromoBanner";
import { payments } from "@/lib/admin/mockData";
import type { Payment } from "@/lib/admin/mockData";
import { adminCard } from "@/components/admin/adminStyles";

export default function PaymentsPage() {
  const [selected, setSelected] = useState<Payment | null>(null);

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
      <header>
        <h1 className="text-[26px] font-bold text-gray-900">Payments</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track all incoming transactions
        </p>
      </header>

      <div className={`${adminCard} p-5`}>
        <p className="text-sm text-gray-500 font-medium">This Month</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">$8,420.00</p>
        <p className="text-sm text-[#34C759] font-semibold mt-1">
          +18.2% from last month
        </p>
      </div>

      <PromoBanner title="Boost revenue — share your giveaway link" />

      <ActivityList
        title="All Transactions"
        items={items}
        onItemClick={(id) => {
          const payment = payments.find((p) => p.id === id) ?? null;
          setSelected(payment);
        }}
      />

      <PaymentDetailSheet
        payment={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
