import { useEffect, useState } from 'react';
import { Leaf, MagnifyingGlass, Pepper, Sparkle, Star, X } from '@phosphor-icons/react';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { Chip, Segmented } from '@/shared/ui/form';
import type { ProductTag } from '@/shared/types';
import type { KindFilter, MenuFilters } from '../../lib/menu';

const TAG_FILTERS: { tag: ProductTag; label: string; icon: typeof Leaf }[] = [
  { tag: 'signature', label: 'House favourites', icon: Star },
  { tag: 'vegetarian', label: 'Vegetarian', icon: Leaf },
  { tag: 'spicy', label: 'Spicy', icon: Pepper },
  { tag: 'new', label: 'New', icon: Sparkle },
];

interface MenuToolbarProps {
  filters: MenuFilters;
  onChange: (changes: Partial<MenuFilters>) => void;
}

export function MenuToolbar({ filters, onChange }: MenuToolbarProps) {
  const [search, setSearch] = useState(filters.search);
  const debounced = useDebouncedValue(search, 220);

  useEffect(() => {
    if (debounced !== filters.search) onChange({ search: debounced });
    // Only push when the typed value settles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => {
    // Keep the box in sync when filters are reset from elsewhere.
    if (!filters.search) setSearch('');
  }, [filters.search]);

  const toggleTag = (tag: ProductTag) =>
    onChange({ tags: filters.tags.includes(tag) ? filters.tags.filter((item) => item !== tag) : [...filters.tags, tag] });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Segmented<KindFilter>
          label="Show"
          value={filters.kind}
          onChange={(kind) => onChange({ kind })}
          options={[
            { value: 'all', label: 'Everything' },
            { value: 'food', label: 'Eat' },
            { value: 'drink', label: 'Drink' },
          ]}
        />
        <label className="relative flex-1 sm:max-w-sm">
          <span className="sr-only">Search the menu</span>
          <MagnifyingGlass
            size={18}
            weight="bold"
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search dishes and drinks"
            className="h-12 w-full rounded-full bg-surface pr-12 pl-11 text-base ring-1 sm:text-[15px] ring-line-strong ring-inset placeholder:text-muted focus:ring-2 focus:ring-ink focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute top-1/2 right-1.5 grid size-9 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-ink/6 hover:text-ink"
            >
              <X size={14} weight="bold" />
            </button>
          )}
        </label>
      </div>
      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {TAG_FILTERS.map(({ tag, label, icon: Icon }) => (
          <Chip key={tag} active={filters.tags.includes(tag)} onClick={() => toggleTag(tag)}>
            <Icon size={15} weight={filters.tags.includes(tag) ? 'fill' : 'bold'} aria-hidden />
            {label}
          </Chip>
        ))}
      </div>
    </div>
  );
}
