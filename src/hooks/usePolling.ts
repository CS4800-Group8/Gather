// AnN add: Custom polling hook for reusable data fetching on 11/19
// Used for notifications, chat messages, and any real-time data that needs periodic updates

import { useEffect, useRef } from 'react';

/**
 * Custom hook for polling data at regular intervals
 *
 * @param fetchFn - Async function to call on each poll
 * @param interval - Polling interval in milliseconds (e.g., 3000 = 3 seconds)
 * @param enabled - Whether polling is active (default: true)
 *
 * @example
 * // Poll notifications every 5 seconds
 * usePolling(fetchNotifications, 5000, !!user?.id);
 *
 * @example
 * // Poll chat messages every 3 seconds
 * usePolling(fetchMessages, 3000, !!conversationId);
 */
export function usePolling(
  fetchFn: () => Promise<void>,
  interval: number,
  enabled: boolean = true
) {
  const savedCallback = useRef(fetchFn);

  // Update ref when fetchFn changes to avoid stale closures
  useEffect(() => {
    savedCallback.current = fetchFn;
  }, [fetchFn]);

  // AnN add: Main polling effect on 11/19
  useEffect(() => {
    if (!enabled) return;

    // Call immediately on mount
    savedCallback.current();

    // Then poll at specified interval
    const timer = setInterval(() => {
      savedCallback.current();
    }, interval);

    // Cleanup on unmount
    return () => clearInterval(timer);
  }, [interval, enabled]);
}
