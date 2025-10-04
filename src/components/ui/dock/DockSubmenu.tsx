
'use client';

import {
    motion, AnimatePresence
} from 'motion/react';
import { DockItemData } from './types';

type DockSubmenuProps = {
    items: DockItemData[];
    isOpen: boolean;
    onClose: () => void;
};

export function DockSubmenu({ items, isOpen, onClose }: DockSubmenuProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scaleY: 0.8, y: 8 }}
                    animate={{ opacity: 1, scaleY: 1, y: 0 }}
                    exit={{ opacity: 0, scaleY: 0.9, y: 6 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 origin-bottom flex flex-col gap-2 mb-3 overflow-visible z-50 isolate"
                    role="menu"
                    aria-orientation="vertical"
                >
                    {items.map((subItem, idx) => (
                        <motion.button
                            key={`submenu-${idx}`}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 6 }}
                            transition={{ duration: 0.16, delay: idx * 0.03 }}
                            onClick={() => {
                                if (typeof subItem.onClick === 'function') {
                                    subItem.onClick();
                                }
                                onClose();
                            }}
                            className={`inline-flex items-center gap-2 rounded-xl border-2 border-neutral-700 bg-[#060010] px-3 py-2 text-sm text-white shadow-md hover:bg-neutral-900 focus:outline-none overflow-visible ${subItem.className ?? ''}`}
                            role="menuitem"
                        >
                            <div className="relative w-6 h-6 shrink-0 grid place-items-center z-10 overflow-visible pointer-events-none">
                                {subItem.icon}
                            </div>
                            <span className="whitespace-pre">{subItem.label}</span>
                        </motion.button>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
}