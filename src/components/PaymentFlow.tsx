"use client";

import React, { useEffect, useState, useCallback } from "react";
import PaymentJourney, { UserFormData } from "./PaymentJourney";
import {
  SendMoneyView,
  PaymentStatusView,
  StatusBottomSheet,
  TransactionReceipt,
  StatusViewState,
} from "./PaymentViews";

type FlowStep =
  | "form"
  | "send-money"
  | "processing"
  | "success"
  | "receipt";

function buildReceipt(user: UserFormData): TransactionReceipt {
  return {
    recipientName: user.fullName,
    paymentMethod: "Transfer",
    transactionDate: new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    sessionId: `${Date.now()}${Math.floor(Math.random() * 1000)}`,
  };
}

export default function PaymentFlow() {
  const [step, setStep] = useState<FlowStep>("form");
  const [userData, setUserData] = useState<UserFormData | null>(null);
  const [receipt, setReceipt] = useState<TransactionReceipt | null>(null);

  const handleFormSubmit = useCallback((data: UserFormData) => {
    setUserData(data);
    setStep("send-money");
  }, []);

  const handleSwipeComplete = useCallback(() => {
    if (!userData) return;
    setReceipt(buildReceipt(userData));
    setStep("processing");
  }, [userData]);

  const handleNiceOne = useCallback(() => {
    setStep("receipt");
  }, []);

  const handleContinue = useCallback(() => {
    setStep("form");
    setUserData(null);
    setReceipt(null);
  }, []);

  useEffect(() => {
    if (step !== "processing") return;
    const timer = setTimeout(() => setStep("success"), 2500);
    return () => clearTimeout(timer);
  }, [step]);

  const statusState: StatusViewState | null =
    step === "processing"
      ? "processing"
      : step === "success"
        ? "success"
        : step === "receipt"
          ? "receipt"
          : null;

  const showBottomSheet = statusState !== null;
  const isForm = step === "form";

  return (
    <div className="flex flex-col w-full min-h-screen bg-white font-sans antialiased max-w-lg mx-auto relative">
      <div
        className="w-full h-[38vh] min-h-[200px] bg-gray-100 bg-cover bg-center bg-no-repeat shrink-0"
        style={{ backgroundImage: "url('/assets/header-bg.png')" }}
      />

      <div className="flex-1 px-4 pb-6 pt-4 flex flex-col">
        <div className="bg-white rounded-[20px] p-4 flex-1 flex flex-col overflow-hidden relative min-h-[380px]">
          {/* Form panel — slides out left */}
          <div
            className="absolute inset-0 p-0 transition-transform duration-400 ease-[cubic-bezier(0.32,0.72,0,1)]"
            style={{
              transform: isForm ? "translateX(0)" : "translateX(-100%)",
            }}
          >
            <PaymentJourney onSubmit={handleFormSubmit} />
          </div>

          {/* Send Money panel — slides in from right */}
          <div
            className="absolute inset-0 p-0 transition-transform duration-400 ease-[cubic-bezier(0.32,0.72,0,1)]"
            style={{
              transform: isForm ? "translateX(100%)" : "translateX(0)",
            }}
          >
            {userData && (
              <SendMoneyView
                recipientName={userData.fullName}
                onSwipeComplete={handleSwipeComplete}
                swipeDisabled={step !== "send-money"}
              />
            )}
          </div>
        </div>
      </div>

      <StatusBottomSheet open={showBottomSheet}>
        {statusState && (
          <PaymentStatusView
            state={statusState}
            receipt={receipt ?? undefined}
            onNiceOne={handleNiceOne}
            onContinue={handleContinue}
          />
        )}
      </StatusBottomSheet>
    </div>
  );
}
