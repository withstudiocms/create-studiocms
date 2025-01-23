import chalk from 'chalk';
import { Command } from './utils/commander.js';
import {
	CLITitle,
	ChalkColorOption,
	ChalkColorOptionNo,
	StudioCMSColorwayError,
	termPrefix,
} from './utils/index.js';
import readJson from './utils/readJson.js';

const pkgJson = readJson<{ version: string }>(new URL('../package.json', import.meta.url));

const main = await new Command('create-studiocms')
	.description('StudioCMS CLI Utility Toolkit.')
	.version(pkgJson.version, '-V, --version', 'Output the current version of the CLI Toolkit.')
	.addHelpText('beforeAll', CLITitle)
	.addHelpText(
		'afterAll',
		`\n${termPrefix}${chalk.dim.italic(`${chalk.reset(StudioCMSColorwayError('*'))} Indicates the default command that is run when calling this CLI.`)}`
	)
	.showHelpAfterError('(add --help for additional information)')
	.enablePositionalOptions(true)
	.executableDir('dist/cmds')

	// Global Options
	.addOption(ChalkColorOption)
	.addOption(ChalkColorOptionNo)

	// Commands
	.command('interactive', 'Start the interactive CLI.', {
		isDefault: true,
		executableFile: 'interactive.js',
	})
	.command('get-turso', 'Get the latest version of Turso.', {
		executableFile: 'get-turso.js',
	})

	// Parse the command line arguments and run the program
	.parseAsync();

export { main };
export { setStdout } from './utils/messages.js';
export * from './cmds/interactive/index.js';
export { templateRegistry } from './templates.config.js';
