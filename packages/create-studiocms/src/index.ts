import chalk from 'chalk';
import stripAnsi from 'strip-ansi';
import pkgJson from '../package.json';
import { FancyCommand, subCommandOptions } from './commander.js';
import { interactiveCLI } from './interactive/index.js';
import { CLITitle, date, logger, supportsColor } from './utils.js';

const exit = () => process.exit(0);
process.on('SIGINT', exit);
process.on('SIGTERM', exit);

export async function main() {
	logger.log('Starting StudioCMS CLI Utility Toolkit...');

	// Initialize the CLI program
	const program = new FancyCommand();

	// Setup the program
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
		.addHelpText('beforeAll', CLITitle)
		.showHelpAfterError('(add --help for additional information)')
		.enablePositionalOptions(true)
		// Global Options
		.option('--color', 'force color output') // implemented by chalk
		.option('--no-color', 'disable color output'); // implemented by chalk

	//
	// Register commands
	//

	// Help
	program
		.command('help', { isDefault: true, hidden: true })
		.description('Display the main help menu.')
		.summary('Display the main help menu.')
		.action(() => program.help());

	// Interactive
	program
		.command('interactive')
		.description('Start the interactive CLI Toolkit. Powered by Clack.cc')
		.summary('Start the interactive CLI Toolkit.')

		// Options
		.option('--template [template]', 'The template to use.')
		.option('--template-ref [template-ref]', 'The template reference to use.')
		.option('--project-name [project-name]', 'The name of the project.')
		.option('--no-git', 'Do not initializing a git repository.')
		.option('--no-install', 'Do not install dependencies.')
		.option('--dry-run', 'Do not perform any actions.')
		.option('-y, --yes', 'Skip all prompts and use default values.')
		.option('--skip-banners', 'Skip all banners and messages.')

		// Action
		.action(interactiveCLI);

	// Parse the command line arguments and run the program
	await program.parseAsync();
}
