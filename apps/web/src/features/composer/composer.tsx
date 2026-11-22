"use client";

import { memo, useCallback, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Button } from "@hybrid-rag/ui/button";
import { cn } from "@hybrid-rag/ui/cn";
import { PaperclipIcon } from "@hybrid-rag/ui/icons";
import { useTranslation } from "@/i18n/use-translation";
import { useChatStore, type Attachment } from "@/stores/chat-store";
import { AttachmentChip } from "./attachment-chip";
import { ComposerActions } from "./composer-actions";
import { DropOverlay } from "./drop-overlay";
import { useAttachments } from "./use-attachments";
import { useFileDrop } from "./use-file-drop";

const MAX_QUESTION = 2000;

type Props = {
  /** Chat-store key of this message box's conversation: its answer shows Stop here. */
  turnKey?: string | null;
  /** attached: files uploaded with this message; they are pinned to the conversation. */
  onSend: (question: string, attached: Attachment[]) => void;
  /** Uploaded files are added to this group. */
  groupId?: string | null;
  placeholder?: string;
  autoFocus?: boolean;
  /** Renders the search-scope control; receives the ids of files attached to this message. */
  scope?: (attachedIds: string[]) => ReactNode;
};

/**
 * Message box with file upload (button or drag and drop). Sending waits until every attached
 * file is indexed, so the answer can use it.
 */
export const Composer = memo(function Composer({ turnKey, onSend, groupId, placeholder, autoFocus, scope }: Props) {
  const { t, tp } = useTranslation();
  const busy = useChatStore((s) => (turnKey ? !!s.turns[turnKey]?.busy : false));
  const stopTurn = useChatStore((s) => s.stop);
  const stop = useCallback(() => turnKey && stopTurn(turnKey), [turnKey, stopTurn]);
  const [text, setText] = useState("");
  const attachments = useAttachments(groupId);
  const { dragging, handlers } = useFileDrop(attachments.add);
  const fileInput = useRef<HTMLInputElement>(null);
  const textareaId = useId();
  const hintId = useId();

  const { attached, clear, pendingCount } = attachments;
  const canSend = !busy && text.trim().length > 0 && pendingCount === 0;

  const send = useCallback(() => {
    if (!canSend) return;
    onSend(text.trim(), attached);
    setText("");
    clear();
  }, [canSend, onSend, text, attached, clear]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        send();
      }
    },
    [send],
  );

  return (
    <div
      {...handlers}
      className={cn(
        "relative rounded-2xl border bg-bg shadow-sm transition-colors focus-within:border-focus focus-within:ring-2 focus-within:ring-focus/40",
        dragging ? "border-accent ring-2 ring-accent" : "border-border",
      )}
    >
      {dragging && <DropOverlay />}

      {attachments.items.length > 0 && (
        <ul aria-label={t("composer.attachedFiles")} className="flex flex-wrap gap-2 px-3 pt-3">
          {attachments.items.map((item) => (
            <AttachmentChip key={item.key} item={item} onUpdate={attachments.update} onRemove={attachments.remove} />
          ))}
        </ul>
      )}

      <label htmlFor={textareaId} className="sr-only">
        {t("composer.message")}
      </label>
      <textarea
        id={textareaId}
        autoFocus={autoFocus}
        value={text}
        rows={2}
        maxLength={MAX_QUESTION}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder ?? t("composer.placeholder")}
        aria-describedby={hintId}
        className="block max-h-60 min-h-14 w-full resize-y bg-transparent px-4 pt-3 text-base placeholder:text-muted focus:outline-none"
      />

      <div className="flex flex-wrap items-center gap-2 px-2 pb-2">
        {scope?.(attached.map((a) => a.id))}
        <input
          ref={fileInput}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) attachments.add(e.target.files);
            e.target.value = "";
          }}
        />
        <Button
          variant="ghost"
          size="sm"
          icon={<PaperclipIcon />}
          onClick={() => fileInput.current?.click()}
          className="px-2.5 text-muted hover:text-fg"
        >
          {t("composer.addPdfs")}
        </Button>
        {pendingCount > 0 ? (
          <p id={hintId} className="min-w-0 flex-1 truncate text-xs text-muted">
            {tp("composer.waiting", pendingCount)}
          </p>
        ) : (
          <p id={hintId} className="hidden min-w-0 flex-1 truncate text-xs text-muted sm:block">
            {t("composer.hint")}
          </p>
        )}
        <span className="flex-1 sm:hidden" aria-hidden="true" />
        <ComposerActions busy={busy} canSend={canSend} onSend={send} onStop={stop} />
      </div>
    </div>
  );
});
