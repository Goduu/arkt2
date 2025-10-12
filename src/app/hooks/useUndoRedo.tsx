import { useCallback, useEffect, useState, useRef } from 'react';
import { UndoManager } from 'yjs';
import ydoc from '@/components/yjs/ydoc';
import { nodesMap } from '@/components/yjs/useNodesStateSynced';
import { edgesMap } from '@/components/yjs/useEdgesStateSynced';

type UseUndoRedoOptions = {
    enableShortcuts?: boolean;
};

type UseUndoRedo = (options?: UseUndoRedoOptions) => {
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
};

const defaultOptions: UseUndoRedoOptions = {
    enableShortcuts: true,
};

/**
 * Yjs-compatible undo/redo hook that uses Yjs's built-in UndoManager.
 * This ensures each user only undoes their own changes in collaborative editing.
 * 
 * maxHistorySize is not used by Yjs UndoManager (kept for API compatibility).
 */
export const useUndoRedo: UseUndoRedo = ({
    enableShortcuts = defaultOptions.enableShortcuts,
} = defaultOptions) => {
    const undoManagerRef = useRef<UndoManager | null>(null);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    // Initialize UndoManager
    useEffect(() => {
        // Create UndoManager that tracks both nodes and edges
        // trackedOrigins ensures we only track changes from this client
        const undoManager = new UndoManager([nodesMap, edgesMap], {
            trackedOrigins: new Set([ydoc.clientID]),
            captureTimeout: 500, // Group rapid changes within 500ms
        });

        undoManagerRef.current = undoManager;

        // Update can undo/redo state
        const updateState = () => {
            setCanUndo(undoManager.undoStack.length > 0);
            setCanRedo(undoManager.redoStack.length > 0);
        };

        // Listen to stack changes
        undoManager.on('stack-item-added', updateState);
        undoManager.on('stack-item-popped', updateState);
        undoManager.on('stack-cleared', updateState);

        updateState();

        return () => {
            undoManager.stopCapturing();
            undoManager.clear();
        };
    }, []);

    const undo = useCallback(() => {
        if (undoManagerRef.current && undoManagerRef.current.undoStack.length > 0) {
            undoManagerRef.current.undo();
        }
    }, []);

    const redo = useCallback(() => {
        if (undoManagerRef.current && undoManagerRef.current.redoStack.length > 0) {
            undoManagerRef.current.redo();
        }
    }, []);

    useEffect(() => {
        if (!enableShortcuts) {
            return;
        }

        const keyDownHandler = (event: KeyboardEvent) => {
            if (
                event.key?.toLowerCase() === 'z' &&
                (event.ctrlKey || event.metaKey) &&
                event.shiftKey
            ) {
                event.preventDefault();
                redo();
            } else if (
                event.key?.toLowerCase() === 'z' &&
                (event.ctrlKey || event.metaKey)
            ) {
                event.preventDefault();
                undo();
            }
        };

        document.addEventListener('keydown', keyDownHandler);

        return () => {
            document.removeEventListener('keydown', keyDownHandler);
        };
    }, [undo, redo, enableShortcuts]);

    return {
        undo,
        redo,
        canUndo,
        canRedo,
    };
};

export default useUndoRedo;
