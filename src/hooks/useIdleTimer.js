import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'bloom_last_activity_timestamp';
const DEFAULT_IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const DEFAULT_WARNING_DURATION_MS = 60 * 1000;  // 60 seconds

export function useIdleTimer({
  timeoutMs = DEFAULT_IDLE_TIMEOUT_MS,
  warningDurationMs = DEFAULT_WARNING_DURATION_MS,
  onTimeout,
  enabled = true,
} = {}) {
  const [isWarning, setIsWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(Math.floor(warningDurationMs / 1000));

  const lastActivityRef = useRef(Date.now());
  const lastEventThrottleRef = useRef(Date.now());
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  // Update activity timestamp in local ref and synchronized localStorage
  const recordActivity = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    try {
      localStorage.setItem(STORAGE_KEY, now.toString());
    } catch {
      // Ignore localStorage errors
    }

    if (isWarning) {
      setIsWarning(false);
    }
  }, [isWarning]);

  // Throttle event listener updates (at most once every 1000ms)
  const handleUserActivity = useCallback(() => {
    if (!enabled) return;
    const now = Date.now();
    if (now - lastEventThrottleRef.current > 1000) {
      lastEventThrottleRef.current = now;
      recordActivity();
    }
  }, [enabled, recordActivity]);

  // Handle cross-tab activity updates
  useEffect(() => {
    if (!enabled) return;

    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const remoteTime = parseInt(e.newValue, 10);
        if (!isNaN(remoteTime) && remoteTime > lastActivityRef.current) {
          lastActivityRef.current = remoteTime;
          setIsWarning(false);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [enabled]);

  // Attach DOM interaction event listeners
  useEffect(() => {
    if (!enabled) return;

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart', 'pointerdown'];
    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Record initial timestamp on mount
    recordActivity();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [enabled, handleUserActivity, recordActivity]);

  // Timer check loop (runs every second)
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;

      const warningThreshold = timeoutMs - warningDurationMs;

      if (timeSinceLastActivity >= timeoutMs) {
        setIsWarning(false);
        if (onTimeoutRef.current) {
          onTimeoutRef.current();
        }
      } else if (timeSinceLastActivity >= warningThreshold) {
        const remainingMs = timeoutMs - timeSinceLastActivity;
        const secs = Math.max(1, Math.ceil(remainingMs / 1000));
        setIsWarning(true);
        setRemainingSeconds(secs);
      } else {
        if (isWarning) {
          setIsWarning(false);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled, timeoutMs, warningDurationMs, isWarning]);

  const resetIdleTimer = useCallback(() => {
    recordActivity();
  }, [recordActivity]);

  return {
    isWarning,
    remainingSeconds,
    resetIdleTimer,
  };
}
