"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export default function AnimatedCounter({
  value,
  duration = 1000,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
}: Props) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);
  const startValueRef = useRef(0);

  useEffect(() => {
    startRef.current = null;
    startValueRef.current = display;

    let rafId: number;

    function animate(timestamp: number) {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic for a smooth "settle" feel
      const eased = 1 - Math.pow(1 - progress, 3);

      const current =
        startValueRef.current + (value - startValueRef.current) * eased;
      setDisplay(current);

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        setDisplay(value);
      }
    }

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  const formatted = display.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}