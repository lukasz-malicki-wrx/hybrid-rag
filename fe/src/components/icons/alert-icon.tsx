import { Icon, type IconProps } from "./icon";

export function AlertIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 4 2 20h20zM12 10v4M12 17h.01" />
    </Icon>
  );
}
