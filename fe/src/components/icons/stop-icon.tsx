import { Icon, type IconProps } from "./icon";

export function StopIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor" />
    </Icon>
  );
}
