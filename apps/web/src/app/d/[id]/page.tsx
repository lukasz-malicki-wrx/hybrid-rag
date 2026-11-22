import { Suspense, use } from "react";
import { DocumentView } from "@/features/documents/document-view";
import { PageLoading } from "@/features/layout/page-loading";

function Document({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <DocumentView key={id} id={id} />;
}

export default function Page({ params }: PageProps<"/d/[id]">) {
  return (
    <Suspense fallback={<PageLoading label="documentView.loading" />}>
      <Document params={params} />
    </Suspense>
  );
}
