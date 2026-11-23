import type { components } from "./schema";

type Schemas = components["schemas"];

export type Group = Schemas["GroupOut"];
export type GroupDeleted = Schemas["GroupDeleted"];
export type Conversation = Schemas["ConversationOut"];
export type ConversationDetail = Schemas["ConversationDetail"];
export type Message = Schemas["MessageOut"];
export type Answer = Schemas["AnswerOut"];
export type Rating = NonNullable<Answer["rating"]>;
export type Feedback = Schemas["FeedbackOut"];
export type Source = Schemas["SourceOut"];
export type DocumentInfo = Schemas["DocumentOut"];
export type DocumentRef = Schemas["DocumentRef"];
export type Upload = Schemas["UploadOut"];
export type Settings = Schemas["SettingsOut"];
export type AnswerRequest = Schemas["AnswerRequest"];
export type AnswerEvent = Schemas["AnswerEvent"];
export type DocumentStatusEvent = Schemas["DocumentStatusEvent"];
export type Chunk = Schemas["ChunkOut"];
export type SearchHit = Schemas["SearchHit"];
export type SearchRequest = Schemas["SearchRequest"];
export type SearchMode = NonNullable<SearchRequest["mode"]>;
