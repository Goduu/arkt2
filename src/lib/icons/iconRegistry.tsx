"use client";
import {
  Activity,
  Database,
  Cloud,
  Server,
  Shield,
  Globe,
  Box,
  Cpu,
  Code2,
  GitBranch,
  CircuitBoard,
  Rocket,
  Layers,
  LucideIcon,
  Link,
  Folder,
  Bug,
  Braces,
  Binary,
  Container,
  ChevronsLeftRight,
  Cable,
  FileSpreadsheet,
  Sheet,
  User,
  Boxes,
  ChartSpline,
  Settings,
  Laptop,
  Router,
  HardDrive,
  HardDriveUpload,
  HardDriveDownload,
  Wifi,
  Rss,
  BatteryCharging,
  TvMinimal,
  Pen,
  HandCoins,
  GlobeLock,
  Bot,
  Upload,
  Github,
  Terminal,
  NotepadTextDashed,
  FolderSearch,
} from "lucide-react";
import { z } from "zod";

export type IconKey =
  | "activity"
  | "braces"
  | "binary"
  | "bug"
  | "box"
  | "database"
  | "circuit"
  | "cloud"
  | "container"
  | "cpu"
  | "code"
  | "globe"
  | "git-branch"
  | "none"
  | "server"
  | "shield"
  | "rocket"
  | "link"
  | "folder"
  | "chevron"
  | "cable"
  | "spreadsheet"
  | "sheet"
  | "user"
  | "boxes"
  | "spline"
  | "settings"
  | "laptop"
  | "router"
  | "hard-drive"
  | "hard-drive-upload"
  | "hard-drive-download"
  | "wifi"
  | "rss"
  | "battery-charging"
  | "tv-minimal"
  | "pen"
  | "hand-coins"
  | "layers"
  | "notepad-text-dashed"
  | "terminal"
  | "github"
  | "upload"
  | "bot"
  | "globe-lock"
  | "folder-search";


export type IconDefinition = {
  key: IconKey;
  label: string;
  Icon: LucideIcon;
};

export const ICONS: IconDefinition[] = [
  { key: "activity", label: "Activity", Icon: Activity },
  { key: "tv-minimal", label: "TV Minimal", Icon: TvMinimal },
  { key: "database", label: "Database", Icon: Database },
  { key: "cloud", label: "Cloud", Icon: Cloud },
  { key: "server", label: "Server", Icon: Server },
  { key: "shield", label: "Shield", Icon: Shield },
  { key: "globe", label: "Globe", Icon: Globe },
  { key: "box", label: "Box", Icon: Box },
  { key: "cpu", label: "CPU", Icon: Cpu },
  { key: "code", label: "Code", Icon: Code2 },
  { key: "git-branch", label: "Git Branch", Icon: GitBranch },
  { key: "circuit", label: "Circuit", Icon: CircuitBoard },
  { key: "rocket", label: "Rocket", Icon: Rocket },
  { key: "folder", label: "Folder", Icon: Folder },
  { key: "bug", label: "Bug", Icon: Bug },
  { key: "braces", label: "Braces", Icon: Braces },
  { key: "binary", label: "Binary", Icon: Binary },
  { key: "container", label: "Container", Icon: Container },
  { key: "chevron", label: "Chevron", Icon: ChevronsLeftRight },
  { key: "cable", label: "Cable", Icon: Cable },
  { key: "spreadsheet", label: "Spreadsheet", Icon: FileSpreadsheet },
  { key: "sheet", label: "Sheet", Icon: Sheet },
  { key: "user", label: "User", Icon: User },
  { key: "boxes", label: "Boxes", Icon: Boxes },
  { key: "spline", label: "Spline", Icon: ChartSpline },
  { key: "settings", label: "Settings", Icon: Settings },
  { key: "laptop", label: "Laptop", Icon: Laptop },
  { key: "router", label: "Router", Icon: Router },
  { key: "hard-drive", label: "Hard Drive", Icon: HardDrive },
  { key: "hard-drive-upload", label: "Hard Drive Upload", Icon: HardDriveUpload },
  { key: "hard-drive-download", label: "Hard Drive Download", Icon: HardDriveDownload },
  { key: "wifi", label: "Wifi", Icon: Wifi },
  { key: "rss", label: "RSS", Icon: Rss },
  { key: "battery-charging", label: "Battery Charging", Icon: BatteryCharging },
  { key: "pen", label: "Pen", Icon: Pen },
  { key: "hand-coins", label: "Hand Coins", Icon: HandCoins },
  { key: "layers", label: "Layers", Icon: Layers },
  { key: "notepad-text-dashed", label: "Notepad Text Dashed", Icon: NotepadTextDashed },
  { key: "terminal", label: "Terminal", Icon: Terminal },
  { key: "link", label: "Link", Icon: Link },
  { key: "github", label: "GitHub", Icon: Github },
  { key: "upload", label: "Upload", Icon: Upload },
  { key: "bot", label: "Bot", Icon: Bot },
  { key: "globe-lock", label: "Globe Lock", Icon: GlobeLock },
  { key: "folder-search", label: "Folder Search", Icon: FolderSearch },
];

export const IconSchema = z.enum(ICONS.map((d) => d.key));
export type Icon = z.infer<typeof IconSchema>;

export function getIconByKey(key: string | undefined): IconDefinition | undefined {
  if (!key || key === "none") return undefined;
  return ICONS.find((d) => d.key === key);
}


