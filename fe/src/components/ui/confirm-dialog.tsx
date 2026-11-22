"use client";

import type { ReactNode } from "react";
import { useTranslation } from "@/i18n/use-translation";
import { Button } from "./button";
import { Dialog } from "./dialog";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Destructive confirmation. Cancel has initial focus, so Enter does not delete. */
export function ConfirmDialog({ open, title, children, confirmLabel, busy, onConfirm, onCancel }: ConfirmDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={title}
      description={children}
      footer={
        <>
          <Button autoFocus onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={busy}>
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
