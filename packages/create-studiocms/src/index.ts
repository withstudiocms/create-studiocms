import figlet from "figlet";
import stripAnsi from 'strip-ansi';
import chalk from 'chalk';
import { MyCommand, supportsColor } from "./commander.js";
import { logger } from "./logger.js";
  
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

    logger.log("Starting StudioCMS CLI Utility Toolkit...");

    const program = new MyCommand()

    program.configureOutput({
        getOutHasColors: () => supportsColor(),
        getErrHasColors: () => supportsColor(),
        stripColor: (str) => stripAnsi(str),
      });

    const ctx: Context = {};

    const title = figlet.textSync("StudioCMS");
    
    const StudioCMSColorway = chalk.hex('#a581f3');

    console.log(
        supportsColor() ? StudioCMSColorway.bold(title) : title
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
        .description("Display the main help menu.")
        .action(() => {
            ctx.command = "help";
        });

    program.parse();

    // Update the context
    ctx.options = program.opts();

    switch (ctx.command) {
        case "default":
            program.addHelpText('after', chalk.italic(`\nNo command provided. See above for available options and commands.`));
            program.help();
            break;
        case "help":
            program.help();
            break;
        default:
            program.addHelpText('after', chalk.italic(`\nNo command provided. See above for available options and commands.`));
            program.help();
            break
    }
    
}