import React from "react";
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
import { payments } from "@/lib/admin/mockData";
import { adminCardLg, adminPillButton } from "@/components/admin/adminStyles";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function AdminDashboard() {
  const recentItems = payments.slice(0, 4).map((p) => ({
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
    amountSub: p.method,
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
          <p className="text-sm text-gray-500 font-medium">{getGreeting()}</p>
          <h1 className="text-[26px] font-bold text-gray-900 mt-0.5 leading-tight">
            Admin!
          </h1>
        </div>
        <div className="w-11 h-11 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold shadow-admin-button">
          A
        </div>
      </header>

      <div className={`${adminCardLg} p-6`}>
        <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
        <p className="text-[40px] font-bold text-gray-900 tracking-tight mt-0.5 leading-none">
          $12,450
        </p>
        <div className="flex items-center gap-1.5 mt-2.5">
          <TrendingUp size={14} className="text-[#34C759]" />
          <span className="text-sm font-semibold text-[#34C759]">
            +$4,900 (49.9%)
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
          className={`w-12 h-12 flex items-center justify-center text-gray-700 rounded-full ${adminPillButton}`}
          aria-label="Refresh"
        >
          <RefreshCw size={18} strokeWidth={1.8} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard title="Active Users" value="1,204" icon={Users} trend="+5.2%" />
        <StatCard
          title="Payments"
          value="342"
          icon={CreditCard}
          trend="+12.5%"
        />
        <StatCard
          title="Conversion"
          value="64.2%"
          icon={Activity}
          trend="-1.4%"
          compact
        />
        <StatCard
          title="Avg. Order"
          value="$60"
          icon={TrendingUp}
          trend="+3.1%"
          compact
        />
      </div>

      <PromoBanner />

      <ActivityList
        title="Activity"
        seeAllHref="/admin/payments"
        items={recentItems}
      />
    </div>
  );
}
