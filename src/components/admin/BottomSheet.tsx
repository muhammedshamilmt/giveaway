"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function BottomSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
}: BottomSheetProps) {
  const [visible, setVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(open);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      document.body.style.overflow = "hidden";
      const t = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(t);
    } else {
      document.body.style.overflow = "";
      setVisible(false);
      const t = setTimeout(() => setShouldRender(false), 400);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-hidden
      />
      <div
        className={`relative w-full max-w-lg bg-white rounded-t-[28px] shadow-admin-sheet max-h-[85vh] flex flex-col transition-transform duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {(title || subtitle) && (
          <div className="px-6 pt-2 pb-4 text-center shrink-0">
            {title && (
              <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F0F0F0] flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors shadow-admin-item"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="overflow-y-auto px-6 pb-8 flex-1">{children}</div>
      </div>
    </div>
  );
}
