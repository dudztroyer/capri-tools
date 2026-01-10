import { useState, useEffect } from "react";

/**
 * Hook to get current date information that's safe for SSR
 * Returns date values that are consistent between server and client initially,
 * then updates to actual values on the client side
 * 
 * @returns Object with current date information
 */
export function useClientDate() {
  const [dateInfo, setDateInfo] = useState(() => {
    // On server, return safe defaults
    // On client, return actual date (will be updated in useEffect anyway)
    if (typeof window !== "undefined") {
      const now = new Date();
      return {
        now,
        currentMonth: now.getMonth() + 1,
        currentYear: now.getFullYear(),
        currentDay: now.getDate(),
        currentHour: now.getHours(),
        currentMinute: now.getMinutes(),
      };
    }
    // Safe defaults for SSR
    const defaultDate = new Date();
    return {
      now: defaultDate,
      currentMonth: 1,
      currentYear: defaultDate.getFullYear(),
      currentDay: 1,
      currentHour: 0,
      currentMinute: 0,
    };
  });

  useEffect(() => {
    // Update to actual date on client side
    // Use requestAnimationFrame to defer the update and avoid synchronous setState
    const updateDate = () => {
      const now = new Date();
      setDateInfo({
        now,
        currentMonth: now.getMonth() + 1,
        currentYear: now.getFullYear(),
        currentDay: now.getDate(),
        currentHour: now.getHours(),
        currentMinute: now.getMinutes(),
      });
    };
    
    // Defer the update to avoid synchronous setState in effect
    requestAnimationFrame(updateDate);
  }, []);

  return dateInfo;
}

