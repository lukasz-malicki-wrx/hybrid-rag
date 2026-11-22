import { Icon, type IconProps } from "./icon";

export function ChatIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 5h16v11H8l-4 4z" />
    </Icon>
  );
}
