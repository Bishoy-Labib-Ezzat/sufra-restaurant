import { useState } from 'react';
import { cn } from '@/shared/lib/cn';

export interface ColumnDatum {
  key: string;
  /** Axis label. */
  label: string;
  /** Full label for the tooltip and the data table. */
  longLabel: string;
  value: number;
  /** Secondary line in the tooltip. */
  detail?: string;
}

interface ColumnChartProps {
  data: ColumnDatum[];
  caption: string;
  formatValue: (value: number) => string;
  formatTick: (value: number) => string;
  /** The column the story is about: drawn in the accent and labelled on its cap. */
  highlightKey?: string;
  integer?: boolean;
  height?: number;
}

/** Ticks on clean steps (1, 2, 2.5, 5 × 10ⁿ) from zero up to just above the max. */
function niceTicks(max: number, integer: boolean, target = 4) {
  if (max <= 0) return [0, 1];
  const raw = max / target;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const normalized = raw / magnitude;
  let step = (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10) * magnitude;
  if (integer) step = Math.max(1, Math.ceil(step));
  const top = Math.ceil(max / step) * step;
  return Array.from({ length: Math.round(top / step) + 1 }, (_, index) => index * step);
}

/**
 * Single-series column chart in plain HTML. One baseline, thin rounded columns,
 * hairline grid, per-column tooltip on hover and focus, and a data table for screen readers.
 */
export function ColumnChart({ data, caption, formatValue, formatTick, highlightKey, integer = false, height = 200 }: ColumnChartProps) {
  const [active, setActive] = useState<string | null>(null);
  const ticks = niceTicks(Math.max(0, ...data.map((datum) => datum.value)), integer);
  const top = ticks[ticks.length - 1];

  return (
    <figure className="flex flex-col gap-2">
      <div className="relative" style={{ height }}>
        <div className="absolute inset-y-0 left-0 w-10" aria-hidden>
          {ticks.map((tick) => (
            <span
              key={tick}
              className="absolute right-2 translate-y-1/2 font-mono text-[11px] text-muted tabular"
              style={{ bottom: `${(tick / top) * 100}%` }}
            >
              {formatTick(tick)}
            </span>
          ))}
        </div>
        <div className="absolute inset-y-0 right-0 left-10">
          {ticks.map((tick) => (
            <div key={tick} aria-hidden className="absolute inset-x-0 border-t border-line" style={{ bottom: `${(tick / top) * 100}%` }} />
          ))}
          <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}>
            {data.map((datum) => {
              const percent = (datum.value / top) * 100;
              const isActive = active === datum.key;
              const highlighted = datum.key === highlightKey;
              return (
                <button
                  key={datum.key}
                  type="button"
                  aria-label={`${datum.longLabel}: ${formatValue(datum.value)}${datum.detail ? `, ${datum.detail}` : ''}`}
                  onMouseEnter={() => setActive(datum.key)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(datum.key)}
                  onBlur={() => setActive(null)}
                  className="group relative flex h-full cursor-default items-end justify-center px-[1px] focus-visible:outline-none"
                >
                  <span
                    className={cn(
                      'w-full max-w-6 rounded-t-[4px] transition-opacity duration-150',
                      highlighted ? 'bg-tomato' : 'bg-ink',
                      active && !isActive && 'opacity-35',
                      'group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-tomato',
                    )}
                    style={{ height: datum.value > 0 ? `max(${percent}%, 3px)` : 0 }}
                  />
                  {highlighted && !isActive && datum.value > 0 && (
                    <span
                      className="absolute font-mono text-xs font-semibold text-ink tabular"
                      style={{ bottom: `calc(${percent}% + 6px)` }}
                    >
                      {formatTick(datum.value)}
                    </span>
                  )}
                  {isActive && (
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute left-1/2 z-10 flex -translate-x-1/2 flex-col items-start rounded-field bg-ink px-3 py-2 text-left text-xs whitespace-nowrap text-paper shadow-float"
                      style={{ bottom: `calc(${Math.min(percent, 72)}% + 10px)` }}
                    >
                      <span className="font-semibold">{datum.longLabel}</span>
                      <span className="font-mono text-paper/80">{formatValue(datum.value)}</span>
                      {datum.detail && <span className="text-paper/70">{datum.detail}</span>}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="ml-10 grid" aria-hidden style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}>
        {data.map((datum, index) => (
          <span
            key={datum.key}
            className={cn(
              'truncate text-center text-[11px] text-muted',
              datum.key === highlightKey && 'font-semibold text-ink',
              // Dense axes on phones: label every other column so labels never collide.
              data.length > 8 && index % 2 === 1 && datum.key !== highlightKey && 'max-sm:invisible',
            )}
          >
            {datum.label}
          </span>
        ))}
      </div>
      <figcaption className="sr-only">{caption}</figcaption>
      {/* A <table> ignores the 1px width of .sr-only and would widen the page, so the wrapper is hidden instead. */}
      <div className="sr-only">
        <table>
          <caption>{caption}</caption>
          <tbody>
            {data.map((datum) => (
              <tr key={datum.key}>
                <th scope="row">{datum.longLabel}</th>
                <td>{formatValue(datum.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
