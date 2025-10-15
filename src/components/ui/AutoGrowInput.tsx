import { SketchyPanelProps } from '@/components/sketchy/SketchyPanel';
import React, { useState, useRef, useEffect, FC, RefObject, FocusEvent } from 'react';
import { getTailwindTextClass } from '../colors/utils';
import { useTheme } from 'next-themes';
import { cn } from '../utils';
import SketchyShape from '../sketchy/SketchyShape';

type AutoGrowInputProps = SketchyPanelProps & {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    minWidth?: number;
    maxWidth?: number;
    className?: string;
    fontSize?: number;
    hideStroke?: boolean;
    readOnly?: boolean;
    ref?: RefObject<HTMLInputElement | null>;
    onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
}

export const AutoGrowInput: FC<AutoGrowInputProps> = ({
    placeholder = "Type here...",
    value: controlledValue,
    onChange,
    minWidth = 20,
    maxWidth = 400,
    className = "",
    fillColor,
    strokeColor,
    fillStyle,
    fillWeight,
    roughness,
    fontSize,
    hideStroke,
    readOnly,
    ref,
    onBlur,
}) => {
    const [internalValue, setInternalValue] = useState<string>("");
    const [inputWidth, setInputWidth] = useState<number>(minWidth);
    const spanRef = useRef<HTMLSpanElement>(null);
    const { resolvedTheme: theme } = useTheme();

    // Use controlled value if provided, otherwise use internal state
    const value = controlledValue !== undefined ? controlledValue : internalValue;

    // Update width when value changes
    useEffect(() => {
        if (spanRef.current) {
            const textWidth = spanRef.current.offsetWidth;
            const newWidth = Math.max(minWidth, Math.min(maxWidth, textWidth + 16)); // Add padding
            setInputWidth(newWidth);
        }
    }, [value, minWidth, maxWidth, fontSize]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const newValue = event.target.value;

        if (controlledValue === undefined) {
            setInternalValue(newValue);
        }

        if (onChange) {
            onChange(newValue);
        }
    };

    const textClass = getTailwindTextClass(strokeColor, theme);

    return (
        <>
            <SketchyShape
                kind="rectangle"
                fillColor={fillColor}
                strokeColor={strokeColor}
                fillStyle={fillStyle}
                fillWeight={fillWeight}
                roughness={roughness}
                strokeWidth={hideStroke ? 0 : 6}
                className='absolute p-0 inset-0 z-0 size-full'
            />

            <div className="relative flex items-center justify-center">
                {/* Hidden span to measure text width */}
                <span
                    ref={spanRef}
                    className="absolute invisible whitespace-pre text-base font-normal"
                    style={{
                        fontSize: `${fontSize ?? 12}px`,
                        fontFamily: 'inherit',
                        padding: '0',
                        border: '0',
                        left: '-9999px',
                        top: '-9999px'
                    }}
                >
                    {value || placeholder}
                </span>

                <input
                    ref={ref}
                    disabled={readOnly}
                    type="text"
                    value={value}
                    onChange={handleChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    className={cn(`px-1 py-0 items-center justify-center rounded-md focus:outline-none focus:ring-0 focus:border-transparent text-base ${textClass} ${className}`)}
                    style={{
                        width: `${inputWidth}px`,
                        transition: 'width 0.1s ease-out',
                        fontSize: `${fontSize ?? 12}px`,
                    }}
                />
            </div>
        </>

    );
};