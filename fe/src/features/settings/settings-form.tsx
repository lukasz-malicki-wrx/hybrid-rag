"use client";

import { useCallback, useState, type FormEvent } from "react";
import { PERSONAL_CONTEXT_MAX } from "@/api/settings";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { TextArea } from "@/components/ui/text-area";
import { useTranslation } from "@/i18n/use-translation";
import type { ThemePreference } from "@/lib/theme";
import type { LocalePreference } from "@/stores/locale-store";
import { LanguageSelect } from "./language-select";
import { ThemeSelect } from "./theme-select";

export type SettingsValues = { language: LocalePreference; theme: ThemePreference; personalContext: string };

/** Form body of the settings dialog; its submit buttons live in the dialog footer (form id). */
export function SettingsForm({
  id,
  initial,
  onSubmit,
}: {
  id: string;
  initial: SettingsValues;
  onSubmit: (values: SettingsValues) => void;
}) {
  const { t } = useTranslation();
  const [language, setLanguage] = useState(initial.language);
  const [theme, setTheme] = useState(initial.theme);
  const [personalContext, setPersonalContext] = useState(initial.personalContext);

  const submit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      onSubmit({ language, theme, personalContext });
    },
    [language, theme, personalContext, onSubmit],
  );

  return (
    <form id={id} onSubmit={submit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <LanguageSelect value={language} onChange={setLanguage} />
        <ThemeSelect value={theme} onChange={setTheme} />
      </div>
      <Divider />
      <div>
        <TextArea
          label={t("settings.personalContext")}
          hint={t("settings.personalContextHint")}
          footer={t("settings.characters", { count: personalContext.length, max: PERSONAL_CONTEXT_MAX })}
          autoFocus
          rows={8}
          maxLength={PERSONAL_CONTEXT_MAX}
          value={personalContext}
          onChange={(e) => setPersonalContext(e.target.value)}
          placeholder={t("settings.personalContextPlaceholder")}
        />
        {personalContext.length > 0 && (
          <Button variant="link" size="sm" className="px-0" onClick={() => setPersonalContext("")}>
            {t("common.clear")}
          </Button>
        )}
      </div>
    </form>
  );
}
