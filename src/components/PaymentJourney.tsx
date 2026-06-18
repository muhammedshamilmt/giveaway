"use client";

import React from "react";

export interface UserFormData {
  fullName: string;
  phone: string;
}

interface PaymentJourneyProps {
  onSubmit: (data: UserFormData) => void;
}

export default function PaymentJourney({ onSubmit }: PaymentJourneyProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fullName = (form.elements.namedItem("name") as HTMLInputElement).value;
    const phone = (form.elements.namedItem("phone") as HTMLInputElement).value;
    onSubmit({ fullName, phone });
  };

  return (
    <>
      <div className="text-center px-1 mb-5 shrink-0">
        <h1 className="text-[20px] font-bold tracking-tight text-gray-900 leading-[1.3]">
          Welcome, you&apos;re starting
          <br />
          your first journey here!
        </h1>
        <p className="text-xs text-gray-500 mt-2 font-medium">
          Please enter your details to proceed.
        </p>
      </div>

      <form className="flex-1 flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="shrink-0">
          <label
            htmlFor="name"
            className="block text-xs font-bold text-gray-900 mb-1.5"
          >
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="John Doe"
            className="block w-full rounded-xl bg-[#F5F5F5] px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-200 transition-all outline-none"
            required
          />
        </div>

        <div className="shrink-0">
          <label
            htmlFor="phone"
            className="block text-xs font-bold text-gray-900 mb-1.5"
          >
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="+1 (555) 000-0000"
            className="block w-full rounded-xl bg-[#F5F5F5] px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-200 transition-all outline-none"
            required
          />
        </div>

        <div className="pt-2 mt-auto shrink-0">
          <button
            type="submit"
            className="w-full flex items-center justify-center rounded-xl bg-black hover:bg-gray-900 py-3.5 text-sm font-bold text-white transition-all active:scale-[0.98]"
          >
            Continue
          </button>
        </div>
      </form>
    </>
  );
}
