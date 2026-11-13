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

  return (
    <nav aria-label="Menu sections" className="sticky top-[68px] z-20 -mx-4 border-b border-line bg-paper/92 backdrop-blur-md sm:mx-0">
      <div ref={scroller} className="scrollbar-none flex gap-1.5 overflow-x-auto px-4 py-3 sm:px-0">
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
                'inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-colors duration-200',
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
