"use client";

import { memo, useCallback, useId, useState } from "react";
import { FileIcon, GroupIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useTranslation } from "@/i18n/use-translation";
import { ScopeForm } from "./scope-form";
import { useScopeLabel } from "./use-scope-label";

type Props = {
  /** Documents chosen for the conversation (pinned, or picked before it exists). */
  selected: string[];
  /** Documents attached to the message being written; they are always included. */
  attached: string[];
  groupId?: string | null;
  groupName?: string | null;
  saving?: boolean;
  onSave: (documentIds: string[]) => void;
};

/**
 * Shows what the next answer will search and lets the user choose documents. With nothing
 * selected, the conversation searches its group (or all documents).
 */
export const ScopePicker = memo(function ScopePicker({ selected, attached, groupId, groupName, saving, onSave }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(0);
  const formId = useId();
  const count = new Set([...selected, ...attached]).size;
  const label = useScopeLabel(count, groupName);

  const show = useCallback(() => {
    setSession((n) => n + 1);
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);
  const submit = useCallback(
    (documentIds: string[]) => {
      onSave(documentIds);
      setOpen(false);
    },
    [onSave],
  );

  return (
    <>
      <Button size="sm" aria-haspopup="dialog" onClick={show} icon={count ? <FileIcon /> : <GroupIcon />} className="max-w-full px-2.5">
        <span className="truncate">{label}</span>
      </Button>
      <Dialog
        open={open}
        onClose={close}
        size="lg"
        title={t("scope.title")}
        description={groupName ? t("scope.hintGroup", { name: groupName }) : t("scope.hintAll")}
        footer={
          <>
            <Button autoFocus onClick={close}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" form={formId} variant="primary" disabled={saving}>
              {t("common.save")}
            </Button>
          </>
        }
      >
        {open && (
          <ScopeForm
            key={session}
            id={formId}
            initial={selected}
            attached={attached}
            groupId={groupId}
            groupName={groupName}
            onSubmit={submit}
          />
        )}
      </Dialog>
    </>
  );
});
