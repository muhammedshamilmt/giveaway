"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export interface UserFormData {
  fullName: string;
  phone: string; // includes dial code, e.g. "+91 98765 43210"
}

interface Country {
  name: string;
  code: string;  // ISO alpha-2
  dial: string;  // e.g. "+91"
  flag: string;  // emoji
}

const COUNTRIES: Country[] = [
  { name: "India",          code: "IN", dial: "+91",  flag: "🇮🇳" },
  { name: "United States",  code: "US", dial: "+1",   flag: "🇺🇸" },
  { name: "United Kingdom", code: "GB", dial: "+44",  flag: "🇬🇧" },
  { name: "UAE",            code: "AE", dial: "+971", flag: "🇦🇪" },
  { name: "Saudi Arabia",   code: "SA", dial: "+966", flag: "🇸🇦" },
  { name: "Canada",         code: "CA", dial: "+1",   flag: "🇨🇦" },
  { name: "Australia",      code: "AU", dial: "+61",  flag: "🇦🇺" },
  { name: "Singapore",      code: "SG", dial: "+65",  flag: "🇸🇬" },
  { name: "Germany",        code: "DE", dial: "+49",  flag: "🇩🇪" },
  { name: "France",         code: "FR", dial: "+33",  flag: "🇫🇷" },
  { name: "Netherlands",    code: "NL", dial: "+31",  flag: "🇳🇱" },
  { name: "Japan",          code: "JP", dial: "+81",  flag: "🇯🇵" },
  { name: "South Korea",    code: "KR", dial: "+82",  flag: "🇰🇷" },
  { name: "China",          code: "CN", dial: "+86",  flag: "🇨🇳" },
  { name: "Brazil",         code: "BR", dial: "+55",  flag: "🇧🇷" },
  { name: "Mexico",         code: "MX", dial: "+52",  flag: "🇲🇽" },
  { name: "Pakistan",       code: "PK", dial: "+92",  flag: "🇵🇰" },
  { name: "Bangladesh",     code: "BD", dial: "+880", flag: "🇧🇩" },
  { name: "Sri Lanka",      code: "LK", dial: "+94",  flag: "🇱🇰" },
  { name: "Nepal",          code: "NP", dial: "+977", flag: "🇳🇵" },
  { name: "South Africa",   code: "ZA", dial: "+27",  flag: "🇿🇦" },
  { name: "Nigeria",        code: "NG", dial: "+234", flag: "🇳🇬" },
  { name: "Kenya",          code: "KE", dial: "+254", flag: "🇰🇪" },
  { name: "Malaysia",       code: "MY", dial: "+60",  flag: "🇲🇾" },
  { name: "Indonesia",      code: "ID", dial: "+62",  flag: "🇮🇩" },
  { name: "Philippines",    code: "PH", dial: "+63",  flag: "🇵🇭" },
  { name: "Thailand",       code: "TH", dial: "+66",  flag: "🇹🇭" },
  { name: "Vietnam",        code: "VN", dial: "+84",  flag: "🇻🇳" },
  { name: "Italy",          code: "IT", dial: "+39",  flag: "🇮🇹" },
  { name: "Spain",          code: "ES", dial: "+34",  flag: "🇪🇸" },
];

interface CountryPickerProps {
  selected: Country;
  onSelect: (country: Country) => void;
}

function CountryPicker({ selected, onSelect }: CountryPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focus search when opened
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  const filtered = search.trim()
    ? COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.dial.includes(search)
      )
    : COUNTRIES;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 h-full px-3 rounded-l-xl bg-[#F5F5F5] border-r border-gray-200 text-sm font-semibold text-gray-800 hover:bg-gray-100 transition-colors shrink-0 select-none"
        aria-label="Select country code"
        aria-expanded={open}
      >
        <span className="text-base leading-none">{selected.flag}</span>
        <span className="text-xs text-gray-500">{selected.dial}</span>
        <ChevronDown
          size={13}
          className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-64 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden">
          {/* Search */}
          <div className="px-3 pt-3 pb-2">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country..."
              className="w-full rounded-xl bg-[#F5F5F5] px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>

          {/* List */}
          <ul className="max-h-52 overflow-y-auto pb-2" role="listbox">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-xs text-gray-400 text-center">
                No results
              </li>
            ) : (
              filtered.map((c) => (
                <li key={c.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={c.code === selected.code}
                    onClick={() => {
                      onSelect(c);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-[#F5F5F5] transition-colors ${
                      c.code === selected.code
                        ? "bg-[#F5F5F5] font-semibold"
                        : "font-medium"
                    }`}
                  >
                    <span className="text-base leading-none">{c.flag}</span>
                    <span className="flex-1 truncate text-gray-900 text-xs">
                      {c.name}
                    </span>
                    <span className="text-xs text-gray-400 shrink-0">
                      {c.dial}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

interface PaymentJourneyProps {
  onSubmit: (data: UserFormData) => void;
}

export default function PaymentJourney({ onSubmit }: PaymentJourneyProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    COUNTRIES[0] // default: India
  );
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fullName = (form.elements.namedItem("name") as HTMLInputElement).value;
    // Combine dial code + number, e.g. "+91 98765 43210"
    const phone = `${selectedCountry.dial} ${phoneNumber.trim()}`;
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
        {/* Full Name */}
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

        {/* Phone with country picker */}
        <div className="shrink-0">
          <label
            htmlFor="phone"
            className="block text-xs font-bold text-gray-900 mb-1.5"
          >
            Phone Number
          </label>
          <div className="flex rounded-xl bg-[#F5F5F5] overflow-visible focus-within:ring-2 focus-within:ring-gray-200 transition-all">
            <CountryPicker
              selected={selectedCountry}
              onSelect={setSelectedCountry}
            />
            <input
              type="tel"
              id="phone"
              name="phone"
              value={phoneNumber}
              onChange={(e) =>
                setPhoneNumber(e.target.value.replace(/[^\d\s\-().]/g, ""))
              }
              placeholder="98765 43210"
              className="flex-1 min-w-0 bg-transparent px-3 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none"
              required
            />
          </div>
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
