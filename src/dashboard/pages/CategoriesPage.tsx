import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowDown, ArrowUp, PencilSimple, Plus, Tag, Trash } from '@phosphor-icons/react';
import { RequirePermission } from '@/shared/auth/guards';
import { useCategories } from '@/shared/hooks/catalog';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { fill, plural, t } from '@/shared/i18n';
import { Button, IconButton } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState, LoadingRows } from '@/shared/ui/states';
import type { Category, MenuKind } from '@/shared/types';
import { CategoryDialog } from '../components/categories/CategoryDialog';
import { PageHeader, Panel } from '../components/PageHeader';
import { useDeleteCategory, useReorderCategories } from '../hooks/menu';

const GROUPS: { kind: MenuKind; title: string }[] = [
  { kind: 'food', title: t.dashboard.categories.foodGroup },
  { kind: 'drink', title: t.dashboard.categories.drinkGroup },
];

function CategoriesScreen() {
  useDocumentTitle(t.dashboard.categories.title);
  const navigate = useNavigate();
  const categories = useCategories();
  const reorder = useReorderCategories();
  const remove = useDeleteCategory();
  const [editing, setEditing] = useState<Category | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const sorted = [...(categories.data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  /** Swaps a category with its neighbour inside the same group, keeping the global order consistent. */
  const move = (category: Category, direction: -1 | 1) => {
    const group = sorted.filter((item) => item.kind === category.kind);
    const neighbour = group[group.indexOf(category) + direction];
    if (!neighbour) return;
    const next = [...sorted];
    const a = next.indexOf(category);
    const b = next.indexOf(neighbour);
    [next[a], next[b]] = [next[b], next[a]];
    reorder.mutate(next);
  };

  return (
    <>
      <PageHeader
        title={t.dashboard.categories.title}
        description={t.dashboard.categories.intro}
        actions={
          <Button variant="ink" icon={Plus} onClick={() => setEditing('new')}>
            {t.dashboard.categories.new}
          </Button>
        }
      />

      {categories.isPending ? (
        <LoadingRows rows={6} />
      ) : categories.error ? (
        <ErrorState error={categories.error} onRetry={() => categories.refetch()} retrying={categories.isFetching} />
      ) : sorted.length === 0 ? (
        <EmptyState icon={Tag} title={t.dashboard.categories.emptyTitle} description={t.dashboard.categories.emptyBody} />
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {GROUPS.map(({ kind, title }) => {
            const group = sorted.filter((category) => category.kind === kind);
            return (
              <Panel key={kind} title={title} aside={plural(t.plurals.categories, group.length)}>
                {group.length === 0 ? (
                  <p className="text-sm text-muted">{t.dashboard.categories.groupEmpty}</p>
                ) : (
                  <ol className="flex flex-col divide-y divide-line">
                    {group.map((category, index) => (
                      // Phones: name and description get a full-width line and the controls sit on a row below.
                      // From sm: one line, with the reorder arrows stacked at the start.
                      <li
                        key={category.id}
                        className="flex flex-wrap items-center gap-x-1 gap-y-1 py-3 first:pt-0 last:pb-0 sm:flex-nowrap sm:gap-3"
                      >
                        <div className="order-1 min-w-0 basis-full sm:order-2 sm:basis-auto sm:flex-1">
                          <p className="truncate font-display text-2xl leading-snug">{category.name}</p>
                          {category.description && <p className="truncate text-sm text-muted">{category.description}</p>}
                        </div>
                        <Link
                          to={`/dashboard/menu?category=${category.id}`}
                          className="order-2 me-auto inline-flex min-h-11 shrink-0 items-center font-mono text-xs whitespace-nowrap font-semibold text-ink-soft underline-offset-4 hover:underline sm:order-3 sm:me-0 sm:min-h-0 sm:rounded-full sm:bg-paper-deep sm:px-3 sm:py-1 sm:text-ink sm:no-underline sm:hover:bg-line"
                        >
                          {plural(t.plurals.items, category.productCount)}
                        </Link>
                        <div className="order-3 flex shrink-0 sm:order-1 sm:flex-col">
                          <IconButton
                            icon={ArrowUp}
                            size="sm"
                            label={fill(t.dashboard.categories.moveUp, { name: category.name })}
                            disabled={index === 0 || reorder.isPending}
                            onClick={() => move(category, -1)}
                            className="size-8"
                          />
                          <IconButton
                            icon={ArrowDown}
                            size="sm"
                            label={fill(t.dashboard.categories.moveDown, { name: category.name })}
                            disabled={index === group.length - 1 || reorder.isPending}
                            onClick={() => move(category, 1)}
                            className="size-8"
                          />
                        </div>
                        <IconButton
                          icon={PencilSimple}
                          label={fill(t.dashboard.categories.edit, { name: category.name })}
                          onClick={() => setEditing(category)}
                          className="order-4"
                        />
                        <IconButton
                          icon={Trash}
                          label={fill(t.dashboard.categories.delete, { name: category.name })}
                          onClick={() => setDeleting(category)}
                          className="order-5 hover:bg-danger-wash hover:text-danger"
                        />
                      </li>
                    ))}
                  </ol>
                )}
              </Panel>
            );
          })}
        </div>
      )}

      <CategoryDialog open={editing !== null} category={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />

      {deleting && deleting.productCount > 0 ? (
        <ConfirmDialog
          open
          title={fill(t.dashboard.categories.hasItemsTitle, { name: deleting.name })}
          description={fill(t.dashboard.categories.hasItemsBody, { items: plural(t.plurals.items, deleting.productCount) })}
          confirmLabel={t.dashboard.categories.showItems}
          onConfirm={() => navigate(`/dashboard/menu?category=${deleting.id}`)}
          onCancel={() => setDeleting(null)}
        />
      ) : (
        <ConfirmDialog
          open={Boolean(deleting)}
          title={fill(t.dashboard.categories.deleteTitle, { name: deleting?.name ?? t.dashboard.categories.deleteFallback })}
          description={t.dashboard.categories.deleteBody}
          confirmLabel={t.dashboard.categories.deleteConfirm}
          tone="danger"
          loading={remove.isPending}
          onConfirm={() => deleting && remove.mutate(deleting, { onSettled: () => setDeleting(null) })}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  );
}

export function CategoriesPage() {
  return (
    <RequirePermission permission="menu:manage">
      <CategoriesScreen />
    </RequirePermission>
  );
}
