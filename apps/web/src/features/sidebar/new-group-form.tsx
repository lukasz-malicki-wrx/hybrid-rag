"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, type FormEvent } from "react";
import { Button } from "@hybrid-rag/ui/button";
import { IconButton } from "@hybrid-rag/ui/icon-button";
import { CloseIcon } from "@hybrid-rag/ui/icons";
import { TextInput } from "@hybrid-rag/ui/text-input";
import { useCreateGroup } from "@/api/groups";
import { useTranslation } from "@/i18n/use-translation";

/** Inline form under the Groups heading; Cancel or Escape closes it. */
export function NewGroupForm({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const router = useRouter();
  const create = useCreateGroup();
  const [name, setName] = useState("");

  const submit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;
      create.mutate(name.trim(), {
        onSuccess: (group) => {
          onClose();
          router.push(`/g/${group.id}`);
        },
      });
    },
    [create, name, onClose, router],
  );

  return (
    <form
      className="mx-1 mb-2 flex items-center gap-1.5 rounded-lg border border-border bg-bg p-1.5"
      onSubmit={submit}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <TextInput
        label={t("sidebar.groupName")}
        hideLabel
        autoFocus
        value={name}
        maxLength={100}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("sidebar.groupNamePlaceholder")}
        className="min-w-0 flex-1 text-sm"
      />
      <Button type="submit" variant="primary" size="sm" disabled={create.isPending}>
        {t("common.create")}
      </Button>
      <IconButton label={t("common.cancel")} icon={<CloseIcon />} onClick={onClose} className="shrink-0 p-1.5" />
    </form>
  );
}
