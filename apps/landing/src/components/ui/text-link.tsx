import Link from "next/link";
import { TextLink as SharedTextLink, type TextLinkProps } from "@hybrid-rag/ui/text-link";

/** The shared TextLink, with the Next router for internal paths (starting with "/"). */
export function TextLink(props: Omit<TextLinkProps, "as">) {
  return <SharedTextLink {...props} as={props.href.startsWith("/") ? Link : undefined} />;
}
