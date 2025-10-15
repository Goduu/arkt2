// Re-export the properly initialized maps from the Yjs hooks
// This avoids race conditions with provider initialization
export { nodesMap } from "../yjs/useNodesStateSynced";
export { edgesMap } from "../yjs/useEdgesStateSynced";

