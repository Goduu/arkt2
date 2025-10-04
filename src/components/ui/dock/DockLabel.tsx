
'use client';

import {
    motion,
    MotionValue, AnimatePresence
} from 'motion/react';
import { useEffect, useState, useContext, createContext } from 'react';
import type { ReactNode } from 'react';


type DockLabelProps = {
    className?: string;
    children: ReactNode;
    isHovered?: MotionValue<number>;
    hidden?: boolean;
};

const HoverContext = createContext<MotionValue<number> | null>(null);

export function DockLabel({ children, className = '', isHovered, hidden = false }: DockLabelProps) {
    const [isVisible, setIsVisible] = useState(false);
    const ctxHover = useContext(HoverContext);
    const hover = isHovered ?? ctxHover;

    useEffect(() => {
        if (!hover) return;
        const unsubscribe = hover.on('change', latest => {
            setIsVisible(latest === 1);
        });
        return () => unsubscribe();
    }, [hover]);

    return (
        <AnimatePresence>
            {isVisible && !hidden && (
                <motion.div
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: -10 }}
                    exit={{ opacity: 0, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`${className} absolute -top-6 left-1/2 w-fit whitespace-pre rounded-md border border-neutral-700 bg-[#060010] px-2 py-0.5 text-xs text-white`}
                    role="tooltip"
                    style={{ x: '-50%' }}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}