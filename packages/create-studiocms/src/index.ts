import figlet from "figlet";
import { Command, Help } from "commander";
import stripAnsi from 'strip-ansi';
import wrapAnsi from 'wrap-ansi';
import {
  default as chalkStdOut,
  chalkStderr as chalkStdErr,
  supportsColor as supportsColorStdout,
  supportsColorStderr,
} from 'chalk';

const title = figlet.textSync("StudioCMS");

const StudioCMSColorway = chalkStdOut.hex('#a581f3');

class MyHelp extends Help {
    chalk: any;
    constructor() {
      super();
      this.chalk = chalkStdOut;
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
      return this.chalk.blue(str);
    }
}
  
class MyCommand extends Command {
    createCommand(name: string | undefined) {
      return new MyCommand(name);
    }
    createHelp() {
      return Object.assign(new MyHelp(), this.configureHelp());
    }
}
  
const registeredCommands = [
    'default',
    'help'
] as const;

type Context = {
    command?: typeof registeredCommands[number];
    arguments?: Record<string, any>;
    options?: Record<string, any>;
}

export async function main() {
    const program = new MyCommand()

    program.configureOutput({
        getOutHasColors: () => supportsColorStdout !== false && supportsColorStdout.level > 0,
        getErrHasColors: () => supportsColorStderr !== false && supportsColorStderr.level > 0,
        stripColor: (str) => stripAnsi(str),
      });

    const ctx: Context = {};

    console.log(
        supportsColorStdout !== false && supportsColorStdout.level > 0 ? StudioCMSColorway.bold(title) : title
    )
    
    program
        .name('create-studiocms')
        .description('StudioCMS CLI Utility Toolkit.')
        .version('0.0.1', '-V, --version', 'Output the current version of the CLI Toolkit.')
        .option('-v, --verbose', 'Enable verbose logging.')
        .option('--color', 'force color output') // implemented by chalk
        .option('--no-color', 'disable color output') // implemented by chalk
        // define the default command if no command is provided
        .action(() => {
            ctx.command = "default";
        });

    program
        .command("help")
        .description("Output the help menu.")
        .action(() => {
            ctx.command = "help";
        });

    program.parse();

    // Update the context
    ctx.options = program.opts();

    switch (ctx.command) {
        case "default":
            program.help();
            break;
        case "help":
            program.help();
            break;
        default:
            console.error(`Unknown command: ${ctx.command}`);
            program.help();
            break
    }
    
}