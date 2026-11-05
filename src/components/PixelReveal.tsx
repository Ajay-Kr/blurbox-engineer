import { useEffect, useRef, useState } from "react";

const MATRIX_COLS = 40;
const MATRIX_ROWS = 25;

const PIXEL_MATRIX: string[] = [
  "0000000000000000000111000000000000000000",
  "0000000000000000000010000000000000000000",
  "0000000000000000000000000000000000000000",
  "0000000000000000000000100000000000000000",
  "0000000000000000000000001001000000000000",
  "0000000000000000000000000101100000000000",
  "0000000000000000000000000110000000000000",
  "0000000000000000000000000100000010000000",
  "0000000000000000000000000000000000010000",
  "0000000000000000000000000000000010110000",
  "0000000000000000000000000000000000000000",
  "0000000000000000000000000000000000000000",
  "0000000000000000000000000000000000000000",
  "0000000000000000000000101000101110010101",
  "0000000000000000010000100011110001011100",
  "0000000000000001000010101101111101101110",
  "0000000000000000101001010101111111111111",
  "0000000000000000011011111111111111111111",
  "0100000000000100011111111111111111111111",
  "1010000000000011101111111111111111111111",
  "0000000001011111111111111111111111111111",
  "0111100110011111111111111111111111111111",
  "0111101111111111111111111111111111111111",
  "1111111111111111111111111111111111111111",
  "1111111111111111111111111111111111111111",
];

function isCellActive(c: number, r: number, cols: number, rows: number): boolean {
  const u = cols > 1 ? c / (cols - 1) : 0;
  const v = rows > 1 ? r / (rows - 1) : 0;
  const mc = Math.min(MATRIX_COLS - 1, Math.floor(u * MATRIX_COLS));
  const mr = Math.min(MATRIX_ROWS - 1, Math.floor(v * MATRIX_ROWS));
  return PIXEL_MATRIX[mr]?.[mc] === "1";
}

const MIN_CELL_SIZE = 14;
const MAX_CELL_SIZE = 28;

export function PixelReveal({ src, alt }: { src: string; alt: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [grid, setGrid] = useState({
    cols: 40,
    rows: 25,
    cellSize: 24,
  });

  const [revealedRows, setRevealedRows] = useState(0);
  const [settledRows, setSettledRows] = useState(0);

  // Compute square cells dynamically according to container dimensions with a max cap
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;

      const raw = Math.floor(w / 40);
      const cellSize = Math.max(MIN_CELL_SIZE, Math.min(MAX_CELL_SIZE, raw));
      const cols = Math.ceil(w / cellSize);
      const rows = Math.ceil(h / cellSize);

      setGrid({ cols, rows, cellSize });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Wave 1: Reveal strictly one row at a time starting from bottom (slower, observable cadence)
  useEffect(() => {
    if (revealedRows >= grid.rows) return;
    const buildStepMs = Math.max(85, Math.min(130, Math.round(2800 / Math.max(1, grid.rows))));
    const interval = setInterval(() => {
      setRevealedRows((prev) => {
        const next = prev + 1;
        if (next >= grid.rows) {
          clearInterval(interval);
          return grid.rows;
        }
        return next;
      });
    }, buildStepMs);

    return () => clearInterval(interval);
  }, [grid.rows, revealedRows]);

  // Wave 2: Settle strictly one row at a time starting from bottom (faster sweep once all rows rendered)
  useEffect(() => {
    if (revealedRows < grid.rows || settledRows >= grid.rows) return;

    const buildStepMs = Math.max(85, Math.min(130, Math.round(2800 / Math.max(1, grid.rows))));
    const settleStepMs = Math.max(30, Math.round(buildStepMs * 0.4));

    let intervalId: ReturnType<typeof setInterval> | null = null;
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        setSettledRows((prev) => {
          const next = prev + 1;
          if (next >= grid.rows) {
            if (intervalId) clearInterval(intervalId);
            return grid.rows;
          }
          return next;
        });
      }, settleStepMs);
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [grid.rows, revealedRows, settledRows]);

  // Pointer tracking in physical pixels for a true geometric circle
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const cells = Array.from(el.children) as HTMLElement[];
    const { cols, cellSize } = grid;
    const hoverRadius = Math.max(120, cellSize * 5.5);

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

        const mouseX = e.clientX - b.left;
        const mouseY = e.clientY - b.top;

        cells.forEach((cell, i) => {
          const c = i % cols;
          const r = Math.floor(i / cols);
          const cellCenterX = (c + 0.5) * cellSize;
          const cellCenterY = (r + 0.5) * cellSize;

          const dist = Math.hypot(cellCenterX - mouseX, cellCenterY - mouseY);
          const f = Math.max(0, 1 - dist / hoverRadius);
          cell.style.setProperty("--f", f.toFixed(3));
        });
      });
    };

    const onLeave = () => cells.forEach((c) => c.style.setProperty("--f", "0"));
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [grid]);

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-end justify-end overflow-hidden"
      role="img"
      aria-label={alt}
    >
      <div
        ref={gridRef}
        className="grid gap-px bg-paper/25"
        style={{
          gridTemplateColumns: `repeat(${grid.cols}, ${grid.cellSize}px)`,
          gridAutoRows: `${grid.cellSize}px`,
        }}
      >
        {Array.from({ length: grid.cols * grid.rows }).map((_, i) => {
          const c = i % grid.cols;
          const r = Math.floor(i / grid.cols);
          const active = isCellActive(c, r, grid.cols, grid.rows);
          const rowFromBottom = grid.rows - 1 - r;
          const isRevealed = rowFromBottom < revealedRows;
          const isSettled = rowFromBottom < settledRows;

          if (!active) {
            return (
              <span
                key={i}
                className="pointer-events-none block"
                style={{
                  width: `${grid.cellSize}px`,
                  height: `${grid.cellSize}px`,
                  opacity: 0,
                }}
              />
            );
          }

          const animDuration = 0.8 + ((i * 37) % 7) * 0.15;
          const animDelay = ((i * 73) % 11) * 0.08;

          return (
            <span
              key={i}
              className="block"
              style={{
                width: `${grid.cellSize}px`,
                height: `${grid.cellSize}px`,
                backgroundImage: `url(${src})`,
                backgroundSize: `${grid.cols * grid.cellSize}px ${grid.rows * grid.cellSize}px`,
                backgroundPosition: `-${c * grid.cellSize}px -${r * grid.cellSize}px`,
                opacity: isRevealed ? 1 : 0,
                filter: isRevealed
                  ? `blur(calc((1 - var(--f, 0)) * 3px)) grayscale(calc(1 - var(--f, 0)))`
                  : "blur(6px) grayscale(1)",
                transform: isRevealed ? "scale(1)" : "scale(0.85)",
                animation:
                  isRevealed && !isSettled
                    ? `pixel-fluctuate ${animDuration.toFixed(2)}s ease-in-out ${animDelay.toFixed(2)}s infinite`
                    : "none",
                transition: isSettled
                  ? "filter 300ms ease"
                  : "opacity 120ms ease, transform 120ms ease",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
