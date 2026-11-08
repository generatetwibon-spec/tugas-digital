"use client";
import { useState, useEffect, useCallback } from 'react';

interface UseTimerReturn {
  timeLeft: number;
  minutes: number;
  seconds: number;
  isWarning: boolean;
  formatTime: () => string;
}

export function useTimer(endTime: Date, onTimeUp: () => void): UseTimerReturn {
  const calculateTimeLeft = useCallback(() => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const diff = Math.max(0, Math.floor((end - now) / 1000));
    return diff;
  }, [endTime]);

  const [timeLeft, setTimeLeft] = useState<number>(() => calculateTimeLeft());

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onTimeUp();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateTimeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isWarning = timeLeft < 300 && timeLeft > 0; // less than 5 minutes

  const formatTime = useCallback(() => {
    const m = String(minutes).padStart(2, '0');
    const s = String(seconds).padStart(2, '0');
    return `${m}:${s}`;
  }, [minutes, seconds]);

  return { timeLeft, minutes, seconds, isWarning, formatTime };
}
