import { useEffect, useRef, useState } from "react";

const MATRIX_COLS = 40;
const MATRIX_ROWS = 25;

const PIXEL_MATRIX: string[] = [
  "0000000000000000000010000000000100001010",
  "0000000000000000000000100000010001000100",
  "0000000000000000000000000000100100110001",
  "0000000000000000000000100001001010101100",
  "0000000000000000000000010010011011010010",
  "0000000000000000000001001011001011101101",
  "0000000000000000000000001100101101110100",
  "0000000000000000000000100101011011111010",
  "0000000000000000000000000011010111011101",
  "0000000000000000000000010101110111110110",
  "0000000000000000000000010011011110111100",
  "0000000000000000000000110101111111101101",
  "0000000000000000000001011110111111011110",
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

export function PixelReveal({
  src,
  alt,
  started = true,
}: {
  src: string;
  alt: string;
  started?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const phase2StartedRef = useRef(false);

  const [grid, setGrid] = useState({
    cols: 40,
    rows: 25,
    cellSize: 24,
  });

  const [phase1Rows, setPhase1Rows] = useState(0);
  const [phase2Rows, setPhase2Rows] = useState(0);
  const [isFullySettled, setIsFullySettled] = useState(false);

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

  // Phase 1: Reveal rows strictly one by one from bottom in full, vibrant color (observable cadence)
  useEffect(() => {
    if (!started || phase1Rows >= grid.rows) return;
    const buildStepMs = Math.max(85, Math.min(130, Math.round(2800 / Math.max(1, grid.rows))));
    const interval = setInterval(() => {
      setPhase1Rows((prev) => {
        const next = prev + 1;
        if (next >= grid.rows) {
          clearInterval(interval);
          return grid.rows;
        }
        return next;
      });
    }, buildStepMs);

    return () => clearInterval(interval);
  }, [grid.rows, phase1Rows, started]);

  // Phase 2: Accelerating batch sweep (1 -> 2 -> 4 rows per frame, capped at 4)
  useEffect(() => {
    if (!started || phase1Rows < grid.rows || phase2StartedRef.current) return;
    phase2StartedRef.current = true;

    let rafId: number | null = null;
    let finishTimeoutId: ReturnType<typeof setTimeout> | null = null;

    // 550ms deliberate pause after Phase 1 completes before Phase 2 begins
    const timeoutId = setTimeout(() => {
      let currentBatch = 1;
      let currentRow = 0;

      const step = () => {
        currentRow = Math.min(grid.rows, currentRow + currentBatch);
        setPhase2Rows(currentRow);

        if (currentRow < grid.rows) {
          // Accelerating progression: 1 row, then 2 rows, then 4 rows (capped at 4)
          if (currentBatch === 1) {
            currentBatch = 2;
          } else if (currentBatch === 2) {
            currentBatch = 4;
          }
          rafId = requestAnimationFrame(step);
        } else {
          finishTimeoutId = setTimeout(() => {
            setIsFullySettled(true);
          }, 120);
        }
      };

      rafId = requestAnimationFrame(step);
    }, 550);

    return () => {
      clearTimeout(timeoutId);
      if (finishTimeoutId) clearTimeout(finishTimeoutId);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [grid.rows, phase1Rows, started]);

  // Pointer tracking & autonomous ambient wandering beacon for mobile/idle
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const { cols, rows, cellSize } = grid;
    const hoverRadius = Math.max(140, cellSize * 6.5);
    const hoverRadiusSq = hoverRadius * hoverRadius;

    // Cache active cell elements and their physical center coordinates
    const allCells = Array.from(el.children) as HTMLElement[];
    const activeCellItems: {
      el: HTMLElement;
      cx: number;
      cy: number;
      f: number;
    }[] = [];

    allCells.forEach((cell, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      if (isCellActive(c, r, cols, rows)) {
        activeCellItems.push({
          el: cell,
          cx: (c + 0.5) * cellSize,
          cy: (r + 0.5) * cellSize,
          f: 0,
        });
      }
    });

    const gridW = cols * cellSize;
    const gridH = rows * cellSize;
    const centerX = gridW * 0.7;
    const centerY = gridH * 0.62;
    const spanX = gridW * 0.2;
    const spanY = gridH * 0.22;

    let fx = centerX;
    let fy = centerY;
    let currentIntensity = 0;
    let isUserActive = false;
    let userMouseX = centerX;
    let userMouseY = centerY;
    let lastUserMoveTime = performance.now();
    let settledTimestamp = 0;
    const IDLE_TIMEOUT_MS = 2500;
    const BEACON_INITIAL_DELAY_MS = 3500;

    let rafId = 0;

    const onPointerMove = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) {
        isUserActive = false;
        return;
      }
      userMouseX = e.clientX - b.left;
      userMouseY = e.clientY - b.top;
      isUserActive = true;
      lastUserMoveTime = performance.now();
    };

    const onPointerLeave = () => {
      isUserActive = false;
    };

    const animate = (time: number) => {
      const now = performance.now();

      if (isFullySettled && settledTimestamp === 0) {
        settledTimestamp = now;
        lastUserMoveTime = now;
      }

      const isIdle = !isUserActive || now - lastUserMoveTime > IDLE_TIMEOUT_MS;
      // Allow grid to rest completely calm for 3.5s after Phase 3 before any ambient beacon drifts
      const canBeacon =
        isFullySettled && settledTimestamp > 0 && now - settledTimestamp > BEACON_INITIAL_DELAY_MS;

      let targetX = fx;
      let targetY = fy;
      let targetIntensity = 0;

      if (!isIdle) {
        targetX = userMouseX;
        targetY = userMouseY;
        targetIntensity = 1.0;
        fx += (targetX - fx) * 0.45;
        fy += (targetY - fy) * 0.45;
        currentIntensity += (targetIntensity - currentIntensity) * 0.15;
      } else if (canBeacon) {
        targetX =
          centerX + Math.cos(time * 0.0006) * spanX + Math.sin(time * 0.0003) * (spanX * 0.4);
        targetY =
          centerY + Math.sin(time * 0.0008) * spanY + Math.cos(time * 0.0005) * (spanY * 0.3);
        targetIntensity = 0.88;
        fx += (targetX - fx) * 0.04;
        fy += (targetY - fy) * 0.04;
        currentIntensity += (targetIntensity - currentIntensity) * 0.04;
      } else {
        targetIntensity = 0;
        currentIntensity += (targetIntensity - currentIntensity) * 0.1;
      }

      for (const item of activeCellItems) {
        const dx = item.cx - fx;
        const dy = item.cy - fy;
        const dSq = dx * dx + dy * dy;

        if (dSq > hoverRadiusSq || currentIntensity <= 0.01) {
          if (item.f > 0) {
            item.f = 0;
            item.el.style.setProperty("--f", "0");
            item.el.style.zIndex = "1";
          }
          continue;
        }

        const dist = Math.sqrt(dSq);
        const norm = Math.max(0, 1 - dist / hoverRadius);
        const newF = Math.pow(norm, 0.75) * currentIntensity;

        if (Math.abs(newF - item.f) > 0.015 || (newF === 0 && item.f > 0)) {
          item.f = newF;
          item.el.style.setProperty("--f", newF.toFixed(3));
          item.el.style.zIndex = newF > 0.08 ? "10" : "1";
        }
      }

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerdown", onPointerMove);
    window.addEventListener("pointerleave", onPointerLeave);
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      activeCellItems.forEach((item) => {
        item.el.style.setProperty("--f", "0");
        item.el.style.zIndex = "1";
      });
    };
  }, [grid, isFullySettled]);

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
          const isPhase1 = rowFromBottom < phase1Rows;
          const isPhase2 = rowFromBottom < phase2Rows;

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

          let cellAnimation = "none";
          if (isPhase1 && !isPhase2) {
            cellAnimation = `pixel-fluctuate ${animDuration.toFixed(2)}s ease-in-out ${animDelay.toFixed(2)}s infinite`;
          }

          let filterValue = "grayscale(1) brightness(0.78)";
          if (!isPhase1) {
            filterValue = "grayscale(1) brightness(0.78)";
          } else if (!isPhase2) {
            filterValue = "grayscale(1) brightness(0.78)";
          } else if (!isFullySettled) {
            // Phase 2: Crisp monochrome! Grayscale applied, no blur!
            filterValue = "grayscale(1) brightness(0.9) contrast(1.05)";
          } else {
            // Settled: crisp monochrome, cursor hover & wandering beacon reveal vibrant color (no blur)
            filterValue = `grayscale(calc(1 - var(--f, 0))) brightness(calc(0.9 + var(--f, 0) * 0.35)) saturate(calc(1 + var(--f, 0) * 0.5)) contrast(calc(1.05 + var(--f, 0) * 0.1))`;
          }

          return (
            <span
              key={i}
              className="block will-change-transform"
              style={{
                width: `${grid.cellSize}px`,
                height: `${grid.cellSize}px`,
                backgroundImage: `url(${src})`,
                backgroundSize: `${grid.cols * grid.cellSize}px ${grid.rows * grid.cellSize}px`,
                backgroundPosition: `-${c * grid.cellSize}px -${r * grid.cellSize}px`,
                opacity: isPhase1 ? 1 : 0,
                filter: filterValue,
                transform: isPhase1
                  ? isFullySettled
                    ? "scale(calc(1 + var(--f, 0) * 0.04))"
                    : "scale(1)"
                  : "scale(0.85)",
                boxShadow: isFullySettled
                  ? "0 0 calc(var(--f, 0) * 12px) rgba(229, 89, 52, calc(var(--f, 0) * 0.22))"
                  : "none",
                animation: cellAnimation,
                transition: isPhase1
                  ? "filter 120ms ease, opacity 160ms ease, transform 160ms ease, box-shadow 240ms ease"
                  : "opacity 120ms ease, transform 120ms ease",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
