"use client";

import { useCallback, useId } from "react";
import { useSaveSettings, useSettings } from "@/api/settings";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useTranslation } from "@/i18n/use-translation";
import { useLocaleStore } from "@/stores/locale-store";
import { useThemeStore } from "@/stores/theme-store";
import { SettingsDialogBody } from "./settings-dialog-body";
import type { SettingsValues } from "./settings-form";

/**
 * Language, theme and personal context (how the assistant should write answers; sent with every
 * question). `session` changes on every opening, so the form starts from the saved values.
 */
export function SettingsDialog({ open, session, onClose }: { open: boolean; session: number; onClose: () => void }) {
  const { t } = useTranslation();
  const formId = useId();
  const settings = useSettings(open);
  const save = useSaveSettings();
  const setLanguage = useLocaleStore((s) => s.setPreference);
  const setTheme = useThemeStore((s) => s.setPreference);

  const submit = useCallback(
    ({ language, theme, personalContext }: SettingsValues) => {
      setLanguage(language);
      setTheme(theme);
      save.mutate(personalContext, { onSuccess: onClose });
    },
    [save, setLanguage, setTheme, onClose],
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("settings.title")}
      size="xl"
      footer={
        settings.data && (
          <>
            <Button onClick={onClose}>{t("common.cancel")}</Button>
            <Button type="submit" form={formId} variant="primary" disabled={save.isPending}>
              {t("common.save")}
            </Button>
          </>
        )
      }
    >
      {open && <SettingsDialogBody key={session} formId={formId} onSubmit={submit} onClose={onClose} />}
    </Dialog>
  );
}
