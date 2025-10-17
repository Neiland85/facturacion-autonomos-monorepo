import { type VariantProps } from 'class-variance-authority';
import * as React from 'react';
declare const badgeVariants: (props?: {
    variant?: "default" | "outline" | "secondary" | "destructive";
} & import("class-variance-authority/dist/types").ClassProp) => string;
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
}
declare function Badge({ className, variant, ...props }: BadgeProps): React.JSX.Element;
export { Badge, badgeVariants };
