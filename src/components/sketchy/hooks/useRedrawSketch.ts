import { RefObject, useLayoutEffect } from "react";

type UseRedrawSketchProps = {
    containerRef: RefObject<HTMLDivElement | null>;
    setSize: (size: { width: number, height: number }) => void;
}

// Track container size so sketch can redraw accurately (rAF-throttled)
export function useRedrawSketch(props: UseRedrawSketchProps) {
    const { containerRef, setSize } = props;
    useLayoutEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const rafIdRef: { current: number | null } = { current: null };

        const scheduleUpdate = () => {
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = requestAnimationFrame(() => {
                const target = containerRef.current;
                if (!target) return;
                const nextWidth = target.clientWidth;
                const nextHeight = target.clientHeight;
                if (nextWidth > 0 && nextHeight > 0) {
                    setSize({ width: nextWidth, height: nextHeight });
                }
            });
        };

        // Initial measurement
        scheduleUpdate();

        const ro = new ResizeObserver(() => scheduleUpdate());
        ro.observe(el);
        return () => {
            ro.disconnect();
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        };
    }, []);
}