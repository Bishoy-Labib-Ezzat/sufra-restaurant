import { useEffect, useRef } from 'react';
import { cn } from '@/shared/lib/cn';
import { sectionId, type MenuSection } from '../../lib/menu';

/** Sticky jump-bar. The active pill follows the reader and keeps itself in view horizontally. */
export function CategoryNav({ sections, activeId }: { sections: MenuSection[]; activeId: string | null }) {
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scroller.current;
    const pill = container?.querySelector<HTMLElement>(`[data-target="${activeId}"]`);
    if (!container || !pill) return;
    const left = pill.offsetLeft - container.clientWidth / 2 + pill.clientWidth / 2;
    container.scrollTo({ left, behavior: 'smooth' });
  }, [activeId]);

  // A mouse wheel scrolls vertically; over this bar it should move the pills sideways instead.
  useEffect(() => {
    const container = scroller.current;
    if (!container) return;
    const onWheel = (event: WheelEvent) => {
      const overflowing = container.scrollWidth > container.clientWidth;
      if (!overflowing || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      container.scrollBy({ left: event.deltaY });
    };
    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <nav aria-label="Menu sections" className="sticky top-[calc(68px+env(safe-area-inset-top))] z-20 -mx-4 border-b border-line bg-paper/92 backdrop-blur-md sm:mx-0">
      {/* Swipeable row: pills snap into place, the faded edges show there is more, and the
          trailing spacer lets the last pill scroll fully into view (end padding alone is ignored). */}
      <div
        ref={scroller}
        className="scrollbar-none flex snap-x snap-mandatory scroll-px-4 gap-1.5 overflow-x-auto overscroll-x-contain px-4 py-3 [mask-image:linear-gradient(to_right,transparent,#000_16px,#000_calc(100%-40px),transparent)] after:w-2 after:shrink-0 after:content-[''] pointer-coarse:py-2 sm:px-0 sm:[mask-image:none]"
      >
        {sections.map(({ category, products }) => {
          const id = sectionId(category.slug);
          const active = id === activeId;
          return (
            <a
              key={category.id}
              href={`#${id}`}
              data-target={id}
              aria-current={active ? 'true' : undefined}
              onClick={(event) => {
                event.preventDefault();
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={cn(
                'inline-flex h-9 shrink-0 snap-start items-center gap-2 rounded-full px-4 pointer-coarse:h-11 text-sm font-semibold whitespace-nowrap transition-colors duration-200',
                active ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-ink/6 hover:text-ink',
              )}
            >
              {category.name}
              <span className={cn('font-mono text-xs', active ? 'text-paper/60' : 'text-muted')}>{products.length}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
