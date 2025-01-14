import chalk from 'chalk';
import stripAnsi from 'strip-ansi';
import pkgJson from '../package.json';
import { Command, subCommandOptions } from './commander.js';
import { interactiveCLI } from './interactive/index.js';
import { CLITitle, date, logger, supportsColor } from './utils.js';

const exit = () => process.exit(0);
process.on('SIGINT', exit);
process.on('SIGTERM', exit);

export async function main() {
	logger.log('Starting StudioCMS CLI Utility Toolkit...');

	// Initialize the CLI program
	const program = new Command();

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
			subcommandDescription: (cmd) => {
				const desc = cmd.summary() || cmd.description();
				const opts = subCommandOptions(cmd);
				return `${desc}${opts}`;
			},
		})
		.addHelpText('beforeAll', CLITitle)
		.showHelpAfterError('(add --help for additional information)')
		.enablePositionalOptions(true)
		// Global Options
		.option('--color', 'force color output') // implemented by chalk
		.option('--no-color', 'disable color output') // implemented by chalk
		.helpCommand('help [cmd]', 'Show help for command'); // Enable help command

	//
	// Register commands
	//

	// Interactive
	program
		.command('interactive', { isDefault: true })
		.description(
			'Start the interactive CLI. Powered by Clack.cc.\n\nThis command will open an interactive CLI prompt to guide you through\nthe process of creating a new StudioCMS(or StudioCMS Ecosystem package)\nproject using one of the available templates.'
		)
		.summary('Start the interactive CLI.')

		// Options
		.option('-t, --template [template]', 'The template to use.')
		.option('-r, --template-ref [template-ref]', 'The template reference to use.')
		.option('-p, --project-name [project-name]', 'The name of the project.')
		.option('-i, --install', 'Install dependencies.')
		.option('--do-not-install', 'Do not install dependencies.')
		.option('-g, --git', 'Initialize a git repository.')
		.option('--do-not-init-git', 'Do not initializing a git repository.')
		.option('--dry-run', 'Do not perform any actions.')
		.option('-y, --yes', 'Skip all prompts and use default values.')
		.option('-n, --no', 'Skip all prompts and use default values.')
		.option('-q, --skip-banners', 'Skip all banners and messages.')

		// Action
		.action(interactiveCLI);

	// Parse the command line arguments and run the program
	await program.parseAsync();
}
