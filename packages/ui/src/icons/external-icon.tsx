import { Icon, type IconProps } from "./icon";

export function ExternalIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6" />
    </Icon>
  );
}
