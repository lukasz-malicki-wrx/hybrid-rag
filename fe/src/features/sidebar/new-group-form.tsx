"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, type FormEvent } from "react";
import { useCreateGroup } from "@/api/groups";
import { CloseIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { TextInput } from "@/components/ui/text-input";
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
