import React from "react";
import { LucideIcon } from "lucide-react";
import { adminCard } from "./adminStyles";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  compact?: boolean;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  compact,
}: StatCardProps) {
  return (
    <div className={`${adminCard} flex flex-col ${compact ? "p-4" : "p-5"}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="w-9 h-9 rounded-xl bg-[#F0F0F0] flex items-center justify-center">
          <Icon size={18} className="text-gray-600" />
        </div>
        {trend && (
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              trend.startsWith("+")
                ? "bg-green-50 text-[#34C759]"
                : "bg-red-50 text-red-500"
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 font-medium">{title}</p>
      <p
        className={`font-bold text-gray-900 mt-0.5 ${
          compact ? "text-xl" : "text-2xl"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
