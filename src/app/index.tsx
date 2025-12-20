import { Terminal, useTerminal as useTerminalBase } from 'src/shared/ui/terminal';
import './index.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSyncedRef } from 'src/shared/hooks/use-synced-ref';
import { AnimatePresence, motion } from 'motion/react';
import { PolarLights } from 'src/shared/ui/polar-lights';
import { SnowflakesAnimation } from 'src/shared/ui/snowflakes-animation';
import EventEmitter from 'eventemitter3';
import { cn, wait, waitEvent } from 'src/shared/utils';
import { ScrollTelling } from 'src/shared/ui/scroll-telling';
import { Loader } from 'src/shared/ui/loader';
import { useSound } from 'src/shared/hooks/use-sound';
import { Toaster } from 'src/shared/lib/shadcn/ui/sonner';
import { toast } from 'sonner';

const audioFiles = {
  music: 'music.mp3',
} as const;

type AudioName = keyof typeof audioFiles;

type Buffers = Partial<Record<AudioName, AudioBuffer>>;

const useAudioPreloader = () => {
  const events = useMemo(() => new EventEmitter<{ loaded: [] }>(), []);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [buffers, setBuffers] = useState<Buffers>({});
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const ctx = new AudioContext();
      setAudioCtx(ctx);

      const newBuffers: Buffers = {};

      await Promise.all(
        Object.entries(audioFiles).map(async ([name, url]) => {
          const res = await fetch(url);
          const arrayBuffer = await res.arrayBuffer();
          newBuffers[name as AudioName] = await ctx.decodeAudioData(arrayBuffer);
        })
      );

      setBuffers(newBuffers);
      setLoading(false);
      events.emit('loaded');
    };

    load();
  }, [events]);

  const play = useCallback((name: AudioName) => {
    if (!audioCtx || !buffers[name]) return;
    const source = audioCtx.createBufferSource();
    source.buffer = buffers[name]!;
    source.connect(audioCtx.destination);
    source.start();
  }, [audioCtx, buffers]);

  const waitLoaded = useCallback(() => waitEvent(events, 'loaded'), [events]);

  return { isLoading, play, waitLoaded };
};

const useTerminal = () => {
  const terminal = useTerminalBase();
  const events = useMemo(() => new EventEmitter<{ ['fade-toggled']: [] }>(), []);
  const [isShown, setIsShown] = useState(false);
  const toggleFade = useCallback(() => events.emit('fade-toggled'), [events]);
  const show = useCallback(async () => {
    setIsShown(true);
    await waitEvent(events, 'fade-toggled');
  }, [events]);
  const hide = useCallback(async () => {
    setIsShown(false);
    await waitEvent(events, 'fade-toggled');
  }, [events]);
  return { ...terminal, isShown, setIsShown, toggleFade, show, hide };
};

const useSnowflakesAnimation = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  return { isAnimating, setIsAnimating };
};

const useScrollTelling = () => {
  const [isShown, setIsShown] = useState(false);
  const events = useMemo(() => new EventEmitter<{ finish: [] }>(), []);

  const showRunAndHide = useCallback(async () => {
    setIsShown(true);
    await waitEvent(events, 'finish');
    setIsShown(false);
  }, [events]);

  const finish = useCallback(() => events.emit('finish'), [events]);

  return { isShown, setIsShown, showRunAndHide, finish };
};

const useLoader = () => {
  const events = useMemo(() => new EventEmitter<{ ['fade-toggled']: [] }>(), []);
  const [isShown, setIsShown] = useState(true);
  const toggleFade = useCallback(() => events.emit('fade-toggled'), [events]);
  const hide = useCallback(async () => {
    setIsShown(false);
    await waitEvent(events, 'fade-toggled');
  }, [events]);
  return { isShown, setIsShown, toggleFade, hide };
};

const useLoad = ({ audioPreloader, loader, terminal }: {
  audioPreloader: ReturnType<typeof useAudioPreloader>;
  loader: ReturnType<typeof useLoader>;
  terminal: ReturnType<typeof useTerminal>;
}) => {
  const run = useCallback(async () => {
    await Promise.all([audioPreloader.waitLoaded(), wait(2000)]);
    await Promise.all([loader.hide(), terminal.show()]);
  }, [audioPreloader, loader, terminal]);

  return { run };
};

