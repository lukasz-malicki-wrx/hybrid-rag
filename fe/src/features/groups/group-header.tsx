"use client";

import { memo, useCallback, useState } from "react";
import type { Group } from "@/api/types";
import { PencilIcon, TrashIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
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
    <div className="flex flex-wrap items-center gap-2 border-b border-border py-4">
      {renaming ? (
        <RenameGroupForm id={group.id} name={group.name} onDone={stopRenaming} />
      ) : (
        <>
          <Heading level={1} size="lg" className="min-w-0 flex-1 truncate">
            {group.name}
          </Heading>
          <Button variant="ghost" size="sm" icon={<PencilIcon />} onClick={() => setRenaming(true)}>
            {t("groups.rename")}
          </Button>
          <Button variant="danger-ghost" size="sm" icon={<TrashIcon />} onClick={() => setDeleting(true)}>
            {t("groups.delete")}
          </Button>
        </>
      )}
      <Text tone="muted" size="sm" className="w-full">
        {tp("counts.conversations", group.conversation_count)} · {tp("counts.documents", group.document_count)}.{" "}
        {t("groups.scopeNote")}
      </Text>
      <DeleteGroupDialog group={group} open={deleting} onClose={closeDelete} />
    </div>
  );
});
