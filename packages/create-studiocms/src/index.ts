import figlet from "figlet";
import stripAnsi from 'strip-ansi';
import chalk from 'chalk';
import { MyCommand, supportsColor } from "./commander.js";
import { logger } from "./logger.js";
import { dt } from "./utils.js";
import { interactive } from "./interactive.js";
    
const StudioCMSColorway = chalk.hex('#a581f3');
const date = dt.format(new Date());

export async function main() {

    logger.log("Starting StudioCMS CLI Utility Toolkit...");

    const title = figlet.textSync("StudioCMS");

    console.log(
        supportsColor() ? StudioCMSColorway.bold(title) : title
    )
    
    // Initialize the CLI program
    const program = new MyCommand();
    program
        // Metadata
        .name('create-studiocms')
        .description('StudioCMS CLI Utility Toolkit.')
        .version('0.0.1', '-V, --version', 'Output the current version of the CLI Toolkit.')
        .configureOutput({
            getOutHasColors: () => supportsColor(),
            getErrHasColors: () => supportsColor(),
            stripColor: (str) => stripAnsi(str),
            writeOut: (str) => process.stdout.write(`[${date}]: ${str}`),
            writeErr: (str) => process.stdout.write(`ERROR [${date}]: ${str}`),
            // Output errors in red.
            outputError: (str, write) => write(`${chalk.red.bold(`ERROR [${date}]:`)} ${chalk.red(str)}`),
        })
        .configureHelp({
            sortSubcommands: true,
            subcommandTerm: (cmd) => cmd.name() + ' ' + cmd.usage(),
        })
        // Global Options
        .option('--color', 'force color output') // implemented by chalk
        .option('--no-color', 'disable color output') // implemented by chalk

    // Register commands
    program
        .command('help', { isDefault: true })
        .description('Display the main help menu.')
        .action(() => {
            program.help();
        });

    program.addCommand(await interactive());

    await program.parseAsync();
}