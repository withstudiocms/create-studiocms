import chalk from 'chalk';
import stripAnsi from 'strip-ansi';
import pkgJson from '../package.json';
import { FancyCommand, subCommandOptions } from './commander.js';
import type { InteractiveOptions } from './types.js';
import { CLITitle, date, logger, supportsColor } from './utils.js';

export async function main() {
	logger.log('Starting StudioCMS CLI Utility Toolkit...');

	process.stdout.write(CLITitle);

	// Initialize the CLI program
	const program = new FancyCommand();
	program
		// Metadata
		.name('create-studiocms')
		.description('StudioCMS CLI Utility Toolkit.')
		.version(pkgJson.version, '-V, --version', 'Output the current version of the CLI Toolkit.')
		.configureOutput({
			getOutHasColors: () => supportsColor,
			getErrHasColors: () => supportsColor,
			stripColor: (str) => stripAnsi(str),
			writeErr: (str) => process.stdout.write(`ERROR [${date}]: ${str}`),
			// Output errors in red.
			outputError: (str, write) => write(`${chalk.red.bold(`ERROR [${date}]:`)} ${chalk.red(str)}`),
		})
		.configureHelp({
			sortSubcommands: true,
			subcommandTerm: (cmd) => cmd.name(),
			subcommandDescription: (cmd) => `${cmd.summary()}${subCommandOptions(cmd)}`,
		})
		.showHelpAfterError('(add --help for additional information)')
		.enablePositionalOptions(true)
		// Global Options
		.option('--color', 'force color output') // implemented by chalk
		.option('--no-color', 'disable color output'); // implemented by chalk

	// Register commands
	program
		.command('help', { isDefault: true })
		.description('Display the main help menu.')
		.summary('Display the main help menu.')
		.action(() => {
			program.help();
		});

	program
		.command('interactive')
		.description('Start the interactive CLI Toolkit. Powered by Clack.cc')
		.summary('Start the interactive CLI Toolkit.')

		// Options
		.option('--create', 'Create a new project.', true)
		.option('--template [template]', 'The template to use.', 'basic')
		.option('--project-name [project-name]', 'The name of the project.')
		.option('--no-git', 'Do not initializing a git repository.')
		.option('--no-install', 'Do not install dependencies.')
		.option('--dry-run', 'Do not perform any actions.')

		// Action
		.action(async function (this: FancyCommand) {
			logger.log('Starting interactive CLI...');

			const defaultOptions: InteractiveOptions = {
				create: true,
				template: 'basic',
				projectName: undefined,
				git: false,
				install: false,
				dryRun: false,
			};

			const options = { ...defaultOptions, ...this.opts<InteractiveOptions>() };

			console.log(options);
		});

	await program.parseAsync();
}
