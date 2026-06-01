import { useState, useEffect, useCallback } from "react";

/**
 * Countdown timer for OTP resend (default 30s).
 */
export function useOtpTimer(initialSeconds = 30) {
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return undefined;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const start = useCallback(() => {
    setCountdown(initialSeconds);
  }, [initialSeconds]);

  const reset = useCallback(() => {
    setCountdown(0);
  }, []);

  return {
    countdown,
    start,
    reset,
    canResend: countdown <= 0,
  };
}
