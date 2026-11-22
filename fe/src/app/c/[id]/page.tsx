import { Suspense, use } from "react";
import { ConversationView } from "@/features/chat/conversation-view";
import { PageLoading } from "@/features/layout/page-loading";

function Conversation({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ConversationView key={id} id={id} />;
}

export default function Page({ params }: PageProps<"/c/[id]">) {
  return (
    <Suspense fallback={<PageLoading label="chat.loading" />}>
      <Conversation params={params} />
    </Suspense>
  );
}
