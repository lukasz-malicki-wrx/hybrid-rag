import { cn } from "@/lib/cn";
import { Icon, type IconProps } from "./icon";

export function SpinnerIcon({ className, ...props }: IconProps) {
  return (
    <Icon {...props} className={cn("animate-spin motion-reduce:animate-none", className)}>
      <path d="M12 3a9 9 0 1 0 9 9" />
    </Icon>
  );
}
