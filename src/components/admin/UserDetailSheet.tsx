"use client";

import React, { useState, useEffect } from "react";
import { Mail, Phone, Calendar, CreditCard } from "lucide-react";
import BottomSheet from "./BottomSheet";
import StatusBadge from "./StatusBadge";
import DetailRow from "./DetailRow";
import type { User } from "@/lib/admin/mockData";
import { adminPillButton } from "./adminStyles";

interface UserDetailSheetProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
}

export default function UserDetailSheet({
  user,
  open,
  onClose,
}: UserDetailSheetProps) {
  const [cachedUser, setCachedUser] = useState<User | null>(user);

  useEffect(() => {
    if (user) {
      setCachedUser(user);
    }
  }, [user]);

  if (!cachedUser) return null;

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="User Details"
      subtitle="Participant information"
    >
      <div className="animate-fade-in-up">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gray-900 text-white flex items-center justify-center text-xl font-bold mx-auto shadow-admin-button">
            {cachedUser.avatar}
          </div>
          <p className="text-xl font-bold text-gray-900 mt-3">{cachedUser.name}</p>
          <div className="mt-2 flex justify-center">
            <StatusBadge status={cachedUser.status} size="md" />
          </div>
        </div>

        <div className="bg-[#F3F4F6] rounded-[20px] px-4 py-1 divide-y divide-gray-200/60">
          <DetailRow label="User ID" value={cachedUser.id} />
          <DetailRow
            label="Email"
            value={cachedUser.email}
            icon={<Mail size={16} className="text-blue-500" />}
          />
          <DetailRow
            label="Phone"
            value={cachedUser.phone}
            icon={<Phone size={16} className="text-green-500" />}
          />
          <DetailRow
            label="Join Date"
            value={cachedUser.joinDate}
            icon={<Calendar size={16} className="text-purple-500" />}
          />
          <DetailRow
            label="Total Payments"
            value={String(cachedUser.totalPayments)}
            icon={<CreditCard size={16} className="text-gray-500" />}
          />
          <DetailRow label="Total Spent" value={cachedUser.totalSpent} />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className={`flex-1 py-3.5 text-gray-900 font-semibold text-sm ${adminPillButton}`}
          >
            Close
          </button>
          <button className="flex-1 py-3.5 rounded-full bg-black text-white font-semibold text-sm hover:bg-gray-800 transition-colors shadow-admin-button">
            View Payments
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
