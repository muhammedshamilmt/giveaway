"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { adminCard } from "./adminStyles";

export interface ActivityItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  amount?: string;
  amountSub?: string;
  amountColor?: "default" | "green" | "red";
}

interface ActivityListProps {
  items: ActivityItem[];
  onItemClick?: (id: string) => void;
  title?: string;
  seeAllHref?: string;
}

export default function ActivityList({
  items,
  onItemClick,
  title,
  seeAllHref,
}: ActivityListProps) {
  return (
    <div className={`${adminCard} overflow-hidden`}>
      {title && (
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          {seeAllHref && (
            <Link
              href={seeAllHref}
              className="text-sm text-gray-500 font-medium flex items-center gap-0.5 hover:text-gray-700"
            >
              See all
              <ChevronRight size={16} />
            </Link>
          )}
        </div>
      )}

      <div className="px-2 pb-2">
        {items.map((item) => {
          const rowClass = `w-full flex items-center gap-3 px-3 py-3.5 rounded-2xl transition-colors text-left ${
            onItemClick ? "hover:bg-[#F5F5F5] active:bg-[#EFEFEF]" : ""
          }`;

          const inner = (
            <>
              <div className="w-10 h-10 rounded-full bg-[#F0F0F0] flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {item.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{item.subtitle}</p>
              </div>
              {item.amount && (
                <div className="text-right shrink-0">
                  <p
                    className={`text-sm font-bold ${
                      item.amountColor === "green"
                        ? "text-[#34C759]"
                        : item.amountColor === "red"
                          ? "text-red-500"
                          : "text-gray-900"
                    }`}
                  >
                    {item.amount}
                  </p>
                  {item.amountSub && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.amountSub}
                    </p>
                  )}
                </div>
              )}
              {onItemClick && (
                <ChevronRight size={16} className="text-gray-300 shrink-0" />
              )}
            </>
          );

          if (onItemClick) {
            return (
              <button
                key={item.id}
                onClick={() => onItemClick(item.id)}
                className={rowClass}
              >
                {inner}
              </button>
            );
          }

          return (
            <div key={item.id} className={rowClass}>
              {inner}
            </div>
          );
        })}

        {items.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">
            No items to display.
          </p>
        )}
      </div>
    </div>
  );
}
