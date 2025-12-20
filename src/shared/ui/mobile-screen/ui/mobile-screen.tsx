import type { HTMLAttributes } from 'react';
import MonitorSvg from '../images/monitor.svg?react';
import { cn } from 'src/shared/utils';

export type Props = HTMLAttributes<HTMLDivElement>;

export const MobileScreen = ({ className, ...otherProps }: Props) => (
  <div {...otherProps} className={cn('w-full h-full flex items-center justify-center p-4 bg-black', className)}>
    <div className="flex flex-col items-center justify-center text-center px-6 gap-6">
      <MonitorSvg className="w-16 h-16 text-primary" />
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Нужен десктоп</h1>
        <p className="text-muted-foreground text-balance">
          Эта открытка предназначена для просмотра на компьютере. Пожалуйста, откройте её на десктопе для лучшего
          опыта.
        </p>
      </div>
    </div>
  </div>
);
