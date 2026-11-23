"use client";

import { isNotFound } from "@/api/client";
import { useGroup } from "@/api/groups";
import type { Group } from "@/api/types";
import { Column, ComposerColumn } from "@/features/chat/column";
import { PendingTurn } from "@/features/chat/pending-turn";
import { useNewConversation } from "@/features/chat/use-new-conversation";
import { Composer } from "@/features/composer/composer";
import { Page } from "@/features/layout/page";
import { NotFoundView } from "@/features/layout/not-found-view";
import { PageLoading } from "@/features/layout/page-loading";
import { GroupConversations } from "./group-conversations";
import { GroupDocuments } from "./group-documents";
import { GroupHeader } from "./group-header";

/**
 * One page: the group's bar, then a panel with its lists and the message box at the bottom. The
 * first question starts a conversation in the group, like the start screen does outside one.
 */
function GroupPage({ group }: { group: Group }) {
  const { composer, pending, openSources, aside } = useNewConversation({ groupId: group.id, groupName: group.name });
  return (
    <Page
      header={<GroupHeader group={group} />}
      footer={
        <ComposerColumn>
          <Composer {...composer} />
        </ComposerColumn>
      }
      aside={aside}
    >
      <PendingTurn {...pending} onOpenSources={openSources} className="pt-6" />
      <Column className="@container py-6">
        <div className="grid gap-8 @2xl:grid-cols-2">
          <GroupConversations groupId={group.id} />
          <GroupDocuments groupId={group.id} />
        </div>
      </Column>
    </Page>
  );
}

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

  return <GroupPage group={group.data} />;
}
