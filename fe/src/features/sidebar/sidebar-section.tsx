import { memo, useId, type ReactNode } from "react";

export const SidebarSection = memo(function SidebarSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <section aria-labelledby={id}>
      <div className="flex items-center justify-between px-2 pb-1">
        <h2 id={id} className="text-xs font-semibold uppercase tracking-wide text-muted">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
});
