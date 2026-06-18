"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { ChevronsRight } from "lucide-react";

interface SwipeToPayProps {
  onComplete: () => void;
  disabled?: boolean;
}

const HANDLE_WIDTH = 52;
const THRESHOLD = 0.85;

export default function SwipeToPay({ onComplete, disabled }: SwipeToPayProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [completed, setCompleted] = useState(false);
  const startXRef = useRef(0);
  const dragXRef = useRef(0);
  const maxDragRef = useRef(0);

  const getMaxDrag = useCallback(() => {
    if (!trackRef.current) return 0;
    return trackRef.current.offsetWidth - HANDLE_WIDTH - 8;
  }, []);

  const snapBack = useCallback(() => {
    setDragX(0);
    dragXRef.current = 0;
  }, []);

  const animateToEnd = useCallback(() => {
    const max = getMaxDrag();
    setDragX(max);
    dragXRef.current = max;
    setCompleted(true);
    setTimeout(() => onComplete(), 300);
  }, [getMaxDrag, onComplete]);

  const handleStart = useCallback(
    (clientX: number) => {
      if (disabled || completed) return;
      setIsDragging(true);
      startXRef.current = clientX - dragXRef.current;
      maxDragRef.current = getMaxDrag();
    },
    [disabled, completed, getMaxDrag]
  );

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDragging || disabled || completed) return;
      const max = maxDragRef.current;
      const next = Math.max(0, Math.min(clientX - startXRef.current, max));
      dragXRef.current = next;
      setDragX(next);
    },
    [isDragging, disabled, completed]
  );

  const handleEnd = useCallback(() => {
    if (!isDragging || completed) return;
    setIsDragging(false);
    const max = maxDragRef.current;
    if (max > 0 && dragXRef.current / max >= THRESHOLD) {
      animateToEnd();
    } else {
      snapBack();
    }
  }, [isDragging, completed, animateToEnd, snapBack]);

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onMouseUp = () => handleEnd();
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const onTouchEnd = () => handleEnd();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  const fillWidth = dragX + HANDLE_WIDTH;

  return (
    <div
      ref={trackRef}
      className={`relative h-[52px] rounded-full overflow-hidden select-none bg-[#EBEBEB] ${
        disabled || completed ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <div
        className="absolute inset-y-1 left-1 rounded-full transition-none"
        style={{
          width: `${fillWidth}px`,
          background: "#1a1a1a",
          opacity: dragX > 0 ? 1 : 0,
        }}
      />

      <span
        className={`absolute inset-0 flex items-center justify-center text-[14px] font-semibold pointer-events-none transition-opacity ${
          dragX > 20 ? "text-white/90 opacity-100" : "text-gray-500 opacity-100"
        }`}
      >
        Swipe To Pay
      </span>

      <div
        className="absolute top-1 left-1 h-[calc(100%-8px)] rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing z-10 bg-black shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
        style={{
          width: HANDLE_WIDTH,
          transform: `translateX(${dragX}px)`,
          transition: isDragging
            ? "none"
            : "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          handleStart(e.clientX);
        }}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      >
        <ChevronsRight size={20} className="text-white" strokeWidth={2.5} />
      </div>
    </div>
  );
}
