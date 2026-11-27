/**
 * App components: apps/web/src/features, built from core instances. Order matters: a component
 * is built after the ones it contains.
 *
 * Properties (variants named as the code's props; text and boolean properties by layer name):
 *  Rail                section = chats | groups | documents | search
 *  RailItem            active = true | false, state = default | hover | focus; Icon (swap)
 *  LanguageSwitch      state; Code (text)
 *  ColumnHeader        action = true | false; Title
 *  ConversationCard    state = default | hover | active, favourite = false | true; Title, Time, Preview
 *  SidebarDocumentItem state; Filename
 *  SidebarEmpty        Message
 *  GroupRow            state = default | hover | active; Name, Count
 *  DocumentStatus      status = ready | failed | indexing | queued
 *  MobileHeader, ConversationHeader (favourite, group; Title, Subtitle), DocumentHeader (Title, Subtitle)
 *  DaySeparator        Label
 *  QuestionBubble      shape = short | multiline; Text
 *  Message             role = question | answer, shape, rating = none | up | down, layout = wide | narrow; Time, Body
 *  RatingPill          rating;  AnswerFlags  flag = none | notFound | noCitations | stopped
 *  AnswerActions       rating, layout;  CitationButton  state; Number
 *  SourceCard          selected; Number, Filename, Meta, Passage text;  SourcesPanel  Title, Subtitle
 *  AnsweringIndicator, AttachmentChip (status; Name), ScopeTrigger (scope = all | group | selected)
 *  ComposerActions     mode = send | disabled | stop
 *  Composer            scope, attachments, state, layout; Placeholder, Hint
 *  StartCard (kind), StartScreen (layout), SearchHitCard (ranks; Position, Link, Passage), SearchModeSelect (value; Legend)
 *  ChunkCard (short; Page, Position, Characters, Text), ChunkStats (five "... value" texts)
 *  GroupDocumentItem (Filename), ConversationRow (favourite; Title, Time, Preview), SettingsDialogBody, SettingsDialog
 */
import { buildSidebarParts } from "./app/sidebar.js";
import { buildChatParts } from "./app/chat.js";
import { buildComposerParts } from "./app/composer.js";
import { buildContentParts } from "./app/content.js";

export async function buildAppComponents() {
  await buildSidebarParts();
  await buildChatParts();
  await buildComposerParts();
  await buildContentParts();
}
