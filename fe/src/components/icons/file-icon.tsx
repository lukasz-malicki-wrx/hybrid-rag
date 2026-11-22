import { Icon, type IconProps } from "./icon";

export function FileIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 3h8l4 4v14H6zM14 3v4h4" />
    </Icon>
  );
}
