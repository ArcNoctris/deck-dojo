import { useCallback, useRef } from 'react';

interface UseCardPressOptions {
  onTap: () => void;
  onHold: () => void;
  holdDelayMs?: number;
}

/**
 * Tap vs hold-to-preview, shared by every card list/grid (search results and
 * deck contents). A hold fires `onHold` and suppresses the following click so
 * tap-to-add/remove doesn't also fire.
 */
export function useCardPress({ onTap, onHold, holdDelayMs = 500 }: UseCardPressOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedHoldRef = useRef(false);

  const cancel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const onPointerDown = useCallback(() => {
    firedHoldRef.current = false;
    cancel();
    timerRef.current = setTimeout(() => {
      firedHoldRef.current = true;
      onHold();
    }, holdDelayMs);
  }, [onHold, holdDelayMs, cancel]);

  const onClick = useCallback((e: React.MouseEvent) => {
    if (firedHoldRef.current) {
      e.preventDefault();
      e.stopPropagation();
      firedHoldRef.current = false;
      return;
    }
    onTap();
  }, [onTap]);

  return {
    onPointerDown,
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onClick,
  };
}
