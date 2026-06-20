"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, Fuel } from "lucide-react";
import BottomSheet from "./BottomSheet";
import StatusBadge from "./StatusBadge";
import DetailRow from "./DetailRow";
import type { Payment } from "@/lib/admin/mockData";
import { adminPillButton } from "./adminStyles";

interface PaymentDetailSheetProps {
  payment: Payment | null;
  open: boolean;
  onClose: () => void;
}

export default function PaymentDetailSheet({
  payment,
  open,
  onClose,
}: PaymentDetailSheetProps) {
  const [cachedPayment, setCachedPayment] = useState<Payment | null>(payment);

  useEffect(() => {
    if (payment) {
      setCachedPayment(payment);
    }
  }, [payment]);

  if (!cachedPayment) return null;

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Transaction Details"
      subtitle="Review payment information"
    >
      <div className="animate-fade-in-up">
        <div className="text-center mb-6">
          <p className="text-4xl font-bold text-gray-900 tracking-tight">
            {cachedPayment.amount}
          </p>
          <div className="mt-3 flex justify-center">
            <StatusBadge status={cachedPayment.status} size="md" />
          </div>
        </div>

        <div className="bg-[#F3F4F6] rounded-[20px] px-4 py-1 divide-y divide-gray-200/60">
          <DetailRow label="Transaction ID" value={cachedPayment.id} />
          <DetailRow label="User" value={cachedPayment.user} />
          <DetailRow
            label="Payment Method"
            value={cachedPayment.method}
            icon={<CreditCard size={16} className="text-blue-500" />}
          />
          <DetailRow label="Campaign" value={cachedPayment.campaign} />
          <DetailRow label="Date & Time" value={cachedPayment.date} />
          <DetailRow
            label="Processing Fee"
            value={cachedPayment.fee}
            icon={<Fuel size={16} className="text-red-400" />}
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className={`flex-1 py-3.5 text-gray-900 font-semibold text-sm ${adminPillButton}`}
          >
            Close
          </button>
          <button className="flex-1 py-3.5 rounded-full bg-black text-white font-semibold text-sm hover:bg-gray-800 transition-colors shadow-admin-button">
            Refund
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
