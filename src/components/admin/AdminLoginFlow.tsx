"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Eye, EyeOff } from "lucide-react";
import {
  setAdminSession,
  validateCredentials,
  validateOtp,
} from "@/lib/admin/auth";

type Step = "login" | "otp";
type VerifyPhase = "idle" | "green" | "tick" | "success" | "done";

const OTP_LENGTH = 5;

function maskEmail(email: string) {
  if (!email.includes("@")) return "+99 *** *** ***";
  const [user, domain] = email.split("@");
  const masked =
    user.length <= 2
      ? `${user[0]}***`
      : `${user.slice(0, 2)}***${user.slice(-1)}`;
  return `${masked}@${domain}`;
}

export default function AdminLoginFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("login");
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState("");
  const [verifyPhase, setVerifyPhase] = useState<VerifyPhase>("idle");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const otpValue = otp.join("");
  const isOtpComplete = otp.every((d) => d !== "");
  const isOtpCorrect = isOtpComplete && validateOtp(otpValue);
  const isVerifying = verifyPhase !== "idle";

  const goToOtp = useCallback(() => {
    setDirection("forward");
    setStep("otp");
    setOtp(Array(OTP_LENGTH).fill(""));
    setOtpError("");
    setVerifyPhase("idle");
  }, []);

  const goToLogin = useCallback(() => {
    if (isVerifying) return;
    setDirection("back");
    setStep("login");
    setOtpError("");
    setVerifyPhase("idle");
  }, [isVerifying]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!validateCredentials(email, password)) {
      setLoginError("Invalid email or password.");
      return;
    }

    goToOtp();
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isVerifying) return;

    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, OTP_LENGTH).split("");
      const next = [...otp];
      digits.forEach((d, i) => {
        if (index + i < OTP_LENGTH) next[index + i] = d;
      });
      setOtp(next);
      setOtpError("");
      setVerifyPhase("idle");
      const focusIdx = Math.min(index + digits.length, OTP_LENGTH - 1);
      otpRefs.current[focusIdx]?.focus();
      return;
    }

    if (value && !/^\d$/.test(value)) return;

    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setOtpError("");
    setVerifyPhase("idle");

    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (isVerifying) return;
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    if (isVerifying) return;

    if (!isOtpComplete) {
      setOtpError("Please enter the full verification code.");
      return;
    }

    if (!validateOtp(otpValue)) {
      setOtpError("Incorrect code. Please try again.");
      return;
    }

    setOtpError("");
    setVerifyPhase("green");

    setTimeout(() => setVerifyPhase("tick"), 280);
    setTimeout(() => setVerifyPhase("success"), 580);
    setTimeout(() => setVerifyPhase("done"), 1100);
    setTimeout(() => {
      setAdminSession(remember);
      router.replace("/admin");
    }, 1600);
  };

  useEffect(() => {
    if (step === "otp") {
      const t = setTimeout(() => otpRefs.current[0]?.focus(), 380);
      return () => clearTimeout(t);
    }
  }, [step]);

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-[390px] mx-auto">
      <div className="flex-1 px-7 pt-16 pb-10 flex flex-col relative overflow-hidden">
        {/* ── Login ── */}
        <div
          className={`absolute inset-0 px-7 pt-16 pb-10 flex flex-col transition-all ease-[cubic-bezier(0.32,0.72,0,1)] ${
            step === "login"
              ? "translate-x-0 opacity-100"
              : direction === "forward"
                ? "-translate-x-full opacity-0 pointer-events-none"
                : "translate-x-full opacity-0 pointer-events-none"
          }`}
          style={{ transitionDuration: "420ms" }}
        >
          <div className="text-center mb-9">
            <h1 className="text-[26px] font-bold text-[#111111] tracking-tight leading-tight">
              Welcome back
            </h1>
            <p className="text-[14px] text-[#9CA3AF] mt-2.5 leading-relaxed px-2">
              Access your dashboard, users, and payments by logging in.
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex-1 flex flex-col">
            <div className="space-y-5">
              <div>
                <label className="text-[13px] font-semibold text-[#111111] mb-2 block">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setLoginError("");
                  }}
                  placeholder="Enter your email"
                  className="auth-input"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="text-[13px] font-semibold text-[#111111] mb-2 block">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setLoginError("");
                    }}
                    placeholder="Enter your password"
                    className="auth-input pr-12"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors p-0.5"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <button
                  type="button"
                  onClick={() => setRemember((v) => !v)}
                  className={`w-[18px] h-[18px] rounded-[5px] flex items-center justify-center transition-all duration-200 ${
                    remember ? "bg-[#34C759]" : "bg-[#F0F0F0]"
                  }`}
                  aria-pressed={remember}
                >
                  {remember && (
                    <Check size={12} className="text-white" strokeWidth={3} />
                  )}
                </button>
                <span className="text-[13px] font-medium text-[#374151]">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="text-[13px] font-semibold text-[#EF4444] hover:text-[#DC2626] transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {loginError && (
              <p className="text-[13px] text-[#EF4444] font-medium mt-4 animate-shake">
                {loginError}
              </p>
            )}

            <div className="mt-auto pt-10">
              <button type="submit" className="auth-btn-primary">
                Sign in
              </button>
            </div>
          </form>
        </div>

        {/* ── OTP ── */}
        <div
          className={`absolute inset-0 px-7 pt-10 pb-10 flex flex-col transition-all ease-[cubic-bezier(0.32,0.72,0,1)] ${
            step === "otp"
              ? "translate-x-0 opacity-100"
              : direction === "forward"
                ? "translate-x-full opacity-0 pointer-events-none"
                : "-translate-x-full opacity-0 pointer-events-none"
          }`}
          style={{ transitionDuration: "420ms" }}
        >
          <button
            type="button"
            onClick={goToLogin}
            disabled={isVerifying}
            className="w-10 h-10 rounded-full bg-[#F0F0F0] flex items-center justify-center text-[#374151] hover:bg-[#E5E5E5] active:scale-95 transition-all mb-10 disabled:opacity-40"
            aria-label="Go back"
          >
            <ArrowLeft size={18} strokeWidth={2} />
          </button>

          <div className="text-center mb-10">
            <h1 className="text-[26px] font-bold text-[#111111] tracking-tight leading-tight">
              Enter OTP Code
            </h1>
            <p className="text-[14px] text-[#9CA3AF] mt-2.5 leading-relaxed px-1">
              We&apos;ve sent a verification code to{" "}
              <span className="text-[#6B7280] font-medium">
                {maskEmail(email)}
              </span>
            </p>
          </div>

          <div className="flex justify-center gap-2.5 mb-8">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  otpRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={OTP_LENGTH}
                value={digit}
                disabled={isVerifying}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                className={`otp-box ${
                  isOtpCorrect ? "otp-box-success" : digit ? "otp-box-filled" : ""
                }`}
                aria-label={`Digit ${i + 1}`}
              />
            ))}
          </div>

          {otpError && (
            <p className="text-[13px] text-[#EF4444] font-medium text-center mb-4 animate-shake">
              {otpError}
            </p>
          )}

          <div className="mt-auto space-y-6">
            <button
              type="button"
              onClick={handleVerify}
              disabled={isVerifying && verifyPhase === "done"}
              className={`verify-btn ${
                verifyPhase === "idle"
                  ? "verify-btn-idle"
                  : "verify-btn-success"
              }`}
            >
              <span className="verify-btn-inner">
                {verifyPhase === "idle" && (
                  <span className="verify-label-idle">Verify</span>
                )}

                {verifyPhase !== "idle" && (
                  <>
                    <span
                      className={`verify-tick ${
                        verifyPhase === "tick" ||
                        verifyPhase === "success" ||
                        verifyPhase === "done"
                          ? "verify-tick-visible"
                          : ""
                      }`}
                    >
                      <Check size={20} strokeWidth={2.5} />
                    </span>
                    <span
                      className={`verify-label-success ${
                        verifyPhase === "success" || verifyPhase === "done"
                          ? "verify-label-success-visible"
                          : ""
                      }`}
                    >
                      Success
                    </span>
                  </>
                )}
              </span>
            </button>

            <p className="text-center text-[14px] text-[#9CA3AF]">
              Didn&apos;t get OTP?{" "}
              <button
                type="button"
                disabled={isVerifying}
                className="font-semibold text-[#111111] hover:opacity-70 transition-opacity disabled:opacity-40"
                onClick={() => {
                  setOtp(Array(OTP_LENGTH).fill(""));
                  setOtpError("");
                  setVerifyPhase("idle");
                  otpRefs.current[0]?.focus();
                }}
              >
                Resend OTP
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
