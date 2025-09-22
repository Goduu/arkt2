import { useState, useRef, useEffect, InputHTMLAttributes, ChangeEvent, useCallback, forwardRef, RefObject } from 'react';
import { Input } from './input';
import { Color } from '../colors/types';

interface AutoWidthInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'width'> {
    /**
     * Minimum width of the input in pixels
     * @default 20
     */
    minWidth?: number;
    /**
     * Additional CSS class names
     */
    className?: string;
    /**
     * Inline styles for the input
     */
    style?: React.CSSProperties;
    hideStroke?: boolean;
    fillColor: Color;
    strokeColor?: Color;
}

export const AutoWidthInput = forwardRef<HTMLInputElement, AutoWidthInputProps>(({ 
    value = '',
    onChange,
    minWidth = 30,
    placeholder = '',
    className = '',
    fillColor,
    strokeColor,
    style = {},
    ...props
}, ref) => {
    const [inputWidth, setInputWidth] = useState(minWidth);
    const spanRef = useRef<HTMLSpanElement>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    // Merge local ref with forwarded ref
    const setRefs = useCallback((node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as RefObject<HTMLInputElement | null>).current = node;
    }, [ref]);

    useEffect(() => {
        if (!spanRef.current) return;
        // Copy computed font styles from the actual input for accurate measurement
        const inputNode = inputRef.current;
        if (inputNode) {
            const computed = window.getComputedStyle(inputNode);
            spanRef.current.style.fontFamily = computed.fontFamily;
            spanRef.current.style.fontSize = computed.fontSize;
            spanRef.current.style.fontWeight = computed.fontWeight;
            spanRef.current.style.letterSpacing = computed.letterSpacing;
            spanRef.current.style.textTransform = computed.textTransform as string;
        }

        // Update width
        const text = (value as string) || placeholder || '';
        spanRef.current.textContent = text === '' ? ' ' : text;
        const textWidth = spanRef.current.offsetWidth;
        const newWidth = Math.max(textWidth, minWidth);
        setInputWidth(newWidth);
    }, [value, placeholder, minWidth, className, style]);

    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        if (onChange) onChange(e);
    }, [onChange]);

    return (
        <div className="relative items-center flex justify-center">
            <span
                ref={spanRef}
                className="invisible absolute whitespace-pre py-2"
            />

            <Input
                ref={setRefs}
                fillColor={fillColor}
                strokeColor={strokeColor}
                type="text"
                value={value}
                fillStyle='solid'
                onChange={handleChange}
                placeholder={placeholder}
                className={className + " py-0"}
                style={{
                    width: `${inputWidth}px`,
                    minWidth: `${minWidth}px`,
                    ...style
                }}
                {...props}
            />
        </div>
    );
});

AutoWidthInput.displayName = 'AutoWidthInput';