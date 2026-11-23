import type { ReactNode } from "react";
import { Card } from "@hybrid-rag/ui/card";
import { cn } from "@hybrid-rag/ui/cn";
import { Heading } from "@hybrid-rag/ui/heading";
import { Text } from "@hybrid-rag/ui/text";
import { ArrowLink } from "./arrow-link";
import { IconTile } from "./icon-tile";

type FeatureCardProps = {
  /** An icon from "@hybrid-rag/ui/icons"; it is decoration, the title names the card. */
  icon: ReactNode;
  title: ReactNode;
  text: ReactNode;
  /** "Learn more": where it goes and what it says. */
  link?: { href: string; label: ReactNode };
  /** The heading level: 3 under a section's h2. */
  level?: 3 | 4;
  className?: string;
};

/** A strength or feature: an icon, a title, a sentence and an optional link. A list item: put it in a <ul>. */
export function FeatureCard({ icon, title, text, link, level = 3, className }: FeatureCardProps) {
  return (
    <Card as="li" className={cn("flex flex-col p-6", className)}>
      <IconTile>{icon}</IconTile>
      <Heading level={level} size="h3" className="mt-6">
        {title}
      </Heading>
      <Text tone="muted" className="mt-3">
        {text}
      </Text>
      {link ? (
        <div className="mt-auto pt-6">
          <ArrowLink href={link.href}>{link.label}</ArrowLink>
        </div>
      ) : null}
    </Card>
  );
}
