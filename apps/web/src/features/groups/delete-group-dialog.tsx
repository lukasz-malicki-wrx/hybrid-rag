"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { ConfirmDialog } from "@hybrid-rag/ui/confirm-dialog";
import { useDeleteGroup } from "@/api/groups";
import type { Group } from "@/api/types";
import { useTranslation } from "@/i18n/use-translation";

/** Warns how many conversations go with the group before deleting it. */
export function DeleteGroupDialog({ group, open, onClose }: { group: Group; open: boolean; onClose: () => void }) {
  const { t, tp } = useTranslation();
  const router = useRouter();
  const remove = useDeleteGroup();
  const count = group.conversation_count;

  const confirm = useCallback(
    () =>
      remove.mutate(group.id, {
        onSuccess: () => {
          onClose();
          router.push("/");
        },
      }),
    [remove, group.id, onClose, router],
  );

  return (
    <ConfirmDialog
      open={open}
      title={t("groups.deleteTitle", { name: group.name })}
      confirmLabel={
        count ? t("groups.deleteConfirmWith", { conversations: tp("counts.conversations", count) }) : t("groups.delete")
      }
      cancelLabel={t("common.cancel")}
      busy={remove.isPending}
      onCancel={onClose}
      onConfirm={confirm}
    >
      {count ? (
        <p className="font-medium text-fg">{tp("groups.deleteWarning", count)}</p>
      ) : (
        <p>{t("groups.deleteEmpty")}</p>
      )}
      <p>{t("groups.documentsStay")}</p>
    </ConfirmDialog>
  );
}
