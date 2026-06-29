import React from "react";
import { adminCard } from "./adminStyles";

// ─── Base pulse block ──────────────────────────────────────────────────────────

function Bone({ className }: { className: string }) {
  return (
    <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
  );
}

// ─── Activity list skeleton ────────────────────────────────────────────────────

interface ActivitySkeletonProps {
  title: string;
  rows?: number;
}

export function ActivitySkeleton({ title, rows = 4 }: ActivitySkeletonProps) {
  return (
    <div className={`${adminCard} overflow-hidden`}>
      {/* header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <span className="text-base font-bold text-gray-900">{title}</span>
        <Bone className="h-4 w-12" />
      </div>

      <div className="px-2 pb-2 space-y-1">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-3 py-3.5"
          >
            {/* avatar */}
            <Bone className="w-10 h-10 rounded-full shrink-0" />

            {/* text lines */}
            <div className="flex-1 min-w-0 space-y-2">
              <Bone className="h-3.5 w-3/4 rounded-lg" />
              <Bone className="h-3 w-1/3 rounded-lg" />
            </div>

            {/* amount */}
            <div className="text-right shrink-0 space-y-2">
              <Bone className="h-3.5 w-14 rounded-lg" />
              <Bone className="h-3 w-10 rounded-lg ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
