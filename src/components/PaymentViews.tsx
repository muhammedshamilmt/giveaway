"use client";

import React, { useEffect, useState } from "react";
import { Wallet, Globe, X, Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";
import SwipeToPay from "./SwipeToPay";
import DetailRow from "./admin/DetailRow";

export interface TransactionReceipt {
  recipientName: string;
  paymentMethod: string;
  transactionDate: string;
  sessionId: string;
}

export type StatusViewState = "processing" | "success" | "failed" | "receipt";

interface SendMoneyViewProps {
  recipientName: string;
  amount?: number;
  onSwipeComplete: () => void;
  swipeDisabled?: boolean;
}

export function SendMoneyView({
  recipientName,
  amount = 1,
  onSwipeComplete,
  swipeDisabled,
}: SendMoneyViewProps) {
  const whole = Math.floor(amount);
  const decimal = (amount % 1).toFixed(2).slice(1);
  const initials = recipientName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col">
      <div className="mb-1">
        <h2 className="text-[18px] font-bold text-gray-900">Send Money</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Add or search user to send money
        </p>
      </div>

      <div className="py-3 flex flex-col items-center">
        <div className="w-11 h-11 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs mb-1.5">
          {initials}
        </div>
        <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">
          Sending to
        </p>
        <p className="text-sm font-semibold text-gray-900 mt-0.5">
          {recipientName}
        </p>

        <div className="mt-4 flex items-baseline">
          <span className="text-[36px] font-bold text-gray-900 tracking-tight">
            ₹{whole}
          </span>
          <span className="text-[22px] font-bold text-gray-300">{decimal}</span>
        </div>
      </div>

      <div className="space-y-0 mb-1">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2 text-gray-500">
            <Wallet size={16} strokeWidth={1.8} />
            <span className="text-xs font-medium">Balance Available</span>
          </div>
          <span className="text-xs font-semibold text-gray-900">₹1.00</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2 text-gray-500">
            <Globe size={16} strokeWidth={1.8} />
            <span className="text-xs font-medium">Forex Tax</span>
          </div>
          <span className="text-xs font-semibold text-gray-900">₹0.00</span>
        </div>
      </div>

      <div className="py-2">
        <SwipeToPay onComplete={onSwipeComplete} disabled={swipeDisabled} />
      </div>

      <p className="text-center text-[10px] text-gray-400 pt-1">
        Payments Powered By{" "}
        <span className="font-bold text-gray-900">Razorpay</span>
      </p>
    </div>
  );
}

interface StatusBottomSheetProps {
  open: boolean;
  children: React.ReactNode;
}

export function StatusBottomSheet({ open, children }: StatusBottomSheetProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(t);
    }
    setVisible(false);
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-md transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"
          }`}
        aria-hidden
      />

      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[28px] shadow-[0_-8px_40px_rgba(0,0,0,0.1)] transition-transform duration-400 ease-out min-h-[40vh] flex flex-col ${visible ? "translate-y-0" : "translate-y-full"
          }`}
        style={{ transitionDuration: "400ms" }}
      >
        <div className="flex justify-center pt-1 pb-4">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>
        <div className="max-w-lg mx-auto px-5 pt-10 pb-8 flex-1 flex flex-col w-full">
          {children}
        </div>
      </div>
    </>
  );
}

interface PaymentStatusViewProps {
  state: StatusViewState;
  receipt?: TransactionReceipt;
  onNiceOne?: () => void;
  onContinue?: () => void;
}

export function PaymentStatusView({
  state,
  receipt,
  onNiceOne,
  onContinue,
}: PaymentStatusViewProps) {
  const isProcessing = state === "processing";
  const isSuccess = state === "success";
  const isFailed = state === "failed";
  const isReceipt = state === "receipt";

  return (
    <>
      {isProcessing && (
        <div className="flex flex-col items-center text-center animate-fade-in-up">
          <Image
            src="/assets/proccessing.svg"
            alt="Processing"
            width={100}
            height={100}
            className="w-[88px] h-[88px] animate-processing-float"
          />
          <p className="text-[15px] text-gray-600 font-medium mt-4 leading-snug">
            Performing internet magic
          </p>
          <div className="mt-8 w-full flex items-center justify-between rounded-full bg-black text-white px-6 py-3.5">
            <span className="text-[15px] font-semibold">Processing</span>
            <Loader2 size={22} className="animate-spin text-white" />
          </div>
        </div>
      )}

      {isFailed && (
        <div className="flex flex-col items-center text-center animate-fade-in-up">
          <div className="w-[88px] h-[88px] rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle size={44} className="text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mt-4">Payment Failed</h3>
          <p className="text-sm text-gray-500 mt-1 font-medium leading-snug">
            Something went wrong. Please try again.
          </p>
          <button
            onClick={onContinue}
            className="mt-6 w-full py-3.5 rounded-full bg-gray-900 text-white text-[15px] font-semibold hover:bg-black active:scale-[0.98] transition-all"
          >
            Try again
          </button>
        </div>
      )}

      {isSuccess && (
        <div className="flex flex-col items-center text-center animate-fade-in-up">
          <Image
            src="/assets/success.svg"
            alt="Success"
            width={100}
            height={100}
            className="w-[88px] h-[88px] animate-success-bounce"
          />
          <h3 className="text-lg font-bold text-gray-900 mt-4">Success!</h3>
          <p className="text-sm text-gray-500 mt-1 font-medium leading-snug">
            Your payment was successful
          </p>
          <button
            onClick={onNiceOne}
            className="mt-6 w-full py-3.5 rounded-full bg-gray-900 text-white text-[15px] font-semibold hover:bg-black active:scale-[0.98] transition-all"
          >
            Nice one!
          </button>
        </div>
      )}

      {isReceipt && receipt && (
        <div className="w-full animate-fade-in-up">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[16px] font-bold text-gray-900">
              Transaction receipt
            </h3>
            <button
              onClick={onContinue}
              className="w-7 h-7 rounded-full bg-[#F0F0F0] flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>

          <div className="bg-[#F3F4F6] rounded-[18px] px-3.5 py-0.5 divide-y divide-gray-200/60">
            <DetailRow label="Recipient's name" value={receipt.recipientName} />
            <DetailRow label="Payment method" value={receipt.paymentMethod} />
            <DetailRow label="Transaction date" value={receipt.transactionDate} />
            <DetailRow label="Session ID" value={receipt.sessionId} />
          </div>
          <div className="flex">
            <button
              onClick={onContinue}
              className="mt-4 w-full py-3 rounded-2xl bg-black text-white text-[14px] font-semibold hover:bg-gray-900 active:scale-[0.98] transition-all"
            >
              Continue
            </button>

            <button
              onClick={onContinue}
              className="w-full mt-2 py-1 text-[13px] font-semibold  text-gray-900 hover:opacity-70 transition-opacity text-center"
            >
              Report issue
            </button>
          </div>
        </div>
      )}
    </>
  );
}
