import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Mobile-optimized button variants
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] transition-transform",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        // Mobile-optimized sizes
        xs: "h-7 px-2 text-[11px] md:h-8 md:px-3 md:text-xs", // 28px height on mobile
        sm: "h-8 px-2.5 text-xs md:h-9 md:px-3 md:text-sm", // 32px height on mobile
        default: "h-9 px-3 text-[13px] md:h-10 md:px-4 md:text-sm", // 36px height on mobile
        lg: "h-10 px-4 text-sm md:h-11 md:px-8 md:text-base", // 40px height on mobile
        // Icon sizes
        "icon-xs": "h-7 w-7 md:h-8 md:w-8", // 28px on mobile
        "icon-sm": "h-8 w-8 md:h-9 md:w-9", // 32px on mobile
        icon: "h-9 w-9 md:h-10 md:w-10", // 36px on mobile
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm", // Default to small on mobile
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }