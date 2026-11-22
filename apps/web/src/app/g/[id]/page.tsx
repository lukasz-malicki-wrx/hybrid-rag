import { Suspense, use } from "react";
import { GroupView } from "@/features/groups/group-view";
import { PageLoading } from "@/features/layout/page-loading";

function Group({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <GroupView key={id} id={id} />;
}

export default function Page({ params }: PageProps<"/g/[id]">) {
  return (
    <Suspense fallback={<PageLoading label="groups.loading" />}>
      <Group params={params} />
    </Suspense>
  );
}
