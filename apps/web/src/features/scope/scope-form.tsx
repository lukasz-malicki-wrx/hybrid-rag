"use client";

import { useCallback, useState, type FormEvent } from "react";
import { Button } from "@hybrid-rag/ui/button";
import { Text } from "@hybrid-rag/ui/text";
import { useTranslation } from "@/i18n/use-translation";
import { ScopeOption } from "./scope-option";
import { useScopeSections } from "./use-scope-sections";

/** Checkbox list of documents; submitted from the dialog footer through its form id. */
export function ScopeForm({
  id,
  initial,
  attached,
  groupId,
  groupName,
  onSubmit,
}: {
  id: string;
  initial: string[];
  attached: string[];
  groupId?: string | null;
  groupName?: string | null;
  onSubmit: (documentIds: string[]) => void;
}) {
  const { t } = useTranslation();
  const [choice, setChoice] = useState(initial);
  const { total, sections } = useScopeSections(groupId, groupName);

  const toggle = useCallback(
    (docId: string, on: boolean) => setChoice((c) => (on ? [...c, docId] : c.filter((x) => x !== docId))),
    [],
  );
  const submit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      onSubmit(choice);
    },
    [choice, onSubmit],
  );

  return (
    <form id={id} onSubmit={submit} className="space-y-5">
      {sections.map((section) => (
        <fieldset key={section.title}>
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{section.title}</legend>
          <ul className="space-y-1">
            {section.documents.map((doc) => (
              <ScopeOption
                key={doc.id}
                doc={doc}
                checked={choice.includes(doc.id)}
                attached={attached.includes(doc.id)}
                onToggle={toggle}
              />
            ))}
          </ul>
        </fieldset>
      ))}
      {!total && (
        <Text tone="muted" size="sm">
          {t("scope.empty")}
        </Text>
      )}
      {choice.length > 0 && (
        <Button variant="link" size="text" onClick={() => setChoice([])}>
          {t("scope.clearSelection")}
        </Button>
      )}
    </form>
  );
}
