import React from "react";
import Image from "next/image";

interface PromoBannerProps {
  title?: string;
  ctaLabel?: string;
}

export default function PromoBanner({
  title = "Invite a friend and get $10 in BTC",
  ctaLabel = "share invite",
}: PromoBannerProps) {
  return (
    <div className="relative rounded-[24px] overflow-hidden bg-black min-h-[130px] shadow-admin-elevated">
      <Image
        src="/assets/image.png"
        alt=""
        width={400}
        height={200}
        className="absolute right-0 top-0 h-full w-[55%] object-cover object-right pointer-events-none select-none"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />

      <div className="relative z-10 p-5 pr-24 flex flex-col justify-center min-h-[130px]">
        <p className="text-white font-bold text-[15px] leading-snug max-w-[200px]">
          {title}
        </p>
        <button className="mt-3 self-start px-4 py-1.5 rounded-full border border-white/30 text-white text-xs font-medium hover:bg-white/10 transition-colors">
          {ctaLabel} &gt;
        </button>
      </div>
    </div>
  );
}
