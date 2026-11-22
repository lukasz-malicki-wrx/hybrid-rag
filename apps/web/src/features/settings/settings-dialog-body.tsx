"use client";

import { Button } from "@hybrid-rag/ui/button";
import { Spinner } from "@hybrid-rag/ui/spinner";
import { Text } from "@hybrid-rag/ui/text";
import { useSettings } from "@/api/settings";
import { useTranslation } from "@/i18n/use-translation";
import { useLocaleStore } from "@/stores/locale-store";
import { useThemeStore } from "@/stores/theme-store";
import { SettingsForm, type SettingsValues } from "./settings-form";

type Props = {
  formId: string;
  onSubmit: (values: SettingsValues) => void;
  onClose: () => void;
};

/** Content of the open settings dialog: the form, a load error, or a spinner. */
export function SettingsDialogBody({ formId, onSubmit, onClose }: Props) {
  const { t } = useTranslation();
  const { data, isError } = useSettings(true);
  const language = useLocaleStore((s) => s.preference);
  const theme = useThemeStore((s) => s.preference);

  if (data) {
    return (
      <SettingsForm
        id={formId}
        initial={{ language, theme, personalContext: data.personal_context }}
        onSubmit={onSubmit}
      />
    );
  }
  if (isError) {
    return (
      <div className="space-y-4">
        <Text role="alert" tone="danger" size="sm">
          {t("settings.loadError")}
        </Text>
        <Button onClick={onClose}>{t("common.close")}</Button>
      </div>
    );
  }
  return <Spinner label={t("app.loading")} />;
}
