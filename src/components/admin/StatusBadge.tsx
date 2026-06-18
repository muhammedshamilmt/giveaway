import React from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

type StatusType = "Success" | "Pending" | "Failed" | "Active" | "Inactive";

interface StatusBadgeProps {
  status: StatusType;
  size?: "sm" | "md";
}

const config: Record<
  StatusType,
  { label: string; className: string; icon?: React.ReactNode }
> = {
  Success: {
    label: "Successful",
    className: "bg-green-50 text-[#34C759]",
    icon: <CheckCircle2 size={14} />,
  },
  Pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-600",
    icon: <Clock size={14} />,
  },
  Failed: {
    label: "Failed",
    className: "bg-red-50 text-red-500",
    icon: <XCircle size={14} />,
  },
  Active: {
    label: "Active",
    className: "bg-green-50 text-[#34C759]",
    icon: <CheckCircle2 size={14} />,
  },
  Inactive: {
    label: "Inactive",
    className: "bg-[#F0F0F0] text-gray-500",
  },
};

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const { label, className, icon } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${
        size === "md" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs"
      } ${className}`}
    >
      {icon}
      {label}
    </span>
  );
}
