import { useState, useRef, useEffect, forwardRef, InputHTMLAttributes } from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';

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
}

export const AutoWidthInput = forwardRef<HTMLInputElement, AutoWidthInputProps>(({
    value: controlledValue,
    onChange,
    className = '',
    style = {},
    minWidth = 20,
    hideStroke = false,
    ...props
}, ref) => {
    const [internalValue, setInternalValue] = useState<string>(String(controlledValue || ''));
    const [width, setWidth] = useState<number>(0);
    const spanRef = useRef<HTMLSpanElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Use controlled value if provided, otherwise use internal state
    const value = controlledValue !== undefined ? controlledValue : internalValue;

    useEffect(() => {
        const computeWidth = () => {
            const span = spanRef.current;
            const input = inputRef.current;
            if (!span || !input) return;

            // Synchronize the measurement span's font-related styles to the input's computed styles
            const cs = window.getComputedStyle(input);
            span.style.font = cs.font;
            span.style.letterSpacing = cs.letterSpacing;
            span.style.textTransform = cs.textTransform;
            span.style.fontVariant = cs.fontVariant;
            // Try to sync font-stretch if available across browsers/typings
            const computedFontStretch = cs.fontStretch ?? (typeof cs.getPropertyValue === 'function' ? cs.getPropertyValue('font-stretch') : '');
            if (computedFontStretch) {
                span.style.setProperty('font-stretch', computedFontStretch);
            }

            // Base text width after styles are synced
            const textWidth = Math.ceil(span.offsetWidth);

            // Include input paddings and borders to avoid clipping/scrolling
            const padLeft = parseFloat(cs.paddingLeft) || 0;
            const padRight = parseFloat(cs.paddingRight) || 0;
            const borderLeft = parseFloat(cs.borderLeftWidth) || 0;
            const borderRight = parseFloat(cs.borderRightWidth) || 0;
            const extras = padLeft + padRight + borderLeft + borderRight;

            // Small buffer to prevent jitter
            const next = Math.max(minWidth, textWidth + extras + 2);
            setWidth(next);
        };

        computeWidth();

        // Observe input size changes (e.g., height changes due to font-size)
        const inputResizeObserver = new ResizeObserver(() => computeWidth());
        if (inputRef.current) inputResizeObserver.observe(inputRef.current);

        // Observe measurement span size changes (e.g., when fonts/styles affect text width)
        const spanResizeObserver = new ResizeObserver(() => computeWidth());
        if (spanRef.current) spanResizeObserver.observe(spanRef.current);

        // Listen for viewport changes that might affect layout/metrics
        const handleWindowResize = () => computeWidth();
        window.addEventListener('resize', handleWindowResize);

        // Listen for CSS transitions on font-related properties
        const inputEl = inputRef.current;
        const onTransitionEnd = (e: TransitionEvent) => {
            if (!e.propertyName) return;
            if (
                e.propertyName.includes('font') ||
                e.propertyName === 'letter-spacing' ||
                e.propertyName === 'text-transform' ||
                e.propertyName === 'line-height'
            ) {
                computeWidth();
            }
        };
        inputEl?.addEventListener('transitionend', onTransitionEnd);

        // Observe class/style attribute mutations to catch external style changes
        const mo = new MutationObserver(() => computeWidth());
        if (inputEl) {
            mo.observe(inputEl, { attributes: true, attributeFilter: ['class', 'style'] });
        }

        // Recompute when web fonts finish loading
        const fontsReady = document.fonts?.ready;
        fontsReady?.then(() => computeWidth());

        return () => {
            inputResizeObserver.disconnect();
            spanResizeObserver.disconnect();
            window.removeEventListener('resize', handleWindowResize);
            inputEl?.removeEventListener('transitionend', onTransitionEnd);
            mo.disconnect();
        };
    }, [value, minWidth, className, style]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
            onChange(e);
        } else {
            setInternalValue(e.target.value);
        }
    };

    // Forward ref to the actual input element
    useEffect(() => {
        if (ref) {
            if (typeof ref === 'function') {
                ref(inputRef.current);
            } else {
                ref.current = inputRef.current;
            }
        }
    }, [ref]);

    return (
        <div className="relative inline-block">
            {/* Hidden span to measure text width */}
            <span
                ref={spanRef}
                className={`absolute invisible whitespace-pre ${className}`}
                style={{
                    ...style,
                }}
            >
                {value || props.placeholder || ' '}
            </span>

            {/* Actual input that matches the measured width */}
            <Input
                ref={inputRef}
                hideStroke={hideStroke}
                {...props}
                value={value}
                onChange={(e) => { handleChange(e); }}
                onBlur={(e) => props.onBlur?.(e)}
                className={cn(className, "bg-transparent py-1 px-2")}
                style={{
                    ...style,
                    width: `${Math.max(width, minWidth)}px`
                }}
            />
        </div>
    );
});

AutoWidthInput.displayName = 'AutoWidthInput';