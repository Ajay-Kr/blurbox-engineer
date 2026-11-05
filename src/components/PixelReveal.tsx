import { useEffect, useRef, useState } from "react";

const COLS = 40;
const ROWS = 25;

/**
 * Each cell is an autonomous "pixel": it crops its own slice of the image and
 * carries its own blur, opacity and scale. Cells settle in a scattered order on
 * load and react individually to the cursor like a lens.
 */
export function PixelReveal({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [delays] = useState(() =>
    Array.from({ length: COLS * ROWS }, (_, i) => {
      const c = i % COLS;
      const r = Math.floor(i / COLS);
      // diagonal sweep + noise
      return (c / COLS) * 900 + (r / ROWS) * 500 + ((i * 9301 + 49297) % 233) * 3;
    }),
  );
  const [ready, setReady] = useState(false);
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSettled(true), 2600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cells = Array.from(el.children) as HTMLElement[];
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const b = el.getBoundingClientRect();
        if (
          e.clientX < b.left ||
          e.clientX > b.right ||
          e.clientY < b.top ||
          e.clientY > b.bottom
        ) {
          cells.forEach((cell) => cell.style.setProperty("--f", "0"));
          return;
        }
        const x = ((e.clientX - b.left) / b.width) * COLS;
        const y = ((e.clientY - b.top) / b.height) * ROWS;
        cells.forEach((cell, i) => {
          const d = Math.hypot((i % COLS) + 0.5 - x, Math.floor(i / COLS) + 0.5 - y);
          const f = Math.max(0, 1 - d / 5);
          cell.style.setProperty("--f", f.toFixed(3));
        });
      });
    };
    const onLeave = () => cells.forEach((c) => c.style.setProperty("--f", "0"));
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden" role="img" aria-label={alt}>
      {/* Clear background image revealed as overlay blocks dissolve */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
          opacity: settled ? 1 : 0,
        }}
      />

      {/* Interactive pixel mosaic overlay */}
      <div
        ref={ref}
        className="relative grid h-full w-full gap-px bg-paper/25"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        }}
      >
        {delays.map((delay, i) => {
          const c = i % COLS;
          const r = Math.floor(i / COLS);
          return (
            <span
              key={i}
              className="block"
              style={{
                backgroundImage: `url(${src})`,
                backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
                backgroundPosition: `${(c / (COLS - 1)) * 100}% ${(r / (ROWS - 1)) * 100}%`,
                opacity: ready ? `calc(1 - var(--f, 0) * 0.85)` : 0,
                filter: ready
                  ? `blur(calc((1 - var(--f, 0)) * 3px)) grayscale(calc(1 - var(--f, 0)))`
                  : "blur(6px) grayscale(1)",
                transform: ready ? "scale(1)" : "scale(0.4)",
                transition: settled
                  ? "opacity 300ms ease, filter 300ms ease"
                  : `opacity 700ms ease ${delay}ms, filter 700ms ease ${delay}ms, transform 700ms ease ${delay}ms`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