const useScenarioProcess = (
  terminal: ReturnType<typeof useTerminal>,
  audioPreloader: ReturnType<typeof useAudioPreloader>,
  loader: ReturnType<typeof useLoader>,
  snowflakesAnimation: ReturnType<typeof useSnowflakesAnimation>,
  sound: ReturnType<typeof useSound>,
  scrollTelling: ReturnType<typeof useScrollTelling>,
) => {
  const terminalRef = useSyncedRef(terminal);
  const loadProcess = useLoad({ audioPreloader, loader, terminal });
  const permittedNames = useMemo(
    () => [
      'Лиза',
      'Елизавета',
      'Лизавета',
      'Лизонька',
      'Лизочка',
      'Лизка',
      'Лизуня',
      'Лизетта',

      'Lisa',
      'Liza',
      'Elizabeth',
      'Liz',
      'Lizzy',
      'Lizzie',
      'Eliza',
      'Beth',
      'Betsy',
      'Bess',
      'Betty',
      'Ellie',
      'Libby',
    ],
    []
  );
  
  const run = useCallback(async () => {
    await loadProcess.run();
    await terminalRef.current.writeWithDelayProcess.run({ text: '> Инициализация happy-new-year-card.sh ' });
    terminalRef.current.write({ text: ' ' });
    const initSpinner = terminalRef.current.spinnerManager.create(1, 0);
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ text: '> Идентификация личности ' });
    terminalRef.current.write({ text: ' ' });
    const identitySpinner = terminalRef.current.spinnerManager.create(4, 0);
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ text: '🟩 Представьтесь: ' });

    // eslint-disable-next-line no-async-promise-executor
    const name = await new Promise<string>(async (resolve) => {
      while (true) {
        const input = await terminalRef.current.inputProcess.run();
        if (permittedNames.includes(input)) {
          resolve(input);
          return;
        } else {
          toast.error('Доступ разрешён только для Лизы');
          terminalRef.current.eraseValue(input);
          await wait(10);
        }
      }
    });

    identitySpinner.dispose();
    terminalRef.current.replaceCharAt(6, 0, '✅');
    await wait(500);
    terminalRef.current.deleteRow(6);
    terminalRef.current.deleteRow(5);
    terminalRef.current.deleteRow(4);
    terminalRef.current.deleteRow(3);
    await terminalRef.current.writeWithDelayProcess.run({ text: '> Личность подтверждена' });
    await wait(500);
    await terminalRef.current.writeWithDelayProcess.run({ text: `, привет, ${name} ⭐` });
    terminalRef.current.writeLn();
    await wait(500);
    await terminalRef.current.writeWithDelayProcess.run({ text: '> Компиляция поздравления ' });
    terminalRef.current.write({ text: ' ' });
    const compilationSpinner = terminalRef.current.spinnerManager.create(7, 0);
    terminalRef.current.writeLn('\u00A0');
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { color: 'rgb(184, 216, 189)' }, text: 'function celebrate() {' });
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { color: 'rgb(184, 216, 189)' }, text: '  // Generating personalized message...' });
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { color: 'rgb(184, 216, 189)' }, text: `  const recipient = "${name}";` });
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { color: 'rgb(184, 216, 189)' }, text: '  ' });
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { color: 'rgb(184, 216, 189)' }, text: '  return {' });
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { color: 'rgb(184, 216, 189)' }, text: '    message: "🎉 Поздравляю с Новым Годом!",' });
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { color: 'rgb(184, 216, 189)' }, text: '    wishes: [' });
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { color: 'rgb(184, 216, 189)' }, text: '      "✓ Успеха во всех начинаниях",' });
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { color: 'rgb(184, 216, 189)' }, text: '      "✓ Вдохновения каждый день",' });
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { color: 'rgb(184, 216, 189)' }, text: '      "✓ Интересных проектов",' });
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { color: 'rgb(184, 216, 189)' }, text: '      "✓ Отличного настроения",' });
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { color: 'rgb(184, 216, 189)' }, text: '      "✓ И кофе всегда горячего! ☕"' });
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { color: 'rgb(184, 216, 189)' }, text: '    ],' });
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { color: 'rgb(184, 216, 189)' }, text: '    success: true,' });
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { color: 'rgb(184, 216, 189)' }, text: '    note: "Сделано с ❤️"' });
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { color: 'rgb(184, 216, 189)' }, text: '  }' });
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { color: 'rgb(184, 216, 189)' }, text: '}' });
    terminalRef.current.writeLn('\u00A0');
    terminalRef.current.writeLn();
    await wait(500);
    await terminalRef.current.writeWithDelayProcess.run({ text: '> celebrate()' });
    terminalRef.current.writeLn();
    await wait(500);
    await terminalRef.current.writeWithDelayProcess.run({ text: '✨ Success! Status Code: 200 OK ✨' });
    initSpinner.dispose();
    compilationSpinner.dispose();
    terminalRef.current.replaceCharAt(1, 0, '✅');
    terminalRef.current.replaceCharAt(7, 0, '✅');
    terminalRef.current.writeLn('\u00A0');
    terminalRef.current.writeLn();

    await terminalRef.current.writeWithDelayProcess.run({ style: { fontStyle: 'italic' }, text: 'Но, это ещё не всё.' });
    await wait(500);
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { fontStyle: 'italic' }, text: 'Какой Новый Год без снега?' });
    terminalRef.current.writeLn();
    await wait(500);
    await terminalRef.current.writeWithDelayProcess.run({ style: { fontStyle: 'italic' }, text: 'Пора ввести команду `snow`' });
    terminalRef.current.writeLn('\u00A0');
    terminalRef.current.writeLn('$ ');
    await wait(500);
    terminalRef.current.hintManager.startIdleTimer({ hintText: 'Введи snow', idleMs: 5000 });
    await terminalRef.current.waitInputCommandProcess.run('snow');
    terminalRef.current.hintManager.hideHint();
    terminalRef.current.hintManager.clearIdleTimer();
    await wait(500);
    terminalRef.current.resetStrings();
    terminalRef.current.write({ text: '$ snow' });
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ text: '> Инициализация снега ' });
    terminalRef.current.write({ text: ' ' });
    terminalRef.current.writeLn();
    const snowSpinner = terminalRef.current.spinnerManager.create(3, 0);
    await wait(1000);
    snowflakesAnimation.setIsAnimating(true);
    await wait(500);
    snowSpinner.dispose();
    terminalRef.current.replaceCharAt(3, 0, '✅');
    await wait(500);
    await terminalRef.current.writeWithDelayProcess.run({ text: '> Снегопад инициализирован! ❄️' });
    terminalRef.current.writeLn('\u00A0');
    terminalRef.current.writeLn();
    await wait(1000);
    await terminalRef.current.writeWithDelayProcess.run({ style: { fontStyle: 'italic' }, text: 'Одна снежинка.' }, 90);
    terminalRef.current.writeLn();
    await wait(500);
    await terminalRef.current.writeWithDelayProcess.run({ style: { fontStyle: 'italic' }, text: 'Вторая.' }, 90);
    terminalRef.current.writeLn();
    await wait(500);
    await terminalRef.current.writeWithDelayProcess.run({ style: { fontStyle: 'italic' }, text: 'Третья.' }, 90);
    terminalRef.current.writeLn();
    await wait(500);
    await terminalRef.current.writeWithDelayProcess.run({ style: { fontStyle: 'italic' }, text: 'Праздник приходит по частям.' }, 80);
    await wait(1000);
    terminalRef.current.writeLn('\u00A0');
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { fontStyle: 'italic' }, text: 'Снег задал ритм. Но для полного волшебства не хватает мелодии.' });
    terminalRef.current.writeLn();
    await wait(500);
    await terminalRef.current.writeWithDelayProcess.run({ style: { fontStyle: 'italic' }, text: 'Найди команду, которая превратит тишину в music.' });
    terminalRef.current.writeLn('\u00A0');
    terminalRef.current.writeLn('$ ');
    await wait(500);
    terminalRef.current.hintManager.startIdleTimer({ hintText: 'Введи music', idleMs: 5000 });
    await terminalRef.current.waitInputCommandProcess.run('music');
    terminalRef.current.hintManager.hideHint();
    terminalRef.current.hintManager.clearIdleTimer();
    await wait(500);
    terminalRef.current.resetStrings();
    terminalRef.current.write({ text: '$ music' });
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ text: '> Запуск музыки ' });
    terminalRef.current.write({ text: ' ' });
    const musicSpinner = terminalRef.current.spinnerManager.create(3, 0);
    await wait(500);
    sound.play();
    await wait(2000);
    musicSpinner.dispose();
    terminalRef.current.replaceCharAt(3, 0, '✅');
    await wait(500);
    terminalRef.current.writeLn('\u00A0');
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { fontStyle: 'italic' }, text: 'Снег уже идёт.' });
    await wait(500);
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { fontStyle: 'italic' }, text: 'Музыка звучит.' });
    await wait(500);
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { fontStyle: 'italic' }, text: 'Окружение готово.' });
    await wait(500);
    terminalRef.current.writeLn('\u00A0');
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { fontStyle: 'italic' }, text: 'Но праздник не любит случайностей.' });
    await wait(500);
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { fontStyle: 'italic' }, text: 'Он хочет убедиться,' });
    await wait(500);
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { fontStyle: 'italic' }, text: 'что ты понимаешь,' });
    await wait(500);
    await terminalRef.current.writeWithDelayProcess.run({ style: { fontStyle: 'italic' }, text: ' что именно происходит.' });
    await wait(1000);
    terminalRef.current.writeLn('\u00A0');
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { fontStyle: 'italic' }, text: 'Снег кружится у ворот —' });
    await wait(500);
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { fontStyle: 'italic' }, text: 'К нам приходит ' });
    terminalRef.current.hintManager.startIdleTimer({ hintText: 'Правильный ответ "Новый год"', idleMs: 5000 });
    await terminalRef.current.waitInputCommandProcess.run(/новый год/i, true);
    terminalRef.current.hintManager.hideHint();
    terminalRef.current.hintManager.clearIdleTimer();
    terminalRef.current.writeLn('\u00A0');
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { fontStyle: 'italic' }, text: 'Верно!' });
    await wait(1000);
    terminalRef.current.writeLn('\u00A0');
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { fontStyle: 'italic' }, text: 'Он приходит в зимний вечер,' });
    await wait(500);
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { fontStyle: 'italic' }, text: 'Зажигать на ёлке свечи.' });
    await wait(500);
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { fontStyle: 'italic' }, text: 'Он заводит хоровод –' });
    await wait(500);
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { fontStyle: 'italic' }, text: 'Это праздник ' });
    terminalRef.current.hintManager.startIdleTimer({ hintText: 'Снова "Новый год"', idleMs: 5000 });
    await terminalRef.current.waitInputCommandProcess.run(/новый год/i, true);
    terminalRef.current.hintManager.hideHint();
    terminalRef.current.hintManager.clearIdleTimer();
    terminalRef.current.writeLn('\u00A0');
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { fontStyle: 'italic' }, text: 'Да, это он!' });
    await wait(1000);
    terminalRef.current.writeLn('\u00A0');
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { fontStyle: 'italic' }, text: 'Старый тихо ускользнёт,' });
    await wait(500);
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { fontStyle: 'italic' }, text: 'Час двенадцать раз пробьёт.' });
    await wait(500);
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { fontStyle: 'italic' }, text: 'Каждый чуда очень ждёт —' });
    await wait(500);
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { fontStyle: 'italic' }, text: 'Наступает ' });
    terminalRef.current.hintManager.startIdleTimer({ hintText: 'И ещё раз "Новый год"', idleMs: 5000 });
    await terminalRef.current.waitInputCommandProcess.run(/новый год/i, true);
    terminalRef.current.hintManager.hideHint();
    terminalRef.current.hintManager.clearIdleTimer();
    terminalRef.current.writeLn('\u00A0');
    terminalRef.current.writeLn();
    await terminalRef.current.writeWithDelayProcess.run({ style: { fontStyle: 'italic' }, text: 'И снова в точку!' });
    await wait(1000);
    await terminalRef.current.hide();
    terminalRef.current.hintManager.startIdleTimer({ hintText: 'Нажми и удерживай, чтобы остановить прокрутку', idleMs: 5000, duration: 5000 });
    await scrollTelling.showRunAndHide();
  }, [loadProcess, permittedNames, scrollTelling, snowflakesAnimation, sound, terminalRef]);

  return { run };
};

