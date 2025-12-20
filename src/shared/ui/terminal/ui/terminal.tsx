import { useCallback, useEffect, useMemo, useRef, useState, type HTMLAttributes } from 'react';
import { checkIfMobile, cn } from 'src/shared/utils';
import type { StringItem } from '../types';
import { useElementSize } from 'src/shared/hooks/use-element-size';
import styles from '../index.module.css';

export type Props = HTMLAttributes<HTMLDivElement> & {
  strings: StringItem[];
  focusable?: boolean;
};

const isAtBottom = (el: HTMLElement, offset = 10): boolean => {
  return el.scrollHeight - el.scrollTop - el.clientHeight < offset;
};

export const Terminal = ({ className, strings, focusable = false, ...otherProps }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const size = useElementSize(ref);
  const scrollTimeoutRef = useRef<number | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const isMobile = useMemo(() => checkIfMobile(), []);

  const onScroll = useCallback((): void => {
    setAutoScroll(false);

    if (ref.current && isAtBottom(ref.current) && scrollTimeoutRef.current !== null) {
      window.clearTimeout(scrollTimeoutRef.current);
    }

    if (scrollTimeoutRef.current !== null) {
      window.clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = window.setTimeout(() => {
      setAutoScroll(true);
    }, 2000);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  useEffect(() => {
    if (!inputRef.current) return;
    if (!focusable) inputRef.current.blur();
  }, [focusable]);

  useEffect(() => {
    if (!ref.current || !autoScroll) return;

    ref.current.scrollTo({
      top: ref.current.scrollHeight,
      behavior: 'smooth',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strings]);
  
  return (
    <div
      {...otherProps}
      ref={ref}
      style={{ paddingBottom: size.height * (isMobile ? 0.7 : 0.5) }}
      className={cn('absolute w-full h-full md:text-[14px] text-[12px] leading-6.75 font-bold text-[oklch(0.7_0.15_145)] tracking-[0.5px] overflow-auto', styles.main, className)}
      onClick={() => {
        if (focusable) inputRef.current?.focus();
        else inputRef.current?.blur();
      }}
    >
      {strings.map((item, i) => {
        const isLast = i === strings.length - 1;
        return (
          <div key={`${i}-${item.text}`} style={typeof item === 'object' ? item.style : {}} className="inline-flex items-center whitespace-pre-wrap">
            <span>{item.text}</span>
            {isLast && (
              <div className="inline-block relative align-super">
                <div className="absolute w-2.5 h-5 bg-white translate-y-[-50%]" />
              </div>
            )}
          </div>
        );
      })}
      <input
        ref={inputRef}
        id="hidden-input"
        style={{ position: 'absolute', left: -9999, width: 1, height: 1 }}  
        type="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />
    </div>
  );
};
