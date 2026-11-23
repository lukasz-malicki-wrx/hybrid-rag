"use client";

import { useCallback, useState } from "react";
import { IconButton } from "@hybrid-rag/ui/icon-button";
import { SettingsIcon } from "@hybrid-rag/ui/icons";
import { useTranslation } from "@/i18n/use-translation";
import { SettingsDialog } from "./settings-dialog";

/** The settings tile of the rail; opens the settings dialog. */
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
      <IconButton
        variant="tile"
        label={t("rail.settings")}
        title={t("rail.settings")}
        icon={<SettingsIcon />}
        aria-haspopup="dialog"
        onClick={show}
      />
      <SettingsDialog open={open} session={session} onClose={close} />
    </>
  );
}
