import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowDown, ArrowUp, PencilSimple, Plus, Tag, Trash } from '@phosphor-icons/react';
import { RequirePermission } from '@/shared/auth/guards';
import { useCategories } from '@/shared/hooks/catalog';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { pluralize } from '@/shared/lib/format';
import { Button, IconButton } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState, LoadingRows } from '@/shared/ui/states';
import type { Category, MenuKind } from '@/shared/types';
import { CategoryDialog } from '../components/categories/CategoryDialog';
import { PageHeader, Panel } from '../components/PageHeader';
import { useDeleteCategory, useReorderCategories } from '../hooks/menu';

const GROUPS: { kind: MenuKind; title: string }[] = [
  { kind: 'food', title: 'Eat' },
  { kind: 'drink', title: 'Drink' },
];

function CategoriesScreen() {
  useDocumentTitle('Categories');
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
        title="Categories"
        description="The order here is the order customers scroll through on the menu."
        actions={
          <Button variant="ink" icon={Plus} onClick={() => setEditing('new')}>
            New category
          </Button>
        }
      />

      {categories.isPending ? (
        <LoadingRows rows={6} />
      ) : categories.error ? (
        <ErrorState error={categories.error} onRetry={() => categories.refetch()} retrying={categories.isFetching} />
      ) : sorted.length === 0 ? (
        <EmptyState icon={Tag} title="No categories yet" description="Create one to start building the menu." />
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {GROUPS.map(({ kind, title }) => {
            const group = sorted.filter((category) => category.kind === kind);
            return (
              <Panel key={kind} title={title} aside={pluralize(group.length, 'category', 'categories')}>
                {group.length === 0 ? (
                  <p className="text-sm text-muted">Nothing here yet.</p>
                ) : (
                  <ol className="flex flex-col divide-y divide-line">
                    {group.map((category, index) => (
                      // Phones: name and description get a full-width line and the controls sit on a row below.
                      // From sm: one line, with the reorder arrows stacked on the left.
                      <li
                        key={category.id}
                        className="flex flex-wrap items-center gap-x-1 gap-y-1 py-3 first:pt-0 last:pb-0 sm:flex-nowrap sm:gap-3"
                      >
                        <div className="order-1 min-w-0 basis-full sm:order-2 sm:basis-auto sm:flex-1">
                          <p className="truncate font-display text-xl font-bold">{category.name}</p>
                          {category.description && <p className="truncate text-sm text-muted">{category.description}</p>}
                        </div>
                        <Link
                          to={`/dashboard/menu?category=${category.id}`}
                          className="order-2 mr-auto inline-flex min-h-11 shrink-0 items-center font-mono text-xs whitespace-nowrap font-semibold text-ink-soft underline-offset-4 hover:underline sm:order-3 sm:mr-0 sm:min-h-0 sm:rounded-full sm:bg-paper-deep sm:px-3 sm:py-1 sm:text-ink sm:no-underline sm:hover:bg-line"
                        >
                          {pluralize(category.productCount, 'item')}
                        </Link>
                        <div className="order-3 flex shrink-0 sm:order-1 sm:flex-col">
                          <IconButton
                            icon={ArrowUp}
                            size="sm"
                            label={`Move ${category.name} up`}
                            disabled={index === 0 || reorder.isPending}
                            onClick={() => move(category, -1)}
                            className="size-8"
                          />
                          <IconButton
                            icon={ArrowDown}
                            size="sm"
                            label={`Move ${category.name} down`}
                            disabled={index === group.length - 1 || reorder.isPending}
                            onClick={() => move(category, 1)}
                            className="size-8"
                          />
                        </div>
                        <IconButton
                          icon={PencilSimple}
                          label={`Edit ${category.name}`}
                          onClick={() => setEditing(category)}
                          className="order-4"
                        />
                        <IconButton
                          icon={Trash}
                          label={`Delete ${category.name}`}
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
          title={`${deleting.name} still has items`}
          description={`Move or delete its ${pluralize(deleting.productCount, 'item')} first, then delete the empty category.`}
          confirmLabel="Show its items"
          onConfirm={() => navigate(`/dashboard/menu?category=${deleting.id}`)}
          onCancel={() => setDeleting(null)}
        />
      ) : (
        <ConfirmDialog
          open={Boolean(deleting)}
          title={`Delete ${deleting?.name ?? 'category'}?`}
          description="It is empty, so nothing else changes on the menu."
          confirmLabel="Delete category"
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
