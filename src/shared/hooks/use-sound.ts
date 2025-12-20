import { useCallback, useEffect, useRef, useState } from 'react';

export type UseSoundOptions = {
  volume?: number;
  loop?: boolean;
};

export const useSound = (src: string, options?: UseSoundOptions) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volumeRef = useRef(options?.volume ?? 1);
  const loopRef = useRef(options?.loop ?? false);
  const [playing, setPlaying] = useState(false);
  const [pausedByVisibilityChange, setPausedByVisibilityChange] = useState(false);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setPlaying(true);
    audio.play().catch(() => {});
  }, []);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
  }, []);

  const continueFn = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.play().catch(() => {});
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setPlaying(false);
    audio.pause();
    audio.currentTime = 0;
  }, []);

  // инициализация audio
  useEffect(() => {
    const audio = new Audio(src);
    audio.preload = 'auto';
    audio.volume = volumeRef.current;
    audio.loop = loopRef.current;

    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [src]);

  // обновление громкости
  useEffect(() => {
    if (typeof options?.volume === 'number') {
      volumeRef.current = options.volume;
      if (audioRef.current) {
        audioRef.current.volume = options.volume;
      }
    }
  }, [options?.volume]);

  // обновление loop
  useEffect(() => {
    if (typeof options?.loop === 'boolean') {
      loopRef.current = options.loop;
      if (audioRef.current) {
        audioRef.current.loop = options.loop;
      }
    }
  }, [options?.loop]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && playing) {
        setPausedByVisibilityChange(true);
        pause();
      } else if (document.visibilityState === 'visible' && pausedByVisibilityChange) {
        setPausedByVisibilityChange(false);
        continueFn();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [continueFn, pause, pausedByVisibilityChange, playing]);

  return { play, stop };
};
