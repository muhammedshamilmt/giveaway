"use client";

import React, { useState, useCallback } from "react";
import PaymentJourney, { UserFormData } from "./PaymentJourney";
import {
  SendMoneyView,
  PaymentStatusView,
  StatusBottomSheet,
  TransactionReceipt,
  StatusViewState,
} from "./PaymentViews";

// Fixed giveaway entry amount in INR
const AMOUNT_INR = 1;

type FlowStep = "form" | "send-money" | "processing" | "success" | "failed" | "receipt";

function buildReceipt(
  user: UserFormData,
  razorpayPaymentId: string
): TransactionReceipt {
  return {
    recipientName: user.fullName,
    paymentMethod: "Razorpay",
    transactionDate: new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    sessionId: razorpayPaymentId,
  };
}

export default function PaymentFlow() {
  const [step, setStep] = useState<FlowStep>("form");
  const [userData, setUserData] = useState<UserFormData | null>(null);
  const [receipt, setReceipt] = useState<TransactionReceipt | null>(null);

  // ── Step 1: just store user data locally, nothing saved to DB yet ───────
  const handleFormSubmit = useCallback(async (data: UserFormData) => {
    setUserData(data);
    setStep("send-money");
  }, []);

  // ── Step 2: swipe → create Razorpay order → open checkout modal ──────────
  const handleSwipeComplete = useCallback(async () => {
    if (!userData) return;

    setStep("processing");

    try {
      // Create order server-side (no participant needed at this point)
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: AMOUNT_INR,
          currency: "INR",
        }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json().catch(() => ({}));
        console.error("[PaymentFlow] order creation failed", err);
        setStep("failed");
        return;
      }

      const order = await orderRes.json() as {
        order_id: string;
        amount: number;
        currency: string;
        key_id: string;
      };

      if (typeof window.Razorpay === "undefined") {
        console.error("[PaymentFlow] Razorpay script not loaded");
        setStep("failed");
        return;
      }

      const capturedUserData = userData;

      const rzp = new window.Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "Giveaway",
        description: "Giveaway Entry",
        order_id: order.order_id,
        prefill: {
          name: capturedUserData.fullName,
          contact: capturedUserData.phone,
        },
        theme: { color: "#111111" },

        handler: async (response) => {
          // Payment confirmed — now verify signature AND save participant + payment together
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                full_name: capturedUserData.fullName,
                phone: capturedUserData.phone,
                amount: AMOUNT_INR,
              }),
            });

            if (verifyRes.ok) {
              setReceipt(buildReceipt(capturedUserData, response.razorpay_payment_id));
              setStep("success");
            } else {
              console.error("[PaymentFlow] verification failed");
              setStep("failed");
            }
          } catch (err) {
            console.error("[PaymentFlow] verify error:", err);
            setStep("failed");
          }
        },

        modal: {
          ondismiss: () => {
            setStep("send-money");
          },
        },
      });

      rzp.open();
    } catch (err) {
      console.error("[PaymentFlow] checkout error:", err);
      setStep("failed");
    }
  }, [userData]);

  // ── Step 3: show receipt ─────────────────────────────────────────────────
  const handleNiceOne = useCallback(() => {
    setStep("receipt");
  }, []);

  // ── Reset ────────────────────────────────────────────────────────────────
  const handleContinue = useCallback(() => {
    setStep("form");
    setUserData(null);
    setReceipt(null);
  }, []);

  const statusState: StatusViewState | null =
    step === "processing"
      ? "processing"
      : step === "success"
        ? "success"
        : step === "failed"
          ? "failed"
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
          {/* Form panel */}
          <div
            className="absolute inset-0 p-0 transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)]"
            style={{
              opacity: isForm ? 1 : 0,
              pointerEvents: isForm ? "auto" : "none",
              transform: isForm ? "translateY(0)" : "translateY(-20px)",
            }}
          >
            <PaymentJourney onSubmit={handleFormSubmit} />
          </div>

          {/* Send Money panel */}
          <div
            className="absolute inset-0 p-0 transition-transform duration-400 ease-[cubic-bezier(0.32,0.72,0,1)]"
            style={{
              transform: isForm ? "translateY(100%)" : "translateY(0)",
            }}
          >
            {userData && (
              <SendMoneyView
                recipientName={userData.fullName}
                amount={AMOUNT_INR}
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
