"use client";

import { useCallback } from "react";
import { ConfirmDialog } from "@hybrid-rag/ui/confirm-dialog";
import { useDeleteConversation } from "@/api/conversations";
import { useTranslation } from "@/i18n/use-translation";

export function DeleteConversationDialog({
  conversation,
  onClose,
  onDeleted,
}: {
  conversation: { id: string; title: string } | null;
  onClose: () => void;
  onDeleted?: () => void;
}) {
  const { t } = useTranslation();
  const remove = useDeleteConversation();
  const confirm = useCallback(() => {
    if (!conversation) return;
    remove.mutate(conversation.id, {
      onSuccess: () => {
        onClose();
        onDeleted?.();
      },
    });
  }, [conversation, remove, onClose, onDeleted]);

  return (
    <ConfirmDialog
      open={!!conversation}
      title={t("chat.deleteTitle")}
      confirmLabel={t("chat.deleteConversation")}
      cancelLabel={t("common.cancel")}
      busy={remove.isPending}
      onCancel={onClose}
      onConfirm={confirm}
    >
      <p>{t("chat.deleteBody", { title: conversation?.title ?? "" })}</p>
    </ConfirmDialog>
  );
}
