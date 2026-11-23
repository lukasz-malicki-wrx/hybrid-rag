/**
 * The icons of the app. Import them from "@hybrid-rag/ui/icons" only (ESLint checks it), so the set
 * can be replaced in one place: glyphs.ts.
 */
import { createIcon } from "./create-icon";
import * as glyphs from "./glyphs";

export type { IconProps } from "./create-icon";
export { StarIcon } from "./star-icon";

export const AlertIcon = createIcon("AlertIcon", glyphs.Alert);
export const ArrowRightIcon = createIcon("ArrowRightIcon", glyphs.ArrowRight);
export const BoltIcon = createIcon("BoltIcon", glyphs.Bolt);
export const ChatIcon = createIcon("ChatIcon", glyphs.Chat);
export const CheckIcon = createIcon("CheckIcon", glyphs.Check);
export const ChevronDownIcon = createIcon("ChevronDownIcon", glyphs.ChevronDown);
export const CloseIcon = createIcon("CloseIcon", glyphs.Close);
export const CloudIcon = createIcon("CloudIcon", glyphs.Cloud);
export const ComputerIcon = createIcon("ComputerIcon", glyphs.Computer);
export const CopyIcon = createIcon("CopyIcon", glyphs.Copy);
export const ExternalIcon = createIcon("ExternalIcon", glyphs.External);
export const FileIcon = createIcon("FileIcon", glyphs.File);
export const FrownIcon = createIcon("FrownIcon", glyphs.Frown);
export const GroupIcon = createIcon("GroupIcon", glyphs.Group);
export const MenuIcon = createIcon("MenuIcon", glyphs.Menu);
export const MinusIcon = createIcon("MinusIcon", glyphs.Minus);
export const MoonIcon = createIcon("MoonIcon", glyphs.Moon);
export const NotFoundIcon = createIcon("NotFoundIcon", glyphs.NotFound);
export const PaperclipIcon = createIcon("PaperclipIcon", glyphs.Paperclip);
export const PencilIcon = createIcon("PencilIcon", glyphs.Pencil);
export const PlusIcon = createIcon("PlusIcon", glyphs.Plus);
export const RefreshIcon = createIcon("RefreshIcon", glyphs.Refresh);
export const SearchIcon = createIcon("SearchIcon", glyphs.Search);
export const SendIcon = createIcon("SendIcon", glyphs.Send);
export const SettingsIcon = createIcon("SettingsIcon", glyphs.Settings);
export const SmileIcon = createIcon("SmileIcon", glyphs.Smile);
export const SparklesIcon = createIcon("SparklesIcon", glyphs.Sparkles);
export const SpinnerIcon = createIcon("SpinnerIcon", glyphs.Spinner, { className: "animate-spin motion-reduce:animate-none" });
export const StopIcon = createIcon("StopIcon", glyphs.Stop, { fill: "currentColor" });
export const SunIcon = createIcon("SunIcon", glyphs.Sun);
export const TrashIcon = createIcon("TrashIcon", glyphs.Trash);
export const UnknownIcon = createIcon("UnknownIcon", glyphs.Unknown);
export const UnlimitedIcon = createIcon("UnlimitedIcon", glyphs.Unlimited);
export const UserIcon = createIcon("UserIcon", glyphs.User);
export const RepoIcon = createIcon("RepoIcon", glyphs.Repo);
export const LanguagesIcon = createIcon("LanguagesIcon", glyphs.Languages);
export const PictureIcon = createIcon("PictureIcon", glyphs.Picture);
