import { useState, useEffect } from 'react';

/**
 * Defers switching a boolean state to `true` by `delayMs`.
 * Instantly switches to `false`.
 * This prevents loading states (like skeletons) from flashing on fast connections.
 */
export function useDelayedState(isActive: boolean, delayMs: number = 300): boolean {
  const [delayedState, setDelayedState] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isActive) {
      timeoutId = setTimeout(() => {
        setDelayedState(true);
      }, delayMs);
    } else {
      setDelayedState(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isActive, delayMs]);

  return delayedState;
}
