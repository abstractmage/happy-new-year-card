import { FitAddon } from '@xterm/addon-fit';
import { Terminal, type IDisposable } from '@xterm/xterm';
import EventEmitter from 'eventemitter3';
import { wait } from 'src/shared/utils';

export class MyTerminalModel {
  readonly terminal: Terminal;
  readonly events = new EventEmitter<{ snow: []; music: []; ['scroll-telling']: [] }>();
  private fitAddon = new FitAddon();

  constructor(container: HTMLElement) {
    this.handleResize = this.handleResize.bind(this);
    this.terminal = new Terminal({
      fontFamily: '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
      fontSize: 14,
      letterSpacing: 1,
      theme: { foreground: 'oklch(.7 .15 145)', background: 'rgba(0, 0, 0, 0)' },
      cursorBlink: true,
      lineHeight: 1.5,
      cursorWidth: 400,
      fontWeight: 700,
      cols: 81,
      disableStdin: false,
    });
    this.terminal.loadAddon(this.fitAddon);
    this.terminal.open(container);
    this.terminal.focus();
    this.fitAddon.fit();
    console.log(this);
  }

  listenResize() {
    window.addEventListener('resize', this.handleResize);
  }

  unlistenResize() {
    window.removeEventListener('resize', this.handleResize);
  }

