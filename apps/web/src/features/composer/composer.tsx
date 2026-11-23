"use client";

import {
  memo,
  useCallback,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";
import { cn } from "@hybrid-rag/ui/cn";
import { IconButton } from "@hybrid-rag/ui/icon-button";
import { PaperclipIcon } from "@hybrid-rag/ui/icons";
import { useTranslation } from "@/i18n/use-translation";
import { useChatStore, type Attachment } from "@/stores/chat-store";
import { AttachmentChip } from "./attachment-chip";
import { ComposerActions } from "./composer-actions";
import { DropOverlay } from "./drop-overlay";
import { useAttachments } from "./use-attachments";
import { useFileDrop } from "./use-file-drop";

const MAX_QUESTION = 2000;

/** What a parent can do with the message box. */
export type ComposerHandle = {
  /** Replaces the text and focuses the box (attached files stay). */
  setText(text: string): void;
};

/** Browsers without `field-sizing: content` get the height from the text instead. */
function growsByItself() {
  return typeof CSS !== "undefined" && CSS.supports("field-sizing", "content");
}

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
  ref?: Ref<ComposerHandle>;
};

/**
 * Message box with file upload (button or drag and drop). Sending waits until every attached
 * file is indexed, so the answer can use it.
 */
export const Composer = memo(function Composer({ turnKey, onSend, groupId, placeholder, autoFocus, scope, ref }: Props) {
  const { t, tp } = useTranslation();
  const busy = useChatStore((s) => (turnKey ? !!s.turns[turnKey]?.busy : false));
  const stopTurn = useChatStore((s) => s.stop);
  const stop = useCallback(() => turnKey && stopTurn(turnKey), [turnKey, stopTurn]);
  const [text, setText] = useState("");
  const attachments = useAttachments(groupId);
  const { dragging, handlers } = useFileDrop(attachments.add);
  const fileInput = useRef<HTMLInputElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const caretAtEnd = useRef(false);
  const textareaId = useId();
  const hintId = useId();

  useImperativeHandle(
    ref,
    () => ({
      setText(next: string) {
        caretAtEnd.current = true;
        setText(next.slice(0, MAX_QUESTION));
        textarea.current?.focus();
      },
    }),
    [],
  );
  useLayoutEffect(() => {
    const el = textarea.current;
    if (!el) return;
    if (!growsByItself()) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
    if (caretAtEnd.current) {
      caretAtEnd.current = false;
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }, [text]);

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
    <div {...handlers}>
      <div
        className={cn(
          "relative rounded-lg border bg-bubble-user shadow-[0_19px_29px_rgb(30_31_34/0.05)] transition-colors focus-within:border-focus focus-within:ring-2 focus-within:ring-focus/40",
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

        <div className="flex min-h-14 flex-wrap items-end gap-x-1 gap-y-0 p-2">
          <div className="flex min-w-0 max-w-full shrink-0 items-center gap-1">
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
            <IconButton
              label={t("composer.addPdfs")}
              title={t("composer.addPdfs")}
              icon={<PaperclipIcon />}
              onClick={() => fileInput.current?.click()}
              className="size-10"
            />
          </div>

          <label htmlFor={textareaId} className="sr-only">
            {t("composer.message")}
          </label>
          <textarea
            ref={textarea}
            id={textareaId}
            autoFocus={autoFocus}
            value={text}
            rows={1}
            maxLength={MAX_QUESTION}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder ?? t("composer.placeholder")}
            aria-describedby={hintId}
            className="block max-h-60 min-h-10 min-w-48 flex-1 basis-48 resize-none bg-transparent px-2 py-2 text-base field-sizing-content placeholder:text-muted focus:outline-none md:text-sm"
          />

          <ComposerActions busy={busy} canSend={canSend} onSend={send} onStop={stop} />
        </div>
      </div>

      {pendingCount > 0 ? (
        <p id={hintId} className="mt-1.5 px-1 text-xs text-muted">
          {tp("composer.waiting", pendingCount)}
        </p>
      ) : (
        <p id={hintId} className="mt-1.5 hidden px-1 text-xs text-muted sm:block">
          {t("composer.hint")}
        </p>
      )}
    </div>
  );
});
