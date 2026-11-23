import { FastApiIcon, NextJsIcon, OllamaIcon, PostgresIcon } from "@hybrid-rag/ui/icons";
import { Text } from "@hybrid-rag/ui/text";
import { Container } from "@/components/ui/container";
import type { HomeSectionProps } from "./props";

const ITEMS = [
  { id: "postgres", Icon: PostgresIcon },
  { id: "ollama", Icon: OllamaIcon },
  { id: "fastapi", Icon: FastApiIcon },
  { id: "next", Icon: NextJsIcon },
] as const;

/** The parts it is made of: each logo with its name (no claims): a row on wide screens, a bordered 2x2 grid on a phone. */
export function BuiltWith({ t }: Pick<HomeSectionProps, "t">) {
  return (
    <section aria-labelledby="home-built-with" className="surface-panel pb-section pt-10 lg:pt-5">
      <Container>
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:gap-25">
          <div className="flex shrink-0 flex-col items-center gap-3 lg:flex-row lg:gap-25">
            <Text id="home-built-with" size="lead" tone="muted" className="max-lg:text-center lg:w-50">
              {t("home.builtWith.label")}
            </Text>
            <span aria-hidden="true" className="h-px w-20 shrink-0 bg-fg" />
          </div>
          <ul
            aria-labelledby="home-built-with"
            className="grid w-full grid-cols-2 gap-2 lg:flex lg:flex-1 lg:justify-between lg:gap-8"
          >
            {ITEMS.map(({ id, Icon }) => (
              <li
                key={id}
                className="flex min-h-17 flex-col items-center justify-center gap-2 rounded-lg border border-border bg-(--card-bg,var(--surface)) px-2 py-4 text-center lg:min-h-0 lg:border-0 lg:bg-transparent lg:p-0"
              >
                <Icon width={28} height={28} className="shrink-0 text-muted" />
                <Text as="span" size="lead" tone="muted" className="font-semibold">
                  {t(`home.builtWith.items.${id}`)}
                </Text>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
