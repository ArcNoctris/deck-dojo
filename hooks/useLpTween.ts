import { useEffect, useRef, useState } from 'react';

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/** Smoothly animates a displayed number toward `target` whenever it changes. */
export function useLpTween(target: number, duration = 900) {
  const [shown, setShown] = useState(target);
  const currentRef = useRef(target);

  useEffect(() => {
    const from = currentRef.current;
    if (from === target) return;

    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const val = Math.round(from + (target - from) * ease(p));
      currentRef.current = val;
      setShown(val);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return shown;
}
