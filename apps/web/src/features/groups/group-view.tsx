"use client";

import { isNotFound } from "@/api/client";
import { useGroup } from "@/api/groups";
import { NewConversation } from "@/features/chat/new-conversation";
import { NotFoundView } from "@/features/layout/not-found-view";
import { PageLoading } from "@/features/layout/page-loading";
import { GroupConversations } from "./group-conversations";
import { GroupDocuments } from "./group-documents";
import { GroupHeader } from "./group-header";

export function GroupView({ id }: { id: string }) {
  const group = useGroup(id);

  if (group.isPending) return <PageLoading label="groups.loading" />;
  if (!group.data)
    return (
      <NotFoundView
        title={isNotFound(group.error) ? "groups.notFound" : "groups.loadError"}
        linkLabel="groups.back"
      />
    );

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-10">
      <GroupHeader group={group.data} />
      <NewConversation groupId={group.data.id} groupName={group.data.name} />
      <div className="grid gap-8 lg:grid-cols-2">
        <GroupConversations groupId={group.data.id} />
        <GroupDocuments groupId={group.data.id} />
      </div>
    </div>
  );
}
