"use client";

import { useCallback, useState } from "react";
import { Button } from "@hybrid-rag/ui/button";
import { SettingsIcon } from "@hybrid-rag/ui/icons";
import { useTranslation } from "@/i18n/use-translation";
import { SettingsDialog } from "./settings-dialog";

export function SettingsButton() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(0);

  const show = useCallback(() => {
    setSession((n) => n + 1);
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        aria-haspopup="dialog"
        onClick={show}
        icon={<SettingsIcon className="text-muted" />}
        className="w-full justify-start px-2"
      >
        {t("sidebar.settings")}
      </Button>
      <SettingsDialog open={open} session={session} onClose={close} />
    </>
  );
}
