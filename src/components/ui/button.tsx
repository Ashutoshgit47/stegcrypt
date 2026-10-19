import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-bold uppercase tracking-wider ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-2 border-black dark:border-white duration-200 ease-out active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
  {
    variants: {
      variant: {
        default: "bg-[#D02020] text-white shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_white] hover:bg-[#D02020]/90",
        destructive: "bg-[#121212] dark:bg-white text-white dark:text-black shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_white] hover:bg-black/90 dark:hover:bg-gray-200",
        outline: "bg-white dark:bg-black text-black dark:text-white shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_white] hover:bg-gray-100 dark:hover:bg-gray-900",
        secondary: "bg-[#1040C0] text-white shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_white] hover:bg-[#1040C0]/90",
        warning: "bg-[#F0C020] text-black shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_white] hover:bg-[#F0C020]/90",
        ghost: "border-transparent text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 !shadow-none active:translate-x-0 active:translate-y-0",
        link: "border-none text-[#1040C0] dark:text-[#5080F0] underline-offset-4 hover:underline !shadow-none active:translate-x-0 active:translate-y-0",
      },
      size: {
        default: "h-12 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-10 text-base",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
