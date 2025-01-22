import { Option } from '@commander-js/extra-typings';
import chalk from 'chalk';
import pkgJson from '../package.json';
import { getTurso } from './cmds/getTurso.js';
import { InteractiveCMD } from './cmds/interactive/index.js';
import { Command } from './utils/commander.js';
import { CLITitle, StudioCMSColorwayError, logger } from './utils/index.js';
import { setStdout } from './utils/messages.js';

export { setStdout };
export * from './cmds/interactive/index.js';
export { templateRegistry } from './templates.config.js';

const prefix = process.stdout.columns < 80 ? ' ' : ' '.repeat(2);

export async function main() {
	logger.log('Starting StudioCMS CLI Utility Toolkit...');

	// Initialize the CLI program
	await new Command('create-studiocms')
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
		.helpCommand('help [cmd]', 'Show help for command')
		// Commands
		.addCommand(InteractiveCMD, { isDefault: true })
		.addCommand(getTurso)
		// Parse the command line arguments and run the program
		.parseAsync();
}
