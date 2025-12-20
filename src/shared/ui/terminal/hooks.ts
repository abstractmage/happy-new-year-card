import { useCallback, useEffect, useRef, useState } from 'react';
import { removeAtIndex, replaceCharAt } from 'src/shared/utils';
import type { StringItem } from './types';
import { toast } from 'sonner';

export const useTerminalState = () => {
  const [strings, setStrings] = useState<StringItem[]>([]);
  const [focusable, setFocusable] = useState(false);
  return { strings, setStrings, focusable, setFocusable };
};

export const useWriteWithDelayProcess = (state: ReturnType<typeof useTerminalState>) => {
  const run = useCallback((stringItem: StringItem, delay = 40) => {
    return new Promise<void>((resolve) => {
      let i = 0;
      state.setStrings((strings) => [...strings, { style: stringItem.style, text: '' }]);
      const interval = setInterval(() => {
        if (i < stringItem.text.length) {
          state.setStrings((strings) => {
            const currentChar = stringItem.text[i];
            i++;
            return [...strings.slice(0, -1), { style: stringItem.style, text: `${strings.at(-1)?.text ?? ''}${currentChar}` }];
          });
        } else {
          clearInterval(interval);
          resolve();
        }
      }, delay);
    });
  }, [state]);

  return { run };
};

export const useWriteLn = (state: ReturnType<typeof useTerminalState>) => {
  return useCallback((text?: string) => state.setStrings((lines) => [...lines, { style: { display: 'block' }, text: text ?? '' }]), [state]);
};

export const useWrite = (state: ReturnType<typeof useTerminalState>) => {
  return useCallback((item: StringItem) => state.setStrings((strings) => [...strings, item]), [state])
};

export const useReplaceCharAt = (state: ReturnType<typeof useTerminalState>) => {
  return useCallback((row: number, col: number, char: string) => state.setStrings((strings) => {
    const newStrings = [...strings];
    newStrings[row].text = replaceCharAt(newStrings[row].text, col, char);
    return newStrings;
  }), [state]);
};

export const useDeleteRow = (state: ReturnType<typeof useTerminalState>) => {
  return useCallback((row: number) => state.setStrings((strings) => {
    const newStrings = removeAtIndex(strings, row);
    return newStrings;
  }), [state])
};

export const useResetStrings = (state: ReturnType<typeof useTerminalState>) => {
  return useCallback(() => state.setStrings([]), [state]);
};

export const useSpinnerManager = (state: ReturnType<typeof useTerminalState>) => {
  const create = useCallback((row: number, col: number) => {
    const emojiFrames = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];
    let i = 0;

    const timer = setInterval(() => {
      state.setStrings((strings) => {
        const newLines = [...strings];
        newLines[row].style = { color: 'rgb(255, 165, 0)' };
        newLines[row].text = replaceCharAt(newLines[row].text, col, emojiFrames[i % emojiFrames.length]);
        return newLines;
      });
      i++;
    }, 100);

    return {
      dispose: (text?: string) => {
        clearInterval(timer);
        state.setStrings((lines) => {
          const newLines = [...lines];
          newLines[row].text = replaceCharAt(newLines[row].text, col, text ?? ' ');
          return newLines;
        });
      },
    };
  }, [state]);

  return { create };
};

export const useInputProcess = (state: ReturnType<typeof useTerminalState>) => {
  const run = useCallback(() => {
    const currentStringItem = state.strings.at(-1);
    const currentStringItemText = currentStringItem?.text ?? '';
    let input = '';

    return new Promise<string>((resolve) => {
      state.setFocusable(true);
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          document.removeEventListener('keydown', handleKeyDown);
          state.setFocusable(false);
          resolve(input);
        } else if (e.key === 'Backspace') {
          input = input.slice(0, -1);
        } else if (e.key.length === 1) {
          input += e.key;
        }
        state.setStrings((strings) => {
          return [...strings.slice(0, -1), { style: currentStringItem?.style, text: currentStringItemText + input }];
        });
      };

      document.addEventListener('keydown', handleKeyDown);
    });
  }, [state]);

  return { run };
};

export const useWaitInputCommandProcess = (state: ReturnType<typeof useTerminalState>) => {
  const inputProcess = useInputProcess(state);
  const writeLn = useWriteLn(state);
  
  const run = useCallback(async (command: string | RegExp, justReplace = false) => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<void>(async (resolve) => {
      while (true) {
        const input = await inputProcess.run();

        if (typeof command === 'string' ? input === command : command.test(input)) {
          resolve();
          return;
        } else if (!justReplace) {
          state.setStrings((strings) => [...strings, { text: `${input}: command not found` }]);
          writeLn('\u00A0');
          writeLn('$ ');
        } else if (justReplace) {
          state.setStrings((strings) => {
            const newStrings = [...strings];
            const currentString = newStrings[newStrings.length - 1];
            newStrings[newStrings.length - 1].text = currentString.text.slice(0, currentString.text.length - input.length);
            return newStrings;
          });
        }
      }
    });
  }, [inputProcess, state, writeLn]);

  return { run };
};

export const useEraseValue = (state: ReturnType<typeof useTerminalState>) => {
  return useCallback((value: string) => {
    state.setStrings((strings) => {
      const newStrings = [...strings];
      const currentString = newStrings[newStrings.length - 1];
      newStrings[newStrings.length - 1].text = currentString.text.slice(0, currentString.text.length - value.length);
      return newStrings;
    });
  }, [state]);
};

export const useHintManager = () => {
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastIdRef = useRef<string | number | null>(null);

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const showHint = useCallback((hintText: string, duration = Infinity) => {
    if (toastIdRef.current != null) return;

    toastIdRef.current = toast(hintText, {
      duration,
    });
  }, []);

  const hideHint = useCallback(() => {
    if (toastIdRef.current != null) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }
  }, []);

  const startIdleTimer = useCallback(
    (options: {
      hintText: string;
      idleMs?: number;
      duration?: number;
    }) => {
      const { hintText, idleMs = 5000 } = options;

      clearIdleTimer();

      idleTimerRef.current = setTimeout(() => {
        showHint(hintText, options.duration);
      }, idleMs);
    },
    [clearIdleTimer, showHint]
  );

  useEffect(() => {
    return () => {
      clearIdleTimer();
      hideHint();
    };
  }, [clearIdleTimer, hideHint]);

  return { startIdleTimer, hideHint, clearIdleTimer };
}

export const useTerminal = () => {
  const state = useTerminalState();
  const writeWithDelayProcess = useWriteWithDelayProcess(state);
  const writeLn = useWriteLn(state);
  const write = useWrite(state);
  const replaceCharAt = useReplaceCharAt(state);
  const deleteRow = useDeleteRow(state);
  const resetStrings = useResetStrings(state);
  const eraseValue = useEraseValue(state);
  const spinnerManager = useSpinnerManager(state);
  const inputProcess = useInputProcess(state);
  const waitInputCommandProcess = useWaitInputCommandProcess(state);
  const hintManager = useHintManager();

  return {
    state,
    spinnerManager,
    writeWithDelayProcess,
    inputProcess,
    waitInputCommandProcess,
    hintManager,
    write,
    writeLn,
    replaceCharAt,
    deleteRow,
    resetStrings,
    eraseValue,
  };
};
