import { cn } from '@/shared/lib/cn';

export type Variant = 'primary' | 'ink' | 'secondary' | 'ghost' | 'danger';
export type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary: 'bg-tomato text-white hover:bg-tomato-deep',
  ink: 'bg-ink text-paper hover:bg-forest-soft',
  secondary: 'bg-surface text-ink ring-1 ring-inset ring-line-strong hover:bg-paper-deep',
  ghost: 'text-ink hover:bg-ink/6',
  danger: 'bg-danger text-white hover:bg-[#912018]',
};

// On touch screens every control grows to at least 44px, the minimum comfortable thumb target.
const sizes: Record<Size, string> = {
  sm: 'h-9 gap-1.5 px-4 text-sm pointer-coarse:h-11',
  md: 'h-11 gap-2 px-5 text-[15px]',
  lg: 'h-14 gap-2.5 px-7 text-base',
};

export interface StyleOptions {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  className?: string;
}

/** Button look, also applied to router links that act as buttons. */
export function buttonStyles({ variant = 'primary', size = 'md', block, className }: StyleOptions = {}) {
  return cn(
    'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full font-semibold',
    'transition-[background-color,transform,box-shadow] duration-200 ease-out-expo active:scale-[0.97]',
    'disabled:pointer-events-none disabled:opacity-45',
    variants[variant],
    sizes[size],
    block && 'w-full',
    className,
  );
}

