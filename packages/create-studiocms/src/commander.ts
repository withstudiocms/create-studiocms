import { Command, Help } from "commander";
import {
  default as chalkStdOut,
  chalkStderr as chalkStdErr,
  supportsColor as supportsColorStdout,
  supportsColorStderr,
} from 'chalk';
import stripAnsi from 'strip-ansi';
import wrapAnsi from 'wrap-ansi';

export class MyHelp extends Help {
    chalk: any;
    colorway: any;

    constructor() {
      super();
      this.chalk = chalkStdOut;
      this.colorway = this.chalk.hex('#a581f3');
    }
  
    prepareContext(contextOptions: { error: any; helpWidth?: number | undefined; outputHasColors?: boolean | undefined; }) {
      super.prepareContext(contextOptions);
      if (contextOptions?.error) {
        this.chalk = chalkStdErr;
      }
    }
  
    displayWidth(str: string) {
      return stripAnsi(str).length; // use imported package
    }
  
    boxWrap(str: string, width: number) {
      return wrapAnsi(str, width, { hard: true }); // use imported package
    }
  
    styleTitle(str: string) {
      return this.chalk.bold(str);
    }
    styleCommandText(str: string) {
      return this.chalk.cyan(str);
    }
    styleCommandDescription(str: string) {
      return this.chalk.magenta(str);
    }
    styleDescriptionText(str: string) {
      return this.chalk.italic(str);
    }
    styleOptionText(str: string) {
      return this.chalk.green(str);
    }
    styleArgumentText(str: string) {
      return this.chalk.yellow(str);
    }
    styleSubcommandText(str: string) {
      return this.colorway(str);
    }
}

export class MyCommand extends Command {
    createCommand(name: string | undefined) {
      return new MyCommand(name);
    }
    createHelp() {
      return Object.assign(new MyHelp(), this.configureHelp());
    }
}

export function supportsColor() {
    return supportsColorStdout !== false && supportsColorStdout.level > 0;
}