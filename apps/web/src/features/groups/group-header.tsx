"use client";

import { memo, useCallback, useState } from "react";
import { BarHeader } from "@hybrid-rag/ui/bar-header";
import { Heading } from "@hybrid-rag/ui/heading";
import { IconButton } from "@hybrid-rag/ui/icon-button";
import { PencilIcon, TrashIcon } from "@hybrid-rag/ui/icons";
import type { Group } from "@/api/types";
import { useTranslation } from "@/i18n/use-translation";
import { DeleteGroupDialog } from "./delete-group-dialog";
import { RenameGroupForm } from "./rename-group-form";

export const GroupHeader = memo(function GroupHeader({ group }: { group: Group }) {
  const { t, tp } = useTranslation();
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const stopRenaming = useCallback(() => setRenaming(false), []);
  const closeDelete = useCallback(() => setDeleting(false), []);

  return (
    <>
      {renaming ? (
        <BarHeader className="gap-3">
          <RenameGroupForm id={group.id} name={group.name} onDone={stopRenaming} />
        </BarHeader>
      ) : (
        <BarHeader
          subtitle={`${tp("counts.conversations", group.conversation_count)} · ${tp("counts.documents", group.document_count)}`}
          actions={
            <>
              <IconButton
                variant="tile"
                label={t("groups.rename")}
                icon={<PencilIcon />}
                onClick={() => setRenaming(true)}
              />
              <IconButton
                variant="tile"
                tone="danger"
                label={t("groups.delete")}
                icon={<TrashIcon />}
                onClick={() => setDeleting(true)}
              />
            </>
          }
        >
          <Heading level={1} size="bar" className="truncate">
            {group.name}
          </Heading>
        </BarHeader>
      )}
      <DeleteGroupDialog group={group} open={deleting} onClose={closeDelete} />
    </>
  );
});
