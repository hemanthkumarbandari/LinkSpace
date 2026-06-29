import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-sm hover:shadow-purple-500/30 hover:shadow-lg hover:-translate-y-0.5',
        destructive: 'bg-rose-500/90 text-white shadow-sm hover:bg-rose-600',
        outline:
          'border border-white/10 bg-white/5 text-[#f0eeff] shadow-sm hover:bg-white/10 hover:border-purple-500/40',
        ghost: 'text-[#94a3b8] hover:bg-white/5 hover:text-[#f0eeff]',
        secondary:
          'border border-white/8 bg-white/4 text-[#94a3b8] shadow-sm hover:bg-white/8',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);


export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
