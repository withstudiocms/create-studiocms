import chalk from 'chalk';
import stripAnsi from 'strip-ansi';
import { FancyCommand } from './commander.js';
import { interactive } from './interactive.js';
import { CLITitle, date, logger } from './utils.js';

export async function main() {
	logger.log('Starting StudioCMS CLI Utility Toolkit...');

	process.stdout.write(CLITitle);

	// Initialize the CLI program
	const program = new FancyCommand();
	program
		// Metadata
		.name('create-studiocms')
		.description('StudioCMS CLI Utility Toolkit.')
		.version('0.0.1', '-V, --version', 'Output the current version of the CLI Toolkit.')
		.configureOutput({
			getOutHasColors: () => chalk.level > 0,
			getErrHasColors: () => chalk.level > 0,
			stripColor: (str) => stripAnsi(str),
			writeErr: (str) => process.stdout.write(`ERROR [${date}]: ${str}`),
			// Output errors in red.
			outputError: (str, write) => write(`${chalk.red.bold(`ERROR [${date}]:`)} ${chalk.red(str)}`),
		})
		.configureHelp({
			sortSubcommands: true,
			subcommandTerm: (cmd) => `${cmd.name()} ${cmd.usage()}`,
		})
		// Global Options
		.option('--color', 'force color output') // implemented by chalk
		.option('--no-color', 'disable color output'); // implemented by chalk

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