export const App = () => {
  const audioPreloader = useAudioPreloader();
  const sound = useSound('music.mp3', { volume: 0.25, loop: true });
  const terminal = useTerminal();
  const snowflakesAnimation = useSnowflakesAnimation();
  const loader = useLoader();
  const scrollTelling = useScrollTelling();
  const scenarioProcess = useScenarioProcess(
    terminal,
    audioPreloader,
    loader,
    snowflakesAnimation,
    sound,
    scrollTelling,
  );

  useEffect(() => {
    scenarioProcess.run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-screen h-dvh bg-black flex justify-center">
      <AnimatePresence>
        {snowflakesAnimation.isAnimating && (
          <motion.div
            className="absolute w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 1 } }}
            exit={{ opacity: 0, transition: { duration: 1 } }}
          >
            <PolarLights />
            <SnowflakesAnimation />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        style={{ pointerEvents: terminal.isShown ? 'auto' : 'none' }}
        className={cn(
          'relative z-1 text-card-foreground flex flex-col rounded-xl w-full max-w-3xl bg-[rgba(0,0,0,0.6)] backdrop-blur-[7px] border-2 border-border shadow-2xl overflow-hidden',
          'md:pt-4 md:my-10',
          'pt-3 my-5 mx-2',
        )}
        animate={terminal.isShown ? { opacity: 1, filter: 'none' } : { opacity: 0, filter: 'blur(10px)' }}
        onAnimationComplete={terminal.toggleFade}
      >
        <div className="bg-secondary px-4 py-3 flex items-center gap-2 select-none">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-primary"></div>
          </div>
          <span className="font-mono text-sm text-muted-foreground ml-2">happy-new-year-card.sh ~ zsh</span>
        </div>
        <div className="flex-1 relative md:m-6 m-3">
          <Terminal strings={terminal.state.strings} focusable={terminal.state.focusable} />
        </div>
      </motion.div>

      <AnimatePresence>
        {scrollTelling.isShown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ScrollTelling
              className="left-0 top-0 w-full h-full absolute"
              rows={[
                'И вот, последняя метка поставлена.',
                'Ты одолела ещё один виток вокруг солнца.',
                '\u00A0',
                '\u00A0',
                'Я — голос этого уходящего года.',
                'Я — сумма всех его дней: ярких и тусклых, лёгких и тяжёлых.',
                'Я был полем, по которому ты шла. Картой, которую ты рисовала...',
                'Домом, который ты строила и который иногда приходилось чинить после шторма.',
                '\u00A0',
                '\u00A0',
                'Ты несла меня в рюкзаке, как странник — свой посох и немного припасов.',
                'Иногда я был тяжёл. Иногда я давал тебе силы.',
                '\u00A0',
                '\u00A0',
                'Ты думала, ты исследовала меня?',
                'Это я наблюдал за тобой.',
                'Я видел, как ты спотыкалась и поднималась.',
                'Как теряла важное, но находила ещё больше.',
                '\u00A0',
                '\u00A0',
                'И теперь, когда цикл завершён...',
                '...я должен уйти.',
                '\u00A0',
                '\u00A0',
                'Но я оставляю тебе всё, что ты приобрела.',
                'В твоих руках, которые теперь умеют чуть больше.',
                'В твоей памяти, где хранятся закаты и смех этого года.',
                'В твоём сердце, которое, несмотря на всё, продолжает биться и желать нового.',
                '\u00A0',
                '\u00A0',
                'Ты свободна. Ты прошла.',
                'И теперь можешь войти в новый мир — в следующий год.',
                'Он бесконечен и прекрасен в своей возможности.',
                'Как чистый лист мира в творческом режиме игры.',
                '\u00A0',
                '\u00A0',
                'Строй. Исследуй. Живи.',
                'А я стану звёздами на небе твоего нового небосклона.',
                'И буду тихо светить тебе с благодарностью из прошлого.',
                '\u00A0',
                '\u00A0',
                '\u00A0',
                '\u00A0',
                'Прощай.',
                'И добро пожаловать.',
                'Всегда.',
                '\u00A0',
                '\u00A0',
                '\u00A0',
                '\u00A0',
                'P.S.',
                'С наступающим 2026 годом! ❄️',
                'by abstractmage',
              ]}
              onFinish={scrollTelling.finish}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {loader.isShown && (
          <motion.div
            className="absolute left-0 top-0 w-full h-full flex justify-center items-center z-1 bg-black select-none"
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            onAnimationComplete={loader.toggleFade}
          >
            <Loader />
          </motion.div>
        )}
      </AnimatePresence>
      <Toaster />
    </div>
  );
};
