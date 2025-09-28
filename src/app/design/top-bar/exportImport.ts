import { ArktEdge } from "@/components/edges/ArktEdge/type";
import { NodeUnion } from "@/components/nodes/types";
import { TemplateData } from "@/components/templates/types";
import { edgesMap } from "@/components/yjs/useEdgesStateSynced";
import { nodesMap } from "@/components/yjs/useNodesStateSynced";
import { templatesMap } from "@/components/yjs/useTemplatesStateSynced";
import ydoc from "@/components/yjs/ydoc";
import { type UserData } from "@/components/yjs/useUserStateSynced";
import { DEFAULT_PATH_ID } from "@/components/yjs/constants";
import { decryptBlobToString, EncryptedBlob, encryptStringToBlob } from "@/lib/server/crypto";

// New structured export with options and optional encryption
export type ExportPayload = {
  snapshot: {
    nodes: NodeUnion[];
    edges: ArktEdge[];
    templates: TemplateData[];
  };
};

export type ExportEnvelope =
  | { v: 1; kind: "arkt-export"; encrypted: false; data: ExportPayload }
  | { v: 1; kind: "arkt-export"; encrypted: true; blob: EncryptedBlob };

export type ExportOptions = {
  diagramName?: string;
  includeOpenAIKey?: boolean;
  encrypt?: boolean;
  password?: string;
  scope?: "current" | "all";
};

export async function exportWithOptions(options: ExportOptions): Promise<void> {
  const { encrypt, password, diagramName, scope = "current" } = options;
  const currentDiagramId = getCurrentDiagramId();
  const snapshot = readSnapshot(scope === "current" ? currentDiagramId : undefined);
  // if (!includeOpenAIKey) {
  //   delete snapshot.encryptedOpenAIKey;
  // }

  const payload: ExportPayload = {
    snapshot,
  };

  let envelope: ExportEnvelope;
  if (encrypt) {
    if (!password) throw new Error("Password required for encryption");
    const blob = await encryptStringToBlob(JSON.stringify(payload), password);
    envelope = { v: 1, kind: "arkt-export", encrypted: true, blob };
  } else {
    envelope = { v: 1, kind: "arkt-export", encrypted: false, data: payload };
  }
  const fileBlob = new Blob([JSON.stringify(envelope, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(fileBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `arkt-snapshot-${diagramName ?? "export"}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export type ParsedImport =
  | { encrypted: true; blob: EncryptedBlob }
  | { encrypted: false; payload: ExportPayload }
  | { encrypted: false; payload: { snapshot: LegacyAppStateSnapshot } };

type LegacyAppStateSnapshot = { rootId: string; diagrams: unknown };

export function parseImportText(text: string): ParsedImport {
  const obj = JSON.parse(text);
  if (obj && typeof obj === "object" && obj.kind === "arkt-export" && obj.v === 1) {
    if (obj.encrypted === true && obj.blob && typeof obj.blob === "object") {
      return { encrypted: true, blob: obj.blob };
    }
    return { encrypted: false, payload: obj.data };
  }
  // Fallback legacy: treat as direct snapshot
  if (obj && typeof obj === "object" && "diagrams" in obj && "rootId" in obj) {
    return { encrypted: false, payload: { snapshot: obj } };
  }
  throw new Error("Unsupported import file format");
}

export async function decryptImportedBlob(blob: EncryptedBlob, password: string): Promise<ExportPayload> {
  const json = await decryptBlobToString(blob, password);
  return JSON.parse(json);
}

export type ApplyMode = "merge" | "replace";

export async function importFromEnvelopeText(fileText: string, options?: { password?: string; applyMode?: ApplyMode }) {
  const parsed = parseImportText(fileText);
  let payload: ExportPayload;
  if (parsed.encrypted) {
    const password = options?.password;
    if (!password) throw new Error("Password required to decrypt this file");
    payload = await decryptImportedBlob(parsed.blob, password);
  } else {
    const p = parsed.payload as ExportPayload;
    if (!p?.snapshot) throw new Error("Unsupported legacy snapshot format");
    payload = p;
  }
  applySnapshot(payload.snapshot, options?.applyMode ?? "merge");
}

export function applySnapshot(snapshot: { nodes: NodeUnion[]; edges: ArktEdge[]; templates: TemplateData[] }, mode: ApplyMode = "merge") {
  if (mode === "replace") {
    for (const key of Array.from(nodesMap.keys())) nodesMap.delete(key);
    for (const key of Array.from(edgesMap.keys())) edgesMap.delete(key);
    for (const key of Array.from(templatesMap.keys())) templatesMap.delete(key);
  }

  for (const node of snapshot.nodes) nodesMap.set(node.id, node);
  for (const edge of snapshot.edges) edgesMap.set(edge.id, edge);
  for (const template of snapshot.templates) templatesMap.set(template.id, template);
}

function getCurrentDiagramId(): string {
  const usersDataMap = ydoc.getMap<UserData>("usersData");
  const current = usersDataMap.get(ydoc.clientID.toString());
  return current?.currentDiagramId || DEFAULT_PATH_ID;
}

function readSnapshot(diagramId?: string): { nodes: NodeUnion[]; edges: ArktEdge[]; templates: TemplateData[] } {
  const nodes = Array.from(nodesMap.values());
  const edges = Array.from(edgesMap.values());
  const templates = Array.from(templatesMap.values());

  if (!diagramId) {
    return { nodes, edges, templates };
  }

  const filteredNodes = nodes.filter((n) => n?.data?.pathId === diagramId);
  const filteredEdges = edges.filter((e) => e?.data?.pathId === diagramId);
  return { nodes: filteredNodes, edges: filteredEdges, templates };
}


