import type { HTMLAttributes } from 'react';
import styles from '../index.module.css';
import { cn } from 'src/shared/utils';

export type Props = HTMLAttributes<HTMLDivElement>;

export const Loader = ({ className, ...otherProps }: Props) => (
  <div {...otherProps} className={cn(styles.main, className)}>
    <span>❄️</span>
    <span>❄️</span>
    <span>❄️</span>
    <span>❄️</span>
    <span>❄️</span>
    <span>❄️</span>
  </div>
);