  async run() {
    const permittedNames = ['Анечка', 'Admin'];

    await this.writeWithDelay('> Инициализация happy-new-year.sh  \r\n');
    const initSpinner = this.startSpinner(1, 35);
    await wait(500);
    await this.writeWithDelay('> Идентификация личности  \r\n');
    const identitySpinner = this.startSpinner(2, 26);
    await wait(500);
    await this.writeWithDelay('🟩 Представьтесь: ');
    const name = await this.waitInput();

    if (permittedNames.includes(name)) {
      identitySpinner.dispose();
      this.replaceCharAt(3, 1, '✅');
      this.terminal.write('\r\n');
      await wait(500);
      this.deleteLine(2);
      this.deleteLine(2);
      this.moveCursorTo(2, 1);
      await this.writeWithDelay('> Личность подтверждена');
      await wait(500);
      await this.writeWithDelay(`, привет, ${name} ⭐ \r\n`);
      await wait(500);
      await this.writeWithDelay('> Компиляция поздравления ...\r\n\r\n');
      this.terminal.write('\x1b[38;2;184;216;189m');
      await this.writeWithDelay('function celebrate() {\r\n');
      await this.writeWithDelay('  // Generating personalized message...\r\n');
      await this.writeWithDelay(`  const recipient = "${name}";\r\n`);
      await this.writeWithDelay('  \r\n');
      await this.writeWithDelay('  return {\r\n');
      await this.writeWithDelay('    message: "🎉 Поздравляю с Новым Годом!",\r\n');
      await this.writeWithDelay('    wishes: [\r\n');
      await this.writeWithDelay('      "✓ Успеха во всех начинаниях",\r\n');
      await this.writeWithDelay('      "✓ Вдохновения каждый день",\r\n');
      await this.writeWithDelay('      "✓ Интересных проектов",\r\n');
      await this.writeWithDelay('      "✓ Отличного настроения",\r\n');
      await this.writeWithDelay('      "✓ И кофе всегда горячего! ☕"\r\n');
      await this.writeWithDelay('    ],\r\n');
      await this.writeWithDelay('    success: true,\r\n');
      await this.writeWithDelay('    note: "Сделано с ❤️"\r\n');
      await this.writeWithDelay('  }\r\n');
      await this.writeWithDelay('}\r\n\r\n');
      this.terminal.write('\x1b[0m');
      await wait(500);
      await this.writeWithDelay('> celebrate()\r\n');
      await wait(500);
      await this.writeWithDelay('✨ Success! Status Code: 200 OK ✨\r\n\r\n');
      this.replaceCharAt(3, 27, '✅');
      this.replaceCharAt(3, 28, '');
      this.replaceCharAt(3, 29, '');
      initSpinner.dispose();
      this.replaceCharAt(1, 35, '✅');
      await wait(500);
      this.terminal.write('\x1b[3m');
      await this.writeWithDelay('Но, это ещё не всё.');
      await wait(500);
      await this.writeWithDelay(' Какой Новый Год без снега?\r\n');
      await wait(500);
      await this.writeWithDelay('Пора ввести команду `snow`')
      this.terminal.write('\x1b[0m\n');

      this.terminal.write('\r\n$ ');
      // eslint-disable-next-line no-async-promise-executor
      await new Promise<void>(async (resolve) => {
        while (true) {
          const command = await this.waitInput();

          if (command === 'snow') {
            resolve();
            return;
          } else {
            this.terminal.writeln(`${command}: command not found\r\n$ `);
          }
        }
      });

      this.terminal.reset();
      this.terminal.write('$ snow\r\n');
      await this.writeWithDelay('> Инициализация снега  \r\n');
      const snowSpinner = this.startSpinner(2, 23);
      await wait(1000);
      this.events.emit('snow');
      await wait(500);
      snowSpinner.dispose();
      this.replaceCharAt(2, 23, '✅');
      await wait(500);
      await this.writeWithDelay('> Снегопад инициализирован! ❄️\r\n\r\n');
      await wait(1000);
      this.terminal.write('\x1b[3m');
      await this.writeWithDelay('Одна снежинка.\r\n', 100);
      await wait(500);
      await this.writeWithDelay('Вторая.\r\n', 100);
      await wait(500);
      await this.writeWithDelay('Третья.\r\n', 100);
      await wait(500);
      await this.writeWithDelay('Праздник приходит по частям.\r\n\r\n', 80);
      await wait(1000);
      await this.writeWithDelay('Снег задал ритм. Но для полного волшебства не хватает мелодии.\r\n');
      await wait(500);
      await this.writeWithDelay('Найди команду, которая превратит тишину в music\'у.\r\n');
      this.terminal.write('\x1b[0m');

      this.terminal.write('\r\n$ ');
      // eslint-disable-next-line no-async-promise-executor
      await new Promise<void>(async (resolve) => {
        while (true) {
          const command = await this.waitInput();

          if (command === 'music') {
            resolve();
            return;
          } else {
            this.terminal.write(`\r\n${command}: command not found\r\n\r\n$ `);
          }
        }
      });

      this.terminal.reset();
      this.terminal.write('$ music\r\n');
      await this.writeWithDelay('> Запуск музыки  \r\n');
      const musicSpinner = this.startSpinner(2, 17);
      await wait(500);
      this.events.emit('music');
      await wait(2000);
      musicSpinner.dispose();
      this.replaceCharAt(2, 17, '✅');
      await wait(500);
      this.terminal.write('\n\r');
      this.terminal.write('\x1b[3m');
      await this.writeWithDelay('Снег уже идёт.\n\r');
      await wait(500);
      await this.writeWithDelay('Музыка звучит.\n\r');
      await wait(500);
      await this.writeWithDelay('Окружение готово.\n\r\n\r');
      await wait(500);
      await this.writeWithDelay('Но праздник не любит случайностей.\n\r');
      await wait(500);
      await this.writeWithDelay('Он хочет убедиться,\n\r');
      await wait(500);
      await this.writeWithDelay('что ты понимаешь,');
      await wait(500);
      await this.writeWithDelay(' что именно происходит.\n\r\n\r');
      this.terminal.write('\x1b[0m');
      await wait(1000);
      await this.writeWithDelay('Снег кружится у ворот —\n\r');
      await wait(500);
      await this.writeWithDelay('К нам приходит ');

      // eslint-disable-next-line no-async-promise-executor
      await new Promise<void>(async (resolve) => {
        while (true) {
          const input = await this.waitInput();

          if (input.toLowerCase() === 'новый год') {
            resolve();
            return;
          } else {
            this.terminal.write(Array.from(input).fill('\b \b').join(''));
          }
        }
      });

      this.terminal.write('\n\r');
      this.terminal.write('\n\r');
      this.terminal.write('\x1b[3m');
      await this.writeWithDelay('Верно!');
      this.terminal.write('\x1b[0m');
      this.terminal.write('\n\r');
      this.terminal.write('\n\r');
      await wait(1000);

      await this.writeWithDelay('Он приходит в зимний вечер,');
      this.terminal.write('\n\r');
      await wait(500);
      await this.writeWithDelay('Зажигать на елке свечи.');
      this.terminal.write('\n\r');
      await wait(500);
      await this.writeWithDelay('Он заводит хоровод –');
      this.terminal.write('\n\r');
      await wait(500);
      await this.writeWithDelay('Это праздник ');

      // eslint-disable-next-line no-async-promise-executor
      await new Promise<void>(async (resolve) => {
        while (true) {
          const input = await this.waitInput();

          if (input.toLowerCase() === 'новый год') {
            resolve();
            return;
          } else {
            this.terminal.write(Array.from(input).fill('\b \b').join(''));
          }
        }
      });

      this.terminal.write('\n\r');
      this.terminal.write('\n\r');
      this.terminal.write('\x1b[3m');
      await this.writeWithDelay('Да, это он!');
      this.terminal.write('\x1b[0m');
      this.terminal.write('\n\r');
      this.terminal.write('\n\r');
      await wait(1000);

      await this.writeWithDelay('Старый тихо ускользнёт,');
      this.terminal.write('\n\r');
      await wait(500);
      await this.writeWithDelay('Час двенадцать раз пробьёт.');
      this.terminal.write('\n\r');
      await wait(500);
      await this.writeWithDelay('Каждый чуда очень ждёт —');
      this.terminal.write('\n\r');
      await wait(500);
      await this.writeWithDelay('Наступает ');

      // eslint-disable-next-line no-async-promise-executor
      await new Promise<void>(async (resolve) => {
        while (true) {
          const input = await this.waitInput();

          if (input.toLowerCase() === 'новый год') {
            resolve();
            return;
          } else {
            this.terminal.write(Array.from(input).fill('\b \b').join(''));
          }
        }
      });

      this.terminal.write('\n\r');
      this.terminal.write('\n\r');
      this.terminal.write('\x1b[3m');
      await this.writeWithDelay('И снова в точку!');
      this.terminal.write('\x1b[0m');
      this.terminal.write('\n\r');
      this.terminal.write('\n\r');
      await wait(2000);
      this.events.emit('scroll-telling');
    } else {
      identitySpinner.dispose();
      this.replaceCharAt(3, 1, '⛔');
    }
  }

