import { useState, useEffect } from 'react';

/**
 * Ensures a loading state displays for a minimum amount of time to prevent
 * glitchy UI flashes on fast connections. If the actual load time exceeds
 * the minimum, the loading state ends immediately.
 * 
 * @param isLoading Actual loading state from the data source
 * @param minDisplayTimeMs Minimum time in ms to display the loading state (default: 400ms)
 * @returns boolean indicating whether the loading state should currently be shown
 */
export function useDelayedLoading(isLoading: boolean, minDisplayTimeMs: number = 400) {
  const [showLoading, setShowLoading] = useState(isLoading);
  const [startTime, setStartTime] = useState<number | null>(isLoading ? Date.now() : null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isLoading) {
      setShowLoading(true);
      setStartTime(Date.now());
    } else if (startTime) {
      const elapsed = Date.now() - startTime;
      if (elapsed < minDisplayTimeMs) {
        timeoutId = setTimeout(() => {
          setShowLoading(false);
          setStartTime(null);
        }, minDisplayTimeMs - elapsed);
      } else {
        setShowLoading(false);
        setStartTime(null);
      }
    } else {
      setShowLoading(false);
    }

    return () => clearTimeout(timeoutId);
  }, [isLoading, startTime, minDisplayTimeMs]);

  return showLoading;
}
