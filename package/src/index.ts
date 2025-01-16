import { Option } from '@commander-js/extra-typings';
import chalk from 'chalk';
import pkgJson from '../package.json';
import { Command } from './commander.js';
import { interactiveCLI } from './interactive/index.js';
import { setStdout } from './messages.js';
import { CLITitle, StudioCMSColorwayError, logger } from './utils.js';

export { setStdout };
export * from './interactive/index.js';

const max = process.stdout.columns;
const prefix = max < 80 ? ' ' : ' '.repeat(2);

export async function main() {
	logger.log('Starting StudioCMS CLI Utility Toolkit...');

	// Initialize the CLI program
	const program = new Command();

	// Setup the main program
	program
		.name('create-studiocms')
		.description('StudioCMS CLI Utility Toolkit.')
		.version(pkgJson.version, '-V, --version', 'Output the current version of the CLI Toolkit.')
		.addHelpText('beforeAll', CLITitle)
		.addHelpText(
			'afterAll',
			`\n${prefix}${chalk.dim.italic(`${chalk.reset(StudioCMSColorwayError('*'))} Indicates the default command that is run when calling this CLI.`)}`
		)
		.showHelpAfterError('(add --help for additional information)')
		.enablePositionalOptions(true)
		.helpOption('-h, --help', 'Display help for command.')
		// Global Options
		.addOption(new Option('--color', 'Force color output')) // implemented by chalk
		.addOption(new Option('--no-color', 'Disable color output')) // implemented by chalk
		.helpCommand('help [cmd]', 'Show help for command'); // Enable help command

	// Interactive CLI command
	program
		.command('interactive', { isDefault: true })
		.description(
			'Start the interactive CLI. Powered by Clack.cc.\n\nThis command will open an interactive CLI prompt to guide you through\nthe process of creating a new StudioCMS(or StudioCMS Ecosystem package)\nproject using one of the available templates.'
		)
		.summary('Start the interactive CLI.')
		.addOption(new Option('-t, --template [template]', 'The template to use.'))
		.addOption(new Option('-r, --template-ref [template-ref]', 'The template reference to use.'))
		.addOption(new Option('-p, --project-name [project-name]', 'The name of the project.'))
		.addOption(new Option('-i, --install', 'Install dependencies.'))
		.addOption(new Option('-g, --git', 'Initialize a git repository.'))
		.addOption(new Option('-y, --yes', 'Skip all prompts and use default values.'))
		.addOption(new Option('-n, --no', 'Skip all prompts and use default values.'))
		.addOption(new Option('-q, --skip-banners', 'Skip all banners and messages.'))
		.addOption(new Option('--do-not-install', 'Do not install dependencies.'))
		.addOption(new Option('--do-not-init-git', 'Do not initializing a git repository.'))
		.addOption(new Option('--dry-run', 'Do not perform any actions.'))
		.addOption(new Option('--debug', 'Enable debug mode.').hideHelp(true))
		.action(interactiveCLI);

	// Parse the command line arguments and run the program
	await program.parseAsync();
}
