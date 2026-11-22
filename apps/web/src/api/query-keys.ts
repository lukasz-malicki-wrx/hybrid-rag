export type ConversationFilter = { groupId?: string; favorites?: boolean };

/** React Query keys. The first element is the prefix used for invalidation. */
export const queryKeys = {
  groups: () => ["groups"] as const,
  group: (id: string) => ["groups", id] as const,
  conversations: (filter: ConversationFilter = {}) => ["conversations", filter] as const,
  conversation: (id: string) => ["conversation", id] as const,
  documents: (groupId?: string) => ["documents", groupId ?? "all"] as const,
  document: (id: string) => ["document", id] as const,
  chunks: (documentId: string) => ["chunks", documentId] as const,
  settings: () => ["settings"] as const,
};