  private async writeWithDelay(text: string, delay = 40) {
    return new Promise<void>((resolve) => {
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          this.terminal.write(text[i]);
          i++;
        } else {
          clearInterval(interval);
          resolve();
        }
      }, delay);
    });
  }

  private async waitInput() {
    let input = '';

    return new Promise<string>((resolve) => {
      const disposable = this.terminal.onData(e => {
        switch (e) {
          case '\r': // Enter
            disposable.dispose();
            resolve(input);
            break;
          case '\u007F': // Backspace (DEL)
            if (input.length > 0) {
              this.terminal.write('\b \b');
              input = input.slice(0, input.length - 1);
            }
            break;
          default: // Print all other characters for demo
            if (e >= String.fromCharCode(0x20) && e <= String.fromCharCode(0x7E) || e >= '\u00a0') {
              input += e;
              this.terminal.write(e);
            }
        }
      });
    });
  }

  private replaceCharAt(
    row: number,
    col: number,
    char: string
  ) {
    // сохранить позицию курсора
    this.terminal.write('\x1b7');
    // перейти к нужной позиции
    this.terminal.write(`\x1b[${row};${col}H`);
    // очистить ячейку (2 колонки — безопасно для emoji)
    this.terminal.write('  ');
    // вернуть курсор обратно
    this.terminal.write(`\x1b[${row};${col}H`);
    // записать новый символ
    this.terminal.write(char);
    // восстановить позицию курсора
    this.terminal.write('\x1b8');
  }

  private moveCursorTo(row: number, col: number) {
    this.terminal.write(`\x1b[${row};${col}H`);
  }

  private deleteLine(row: number) {
    // сохранить позицию курсора
    this.terminal.write('\x1b7');

    // перейти в начало строки
    this.terminal.write(`\x1b[${row};1H`);

    // удалить строку (сдвиг вверх)
    this.terminal.write('\x1b[M');

    // восстановить позицию курсора
    this.terminal.write('\x1b8');
  }

  private startSpinner(
    row: number,
    col: number,
    intervalMs = 100
  ): IDisposable {
    const emojiFrames = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];
    let i = 0;

    const timer = setInterval(() => {
      this.terminal.write('\x1b7');
      this.terminal.write(`\x1b[${row};${col}H`);
      this.terminal.write(`\x1b[38;2;255;165;0m${emojiFrames[i % emojiFrames.length]}\x1b[0m`);
      this.terminal.write('\x1b8');
      i++;
    }, intervalMs);

    return {
      dispose: () => {
        clearInterval(timer);

        this.terminal.write('\x1b7');
        this.terminal.write(`\x1b[${row};${col}H`);
        this.terminal.write(' ');
        this.terminal.write('\x1b8');
      },
    };
  }

  private handleResize() {
    // this.fitAddon.fit();
  }
}
