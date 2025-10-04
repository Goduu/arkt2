
'use client';

import {
  motion, useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions
} from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DockItemData } from './types';
import { DockSubmenu } from './DockSubmenu';
import { DockIcon } from './DockIcon';
import { DockLabel } from './DockLabel';
import { DockItem } from './DockItem';


export type DockProps = {
  items: DockItemData[];
  className?: string;
  distance?: number;
  panelHeight?: number;
  baseItemSize?: number;
  dockHeight?: number;
  magnification?: number;
  spring?: SpringOptions;
};


export default function Dock({
  items,
  className = '',
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 70,
  distance = 200,
  panelHeight = 64,
  dockHeight = 256,
  baseItemSize = 50
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  const maxHeight = useMemo(() => Math.max(dockHeight, magnification + magnification / 2 + 4), [magnification]);
  const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
  const height = useSpring(heightRow, spring);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node | null;
      if (dockRef.current && target && !dockRef.current.contains(target)) {
        setOpenIndex(null);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpenIndex(null);
      }
    }
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKey);
    };
  }, []);

  return (
    <motion.div style={{ height, scrollbarWidth: 'none' }} className="mx-2 flex max-w-full items-center">
      <motion.div
        ref={dockRef}
        onMouseMove={({ pageX }) => {
          isHovered.set(1);
          mouseX.set(pageX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        className={`${className} absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-end w-fit gap-4 rounded-2xl border-neutral-700 border-2 pb-2 px-4`}
        style={{ height: panelHeight }}
        role="toolbar"
        aria-label="Application dock"
      >
        {items.map((item, index) => {
          const subItems = item.subItems ?? [];
          const hasSubmenu = subItems.length > 0;

          const handleItemClick = () => {
            if (hasSubmenu) {
              setOpenIndex(prev => (prev === index ? null : index));
              return;
            }
            if (typeof item.onClick === 'function') {
              item.onClick();
            }
          };

          return (
            <DockItem
              key={index}
              onClick={handleItemClick}
              className={item.className}
              mouseX={mouseX}
              spring={spring}
              distance={distance}
              magnification={magnification}
              baseItemSize={baseItemSize}
            >
              <DockIcon>{item.icon}</DockIcon>
              <DockLabel hidden={openIndex === index}>{item.label}</DockLabel>
              {hasSubmenu && (
                <DockSubmenu items={subItems} isOpen={openIndex === index} onClose={() => setOpenIndex(null)} />
              )}
            </DockItem>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
