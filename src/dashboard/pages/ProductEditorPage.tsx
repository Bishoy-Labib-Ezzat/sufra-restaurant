import { useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useBlocker, useNavigate, useParams, useSearchParams } from 'react-router';
import { ArrowRight, BowlFood, Trash, WarningCircle } from '@phosphor-icons/react';
import { getErrorMessage, isApiError } from '@/shared/api/errors';
import { RequirePermission } from '@/shared/auth/guards';
import { useCategories, useProduct } from '@/shared/hooks/catalog';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { fill, t, toArabicDigits, toWesternDigits } from '@/shared/i18n';
import { PRODUCT_TAGS } from '@/shared/lib/product-tags';
import { Button } from '@/shared/ui/Button';
import { buttonStyles } from '@/shared/ui/button-styles';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Chip, Field, Input, Select, Switch, Textarea } from '@/shared/ui/form';
import { ErrorState, InlineNotice, Skeleton } from '@/shared/ui/states';
import { MenuItem } from '@/main-shopping/components/menu/MenuItem';
import type { Category, Product } from '@/shared/types';
import { ImageField } from '../components/menu/ImageField';
import { PageHeader, Panel } from '../components/PageHeader';
import { useDeleteProduct, useSaveProduct } from '../hooks/menu';
import { DESCRIPTION_LIMIT, productSchema, type ProductFormValues } from '../lib/forms';

const backLink = (
  <Link to="/dashboard/menu" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-ink">
    <ArrowRight size={16} weight="bold" aria-hidden />
    {t.dashboard.editor.back}
  </Link>
);

function toFormValues(product: Product): ProductFormValues {
  const { name, description, price, categoryId, imageUrl, tags, isAvailable, isFeatured } = product;
  return { name, description, price, categoryId, imageUrl, tags, isAvailable, isFeatured };
}

