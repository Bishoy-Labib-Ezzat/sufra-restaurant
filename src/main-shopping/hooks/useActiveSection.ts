import { useEffect, useState } from 'react';

/** Tracks which section is in the reading zone of the viewport (scroll-spy) via IntersectionObserver. */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join('|');

  useEffect(() => {
    if (!ids.length) return;
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        // When two sections share the reading zone, the lower one is the one being entered.
        const current = ids.findLast((id) => visible.has(id));
        if (current) setActive(current);
      },
      { rootMargin: '-35% 0px -55% 0px' },
    );
    ids.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
    // `key` captures the id list; the array identity changes every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return active ?? ids[0] ?? null;
}
