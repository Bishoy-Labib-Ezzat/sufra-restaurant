import type { ComponentProps, ElementType } from 'react';
import { cn } from '@/shared/lib/cn';
import { buttonStyles, type StyleOptions, type Variant } from './button-styles';
import { Spinner } from './Spinner';

interface ButtonProps extends ComponentProps<'button'>, Omit<StyleOptions, 'className'> {
  loading?: boolean;
  icon?: ElementType;
}

export function Button({
  variant,
  size,
  block,
  loading,
  icon: Icon,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles({ variant, size, block, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner /> : Icon && <Icon size={size === 'sm' ? 16 : 18} weight="bold" aria-hidden />}
      {children}
    </button>
  );
}

interface IconButtonProps extends ComponentProps<'button'> {
  icon: ElementType;
  label: string;
  variant?: Variant;
  size?: 'sm' | 'md';
}

export function IconButton({ icon: Icon, label, variant = 'ghost', size = 'md', className, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(buttonStyles({ variant }), size === 'sm' ? 'size-9 px-0' : 'size-11 px-0', className)}
      {...props}
    >
      <Icon size={size === 'sm' ? 16 : 20} weight="bold" aria-hidden />
    </button>
  );
}
