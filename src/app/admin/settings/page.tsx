"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Shield,
  Palette,
  Globe,
  ChevronRight,
  LogOut,
  User,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { clearAdminSession, getAdminSession } from "@/lib/admin/auth";
import { adminCard, adminItemCard, adminPillButton } from "@/components/admin/adminStyles";

const settingsGroups = [
  {
    title: "Account",
    items: [
      { icon: User, label: "Profile", description: "Admin name & email" },
      { icon: Bell, label: "Notifications", description: "Alerts & updates" },
      { icon: Shield, label: "Security", description: "Password & 2FA" },
    ],
  },
  {
    title: "Preferences",
    items: [
      { icon: Palette, label: "Appearance", description: "Theme & display" },
      { icon: Globe, label: "Language", description: "English (US)" },
    ],
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearError, setClearError] = useState("");
  const [clearDone, setClearDone] = useState(false);

  useEffect(() => {
    const session = getAdminSession();
    if (session?.email) setAdminEmail(session.email);
  }, []);

  const initials = adminEmail ? adminEmail.slice(0, 2).toUpperCase() : "A";

  const handleSignOut = () => {
    clearAdminSession();
    router.replace("/admin/login");
  };

  const handleClearData = async () => {
    setClearing(true);
    setClearError("");
    try {
      const res = await fetch("/api/admin/clear-data", { method: "DELETE" });
      if (res.ok) {
        setClearDone(true);
        setShowConfirm(false);
      } else {
        const body = await res.json().catch(() => ({}));
        setClearError(body.error ?? "Failed to clear data.");
      }
    } catch {
      setClearError("Network error. Please try again.");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-[26px] font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your admin preferences
        </p>
      </header>

      {/* Profile card */}
      <div className={`${adminCard} p-5 flex items-center gap-4`}>
        <div className="w-14 h-14 rounded-full bg-gray-900 text-white flex items-center justify-center text-lg font-bold shadow-admin-button">
          {initials}
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-900">Admin</p>
          <p className="text-sm text-gray-500">{adminEmail}</p>
        </div>
        <button className={`px-4 py-2 text-sm font-semibold text-gray-700 ${adminPillButton}`}>
          Edit
        </button>
      </div>

      {/* Settings groups */}
      {settingsGroups.map((group) => (
        <div key={group.title}>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5 px-1">
            {group.title}
          </h3>
          <div className="space-y-2">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className={`w-full flex items-center gap-3 px-5 py-4 text-left ${adminItemCard}`}
                >
                  <div className="w-9 h-9 rounded-xl bg-[#F0F0F0] flex items-center justify-center">
                    <Icon size={18} className="text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.description}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Danger zone */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5 px-1">
          Danger Zone
        </h3>
        <div className={`${adminCard} p-5 space-y-3`}>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
              <Trash2 size={18} className="text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Clear All Data</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Permanently deletes all participants and payment records. This cannot be undone.
              </p>
            </div>
          </div>

          {clearDone && (
            <p className="text-xs font-semibold text-[#34C759] pl-12">
              ✓ All data cleared successfully.
            </p>
          )}
          {clearError && (
            <p className="text-xs font-semibold text-red-500 pl-12">{clearError}</p>
          )}

          {!showConfirm ? (
            <button
              onClick={() => { setShowConfirm(true); setClearDone(false); setClearError(""); }}
              className="w-full py-3 rounded-[14px] bg-red-50 text-red-500 text-sm font-semibold hover:bg-red-100 transition-colors"
            >
              Clear All Data
            </button>
          ) : (
            <div className="rounded-[14px] bg-red-50 p-4 space-y-3">
              <div className="flex items-center gap-2 text-red-500">
                <AlertTriangle size={16} />
                <p className="text-xs font-semibold">
                  This will delete all participants and payments. Are you sure?
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={clearing}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-700 ${adminPillButton} disabled:opacity-50`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearData}
                  disabled={clearing}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {clearing ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    "Yes, delete all"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-[20px] bg-red-50 text-red-500 font-semibold text-sm hover:bg-red-100 transition-colors shadow-admin-item"
      >
        <LogOut size={18} />
        Sign Out
      </button>

      <p className="text-center text-xs text-gray-400 pb-2">
        Giveaway Admin v1.0.0
      </p>
    </div>
  );
}
