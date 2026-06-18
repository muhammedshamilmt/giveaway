import React from "react";

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

export default function DetailRow({ label, value, icon }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 leading-tight">
      <span className="text-sm text-gray-500">{label}</span>
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 text-right">
        {icon}
        {value}
      </div>
    </div>
  );
}
