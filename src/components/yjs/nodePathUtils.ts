'use client';

import ydoc from './ydoc';
import { DEFAULT_PATH_ID } from './constants';
import { NodeUnion } from '../nodes/types';
import { ArktNode } from '../nodes/arkt/types';

const nodesMap = ydoc.getMap<NodeUnion>('nodes');

function isArktNode(node: NodeUnion | undefined): node is ArktNode {
    return !!node && node.type === 'arktNode';
}

/**
 * Traverses up the node hierarchy to get all ancestor node IDs.
 * Walks from the given node to the root (home), collecting parent IDs.
 * 
 * @param node - The starting node
 * @returns Array of ancestor IDs from immediate parent to root [parentId, grandparentId, ...]
 * 
 * @example
 * // For a node with path: home -> folder1 -> folder2 -> currentNode
 * getAncestorIdsFromNode(currentNode) // returns [folder2.id, folder1.id]
 */
export function getAncestorIdsFromNode(node: ArktNode): string[] {
    const ancestorIds: string[] = [];
    let currentDiagramId = node.data.pathId;
    
    // Walk up the tree until we reach the root (DEFAULT_PATH_ID) or hit a non-ArktNode
    while (currentDiagramId && currentDiagramId !== DEFAULT_PATH_ID) {
        const parentNode = nodesMap.get(currentDiagramId);
        if (!isArktNode(parentNode)) break;
        ancestorIds.push(parentNode.id);
        currentDiagramId = parentNode.data.pathId;
    }
    return ancestorIds;
}

/**
 * Get the path labels from a node.
 * @param node - The node to get the path labels from.
 * @returns The path labels.
 */
export function getNodePathLabelsFromNode(node: ArktNode): string[] {
    const ancestorLabels: string[] = [];
    let currentDiagramId = node.data.pathId;
    while (currentDiagramId && currentDiagramId !== DEFAULT_PATH_ID) {
        const parentNode = nodesMap.get(currentDiagramId);
        if (!isArktNode(parentNode)) break;
        ancestorLabels.push(parentNode.data.label);
        currentDiagramId = parentNode.data.pathId;
    }
    const labels: string[] = [
        DEFAULT_PATH_ID,
        ...ancestorLabels.reverse(),
        node.data.label,
    ];
    return labels;
}

export function getNodePathLabelsFromId(nodeId: string): string[] {
    const node = nodesMap.get(nodeId);
    if (!isArktNode(node)) return [DEFAULT_PATH_ID];
    return getNodePathLabelsFromNode(node);
}


