'use client';

import { useEffect, useMemo, useState } from 'react';
import ydoc from './ydoc';
import type { YMapEvent } from 'yjs';
import { NodeUnion } from '../nodes/types';
import { ArktNode } from '../nodes/arkt/types';
import { DEFAULT_PATH_ID } from './constants';
import { getAncestorIdsFromNode, getNodePathLabelsFromNode } from './nodePathUtils';

const nodesMap = ydoc.getMap<NodeUnion>('nodes');

type NodePathInfo = {
    id: string;
    pathLabels: string[];
    label: string;
};

function isArktNode(node: NodeUnion | undefined): node is ArktNode {
    return !!node && node.type === 'arktNode';
}

export function useNodePath(nodeId?: string): NodePathInfo | undefined {
    const [node, setNode] = useState<ArktNode | undefined>(() => {
        const initial = nodeId ? nodesMap.get(nodeId) : undefined;
        return isArktNode(initial) ? initial : undefined;
    });

    // Track the ancestor ids for selective observation
    const ancestorIds = useMemo(() => (node ? getAncestorIdsFromNode(node) : []), [node?.id, node?.data?.pathId]);

    useEffect(() => {
        if (!nodeId) {
            setNode(undefined);
            return;
        }

        const updateSelf = () => {
            const n = nodesMap.get(nodeId);
            setNode(isArktNode(n) ? n : undefined);
        };

        // initialize
        updateSelf();

        const observer = (event: YMapEvent<NodeUnion>) => {
            if (event.keysChanged.has(nodeId)) {
                updateSelf();
                return;
            }
            // If any ancestor changes, recompute (labels/path changes)
            for (const key of event.keysChanged) {
                if (ancestorIds.includes(key)) {
                    // trigger a recompute without replacing node reference
                    setNode((prev) => (prev && prev.id === nodeId ? { ...prev } : prev));
                    break;
                }
            }
        };

        nodesMap.observe(observer);
        return () => {
            nodesMap.unobserve(observer);
        };
    }, [nodeId, ancestorIds.join('|')]);

    if (!node) return undefined;

    const pathLabels = getNodePathLabelsFromNode(node);
    const label = node.data?.label ?? DEFAULT_PATH_ID;

    return { id: node.id, pathLabels, label };
}

export default useNodePath;


