import { StudioCMSColorwayError } from '@withstudiocms/cli-kit/colors';
import { Command, Option } from '@withstudiocms/cli-kit/commander';
import { CLITitle, termPrefix } from '@withstudiocms/cli-kit/messages';
import pathUtil from '@withstudiocms/cli-kit/utils';
import chalk from 'chalk';
import readJson from './utils/readJson.js';

const pkgJson = readJson<{ version: string }>(new URL('../package.json', import.meta.url));

const { getRelPath } = pathUtil(import.meta.url);

await new Command('create-studiocms')
	.description('StudioCMS CLI Utility Toolkit.')
	.version(pkgJson.version, '-V, --version', 'Output the current version of the CLI Toolkit.')
	.addHelpText('beforeAll', CLITitle)
	.addHelpText(
		'afterAll',
		`\n${termPrefix}${chalk.dim.italic(`${chalk.reset(StudioCMSColorwayError('*'))} Indicates the default command that is run when calling this CLI.`)}`
	)
	.showHelpAfterError('(add --help for additional information)')
	.enablePositionalOptions(true)
	.executableDir(getRelPath('cmds'))

	// Global Options
	.addOption(new Option('--color', 'Force color output') /* implemented by chalk */)
	.addOption(new Option('--no-color', 'Disable color output') /* implemented by chalk */)

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
