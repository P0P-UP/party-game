import { useState, useEffect, useRef } from 'react';
import { playTick, playUrgentTick } from '../utils/sounds';

/**
 * useTimer — client-side visual countdown timer.
 *
 * Syncs to the server's authoritative timer value on each `timer_tick` event.
 * Plays tick sounds and fires onExpire callback.
 *
 * @param {number} initialValue - Starting timer value in seconds
 * @param {function} onExpire - Called when timer reaches 0
 * @returns {{ value: number, percentage: number }}
 */
export function useTimer(initialValue = 0, onExpire) {
  const [value, setValue] = useState(initialValue);
  const maxRef = useRef(initialValue);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  // Update max when initialValue changes (new round)
  useEffect(() => {
    maxRef.current = initialValue;
    setValue(initialValue);
  }, [initialValue]);

  // Play tick sound whenever value changes
  useEffect(() => {
    if (value <= 0) {
      onExpireRef.current?.();
      return;
    }
    if (value <= 5) {
      playUrgentTick();
    } else if (value <= 10) {
      playTick();
    }
  }, [value]);

  const percentage = maxRef.current > 0 ? (value / maxRef.current) * 100 : 0;

  return { value, setValue, percentage };
}
