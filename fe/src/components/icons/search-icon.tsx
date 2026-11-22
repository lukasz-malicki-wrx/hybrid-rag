import { Icon, type IconProps } from "./icon";

export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15zM16 16l5 5" />
    </Icon>
  );
}
