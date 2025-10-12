

export type SelectionState = {
    user?: { name?: string; color?: string };
    selection?: { nodes?: string[] };
};

export type CursorAwarenessState = {
    cursor?: { x: number; y: number; timestamp: number };
    user?: { name: string; color: string };
};