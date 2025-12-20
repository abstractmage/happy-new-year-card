import { useState, type HTMLAttributes } from 'react';
import styles from '../index.module.css';
import { cn } from 'src/shared/utils';

export type Props = HTMLAttributes<HTMLDivElement> & {
  rows: string[];
  onFinish?: VoidFunction;
};

export const ScrollTelling = ({ className, rows, onFinish, ...otherProps }: Props) => {
  const [paused, setPaused] = useState(false);

  return (
    <div
      {...otherProps}
      className={cn(styles.main, 'overflow-hidden', className)}
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => setPaused(false)}
      onPointerLeave={() => setPaused(false)}
      onPointerCancel={() => setPaused(false)}
    >
      <div className={cn(styles.inner, paused && styles.paused, 'w-full absolute scroll-up flex justify-center')} onAnimationEnd={onFinish}>
        <div className="w-full md:max-w-3xl md:p-0 px-4 md:text-base text-xs">
          {rows.map((row, i) => <div key={i} className={cn(styles.row, 'leading-8')}>{row}</div>)}
        </div>
      </div>
    </div>
  );
};