function ProductEditor({ product, categories }: { product?: Product; categories: Category[] }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const save = useSaveProduct();
  const remove = useDeleteProduct();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const leaving = useRef(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? toFormValues(product)
      : {
          name: '',
          description: '',
          categoryId: params.get('category') ?? '',
          imageUrl: '',
          tags: [],
          isAvailable: true,
          isFeatured: false,
        },
  });
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = form;
  const values = useWatch({ control });

  // Warn before throwing away unsaved edits.
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => isDirty && !leaving.current && currentLocation.pathname !== nextLocation.pathname,
  );

  const leave = () => {
    leaving.current = true;
    navigate('/dashboard/menu');
  };

  const onSubmit = handleSubmit(async (input) => {
    try {
      await save.mutateAsync({ id: product?.id, input });
      leave();
    } catch (error) {
      if (isApiError(error)) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          setError(field as keyof ProductFormValues, { message }, { shouldFocus: true });
        }
      }
    }
  });

  const preview: Product = {
    id: product?.id ?? 'preview',
    name: values.name || t.dashboard.editor.previewName,
    description: values.description || t.dashboard.editor.previewDescription,
    price: Number.isFinite(values.price) ? Number(values.price) : 0,
    categoryId: values.categoryId ?? '',
    imageUrl: values.imageUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
    tags: (values.tags ?? []) as Product['tags'],
    isAvailable: values.isAvailable ?? true,
    isFeatured: values.isFeatured ?? false,
    createdAt: '',
    updatedAt: '',
  };

  const descriptionLength = values.description?.length ?? 0;
  const generalError = save.error && !(isApiError(save.error) && Object.keys(save.error.fieldErrors).length) ? save.error : null;

  return (
    <>
      <PageHeader
        above={backLink}
        title={product ? product.name : t.dashboard.editor.newTitle}
        description={product ? t.dashboard.editor.editIntro : t.dashboard.editor.newIntro}
        actions={
          product && (
            <Button variant="ghost" icon={Trash} onClick={() => setConfirmDelete(true)} className="text-danger hover:bg-danger-wash">
              {t.dashboard.editor.delete}
            </Button>
          )
        }
      />

      <form onSubmit={onSubmit} noValidate className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-6">
          <Panel title={t.dashboard.editor.basics}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_180px]">
              <Field label={t.dashboard.editor.name} error={errors.name?.message}>
                {({ id, describedBy, invalid }) => (
                  <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} {...register('name')} />
                )}
              </Field>
              <Field label={t.dashboard.editor.price} error={errors.price?.message}>
                {({ id, describedBy, invalid }) => (
                  // Shown with Arabic digits; typing either digit style works.
                  <Controller
                    control={control}
                    name="price"
                    render={({ field }) => (
                      <Input
                        id={id}
                        inputMode="numeric"
                        className="font-mono"
                        aria-describedby={describedBy}
                        aria-invalid={invalid}
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        value={Number.isFinite(field.value) ? toArabicDigits(field.value) : ''}
                        onChange={(event) => {
                          const digits = toWesternDigits(event.target.value).replace(/\D/g, '');
                          field.onChange(digits ? Number(digits) : Number.NaN);
                        }}
                      />
                    )}
                  />
                )}
              </Field>
              <Field label={t.dashboard.editor.description} aside={fill(t.common.charCount, { count: descriptionLength, max: DESCRIPTION_LIMIT })} error={errors.description?.message} className="sm:col-span-2">
                {({ id, describedBy, invalid }) => (
                  <Textarea
                    id={id}
                    maxLength={DESCRIPTION_LIMIT}
                    aria-describedby={describedBy}
                    aria-invalid={invalid}
                    {...register('description')}
                  />
                )}
              </Field>
              <Field label={t.dashboard.editor.category} error={errors.categoryId?.message} className="sm:col-span-2">
                {({ id, describedBy, invalid }) => (
                  <Select id={id} aria-describedby={describedBy} aria-invalid={invalid} {...register('categoryId')}>
                    <option value="">{t.dashboard.editor.chooseCategory}</option>
                    {(['food', 'drink'] as const).map((kind) => (
                      <optgroup key={kind} label={kind === 'food' ? t.dashboard.editor.foodGroup : t.dashboard.editor.drinkGroup}>
                        {categories
                          .filter((category) => category.kind === kind)
                          .map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                      </optgroup>
                    ))}
                  </Select>
                )}
              </Field>
            </div>
          </Panel>

          <Panel title={t.dashboard.editor.photo}>
            <Controller
              control={control}
              name="imageUrl"
              render={({ field, fieldState }) => (
                <ImageField value={field.value} onChange={(url) => field.onChange(url)} error={fieldState.error?.message} />
              )}
            />
          </Panel>

          <Panel title={t.dashboard.editor.labelsTitle}>
            <div className="flex flex-col gap-6">
              <Controller
                control={control}
                name="tags"
                render={({ field }) => (
                  <fieldset className="flex flex-col gap-3">
                    <legend className="mb-3 text-sm font-semibold">{t.dashboard.editor.labelsLegend}</legend>
                    <div className="flex flex-wrap gap-2">
                      {PRODUCT_TAGS.map((tag) => {
                        const active = field.value.includes(tag.value);
                        return (
                          <Chip
                            key={tag.value}
                            active={active}
                            onClick={() =>
                              field.onChange(active ? field.value.filter((item) => item !== tag.value) : [...field.value, tag.value])
                            }
                          >
                            {tag.label}
                          </Chip>
                        );
                      })}
                    </div>
                  </fieldset>
                )}
              />
              <Controller
                control={control}
                name="isAvailable"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onChange={field.onChange}
                    label={t.dashboard.editor.onSale}
                    description={t.dashboard.editor.onSaleBody}
                  />
                )}
              />
              <Controller
                control={control}
                name="isFeatured"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onChange={field.onChange}
                    label={t.dashboard.editor.featured}
                    description={t.dashboard.editor.featuredBody}
                  />
                )}
              />
            </div>
          </Panel>

          {generalError && (
            <InlineNotice tone="danger" icon={WarningCircle}>
              {getErrorMessage(generalError)}
            </InlineNotice>
          )}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" variant="ink" size="lg" loading={save.isPending}>
              {product ? t.dashboard.editor.save : t.dashboard.editor.add}
            </Button>
            <Link to="/dashboard/menu" className={buttonStyles({ variant: 'ghost', size: 'lg' })}>
              {t.common.cancel}
            </Link>
          </div>
        </div>

        <aside className="xl:sticky xl:top-10 xl:self-start">
          <Panel title={t.dashboard.editor.previewTitle}>
            <div className="rounded-field bg-paper px-4">
              <MenuItem product={preview} />
            </div>
            <p className="mt-4 text-sm text-muted">{t.dashboard.editor.previewNote}</p>
          </Panel>
        </aside>
      </form>

      <ConfirmDialog
        open={blocker.state === 'blocked'}
        title={t.dashboard.editor.leaveTitle}
        description={t.dashboard.editor.leaveBody}
        confirmLabel={t.dashboard.editor.discard}
        cancelLabel={t.dashboard.editor.keepEditing}
        tone="danger"
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />

      {product && (
        <ConfirmDialog
          open={confirmDelete}
          title={fill(t.dashboard.menu.deleteTitle, { name: product.name })}
          description={t.dashboard.editor.deleteBody}
          confirmLabel={t.dashboard.menu.deleteConfirm}
          tone="danger"
          loading={remove.isPending}
          onConfirm={() => remove.mutate(product, { onSuccess: leave })}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
}

function EditorScreen() {
  const { productId } = useParams();
  const product = useProduct(productId);
  const categories = useCategories();
  useDocumentTitle(productId ? product.data?.name ?? t.dashboard.editor.editPageTitle : t.dashboard.menu.new);

  if ((productId && product.isPending) || categories.isPending) {
    return (
      <div className="flex flex-col gap-6" role="status" aria-label={t.common.loading}>
        <Skeleton className="h-14 w-80" />
        <Skeleton className="h-96 w-full rounded-panel" />
      </div>
    );
  }
  if (productId && product.error) {
    return isApiError(product.error) && product.error.isNotFound ? (
      <EmptyState
        icon={BowlFood}
        title={t.dashboard.editor.missingTitle}
        description={t.dashboard.editor.missingBody}
        action={
          <Link to="/dashboard/menu" className={buttonStyles({ variant: 'ink' })}>
            {t.dashboard.editor.backToMenu}
          </Link>
        }
      />
    ) : (
      <ErrorState error={product.error} onRetry={() => product.refetch()} retrying={product.isFetching} />
    );
  }
  if (categories.error) return <ErrorState error={categories.error} onRetry={() => categories.refetch()} />;

  return <ProductEditor key={productId ?? 'new'} product={product.data} categories={categories.data} />;
}

export function ProductEditorPage() {
  return (
    <RequirePermission permission="menu:manage">
      <EditorScreen />
    </RequirePermission>
  );
}
