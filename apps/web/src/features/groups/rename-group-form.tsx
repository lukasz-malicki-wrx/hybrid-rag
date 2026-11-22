"use client";

import { useCallback, useState, type FormEvent } from "react";
import { Button } from "@hybrid-rag/ui/button";
import { TextInput } from "@hybrid-rag/ui/text-input";
import { useRenameGroup } from "@/api/groups";
import { useTranslation } from "@/i18n/use-translation";

export function RenameGroupForm({ id, name, onDone }: { id: string; name: string; onDone: () => void }) {
  const { t } = useTranslation();
  const rename = useRenameGroup();
  const [value, setValue] = useState(name);

  const submit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const next = value.trim();
      if (next && next !== name) rename.mutate({ id, name: next }, { onSuccess: onDone });
      else onDone();
    },
    [value, name, id, rename, onDone],
  );

  return (
    <form className="flex flex-1 gap-2" onSubmit={submit} onKeyDown={(e) => e.key === "Escape" && onDone()}>
      <TextInput
        label={t("sidebar.groupName")}
        hideLabel
        autoFocus
        value={value}
        maxLength={100}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 text-lg font-semibold"
      />
      <Button type="submit" variant="primary" size="sm" disabled={rename.isPending}>
        {t("common.save")}
      </Button>
    </form>
  );
}
