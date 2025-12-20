import { useEffect, useRef, useState, type HTMLAttributes } from 'react';
import { MyTerminalModel } from '../model/my-terminal-model';
import type { Nullable } from 'src/shared/types';

export type Props = HTMLAttributes<HTMLDivElement> & {
  isRunning?: boolean;
  onSnow?: VoidFunction;
  onMusic?: VoidFunction;
  onScrollTelling?: VoidFunction;
};

export const MyTerminal = ({ className, isRunning = false, onSnow, onMusic, onScrollTelling }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [model, setModel] = useState<Nullable<MyTerminalModel>>(null);

  useEffect(() => {
    if (isRunning) model?.run();
  }, [isRunning, model]);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = '';
    const model = new MyTerminalModel(ref.current);
    setModel(model);
    model.listenResize();
    return () => model.unlistenResize();
  }, []);

  useEffect(() => {
    if (model && onSnow) {
      model.events.on('snow', onSnow);
      return () => void model.events.off('snow', onSnow);
    }
  }, [model, onSnow]);

  useEffect(() => {
    if (model && onMusic) {
      model.events.on('music', onMusic);
      return () => void model.events.off('music', onMusic);
    }
  }, [model, onMusic]);

  useEffect(() => {
    if (model && onScrollTelling) {
      model.events.on('scroll-telling', onScrollTelling);
      return () => void model.events.off('scroll-telling', onScrollTelling);
    }
  }, [model, onScrollTelling]);
  
  return <div ref={ref} className={className} />;
};
