import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { WarningCircle } from '@phosphor-icons/react';
import { getErrorMessage, isApiError } from '@/shared/api/errors';
import { Button } from '@/shared/ui/Button';
import { Field, Input, Segmented, Textarea } from '@/shared/ui/form';
import { Overlay, OverlayHeader } from '@/shared/ui/Overlay';
import { InlineNotice } from '@/shared/ui/states';
import type { Category, MenuKind } from '@/shared/types';
import { useSaveCategory } from '../../hooks/menu';
import { categorySchema, type CategoryFormValues } from '../../lib/forms';

function CategoryForm({ category, onDone }: { category: Category | null; onDone: () => void }) {
  const save = useSaveCategory();
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: category
      ? { name: category.name, kind: category.kind, description: category.description }
      : { name: '', kind: 'food', description: '' },
  });

  const onSubmit = handleSubmit(async (input) => {
    try {
      await save.mutateAsync({ id: category?.id, input });
      onDone();
    } catch (error) {
      if (isApiError(error)) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          setError(field as keyof CategoryFormValues, { message }, { shouldFocus: true });
        }
      }
    }
  });

  const generalError = save.error && !(isApiError(save.error) && Object.keys(save.error.fieldErrors).length) ? save.error : null;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5 overflow-y-auto p-6">
      <Field label="Name" error={errors.name?.message}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} data-autofocus aria-describedby={describedBy} aria-invalid={invalid} {...register('name')} />
        )}
      </Field>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold">Shown under</span>
        <Controller
          control={control}
          name="kind"
          render={({ field }) => (
            <Segmented<MenuKind>
              label="Shown under"
              value={field.value}
              onChange={field.onChange}
              options={[
                { value: 'food', label: 'Eat' },
                { value: 'drink', label: 'Drink' },
              ]}
            />
          )}
        />
      </div>
      <Field label="Short description" aside="Optional" hint="Appears under the category title on the menu." error={errors.description?.message}>
        {({ id, describedBy, invalid }) => (
          <Textarea id={id} className="min-h-20" maxLength={120} aria-describedby={describedBy} aria-invalid={invalid} {...register('description')} />
        )}
      </Field>
      {generalError && (
        <InlineNotice tone="danger" icon={WarningCircle}>
          {getErrorMessage(generalError)}
        </InlineNotice>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" variant="ink" loading={save.isPending}>
          {category ? 'Save category' : 'Add category'}
        </Button>
      </div>
    </form>
  );
}

interface CategoryDialogProps {
  open: boolean;
  category: Category | null;
  onClose: () => void;
}

export function CategoryDialog({ open, category, onClose }: CategoryDialogProps) {
  return (
    <Overlay open={open} onClose={onClose} label={category ? `Edit ${category.name}` : 'New category'}>
      <OverlayHeader title={category ? 'Edit category' : 'New category'} onClose={onClose} />
      <CategoryForm key={category?.id ?? 'new'} category={category} onDone={onClose} />
    </Overlay>
  );
}
