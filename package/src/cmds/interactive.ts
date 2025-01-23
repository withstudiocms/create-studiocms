import { tasks } from '@clack/prompts';
import color from 'chalk';
import { Command, Option } from '../utils/commander.js';
import { StudioCMSColorwayBg } from '../utils/index.js';
import { label } from '../utils/messages.js';
import {
	dependencies,
	env,
	getContext,
	git,
	intro,
	next,
	projectName,
	template,
	verify,
} from './interactive/index.js';

const program = new Command('interactive')
	.description(
		'Start the interactive CLI. Powered by Clack.cc.\n\nThis command will open an interactive CLI prompt to guide you through\nthe process of creating a new StudioCMS(or StudioCMS Ecosystem package)\nproject using one of the available templates.'
	)
	.summary('Start the interactive CLI.')
	.addOption(new Option('-c, --cwd <cwd>', 'The current working directory.'))
	.addOption(new Option('-d, --dry-run', 'Do not perform any actions.'))
	.addOption(
		new Option('--do-not-init-git', 'Do not initializing a git repository.').conflicts('git')
	)
	.addOption(new Option('--do-not-install', 'Do not install dependencies.').conflicts('install'))
	.addOption(new Option('-g, --git', 'Initialize a git repository.').conflicts('doNotInitGit'))
	.addOption(new Option('-i, --install', 'Install dependencies.').conflicts('doNotInstall'))
	.addOption(new Option('-n, --no', 'Skip all prompts and use default values.').conflicts('yes'))
	.addOption(new Option('-p, --project-name <project-name>', 'The name of the project.'))
	.addOption(new Option('-q, --skip-banners', 'Skip all banners and messages.'))
	.addOption(new Option('-r, --template-ref <template-ref>', 'The template reference to use.'))
	.addOption(new Option('-t, --template <template>', 'The template to use.'))
	.addOption(new Option('-y, --yes', 'Skip all prompts and use default values.').conflicts('no'))
	.addOption(new Option('--debug', 'Enable debug mode.').hideHelp(true))
	.action(async function () {
		const opts = this.opts();

		const ctx = await getContext(opts);

		ctx.logger.log('Starting interactive CLI...');

		opts.debug && ctx.logger.debug(`Options: ${JSON.stringify(opts, null, 2)}`);

		opts.debug && ctx.logger.debug(`Context: ${JSON.stringify(ctx, null, 2)}`);

		console.log('');

		opts.debug && ctx.logger.debug('Running interactive CLI Steps...');

		ctx.prompt.intro(
			`${label('StudioCMS', StudioCMSColorwayBg, color.black)} Interactive CLI - Project Setup`
		);

		// Run the interactive CLI
		const steps = [
			verify,
			intro,
			projectName,
			template,
			dependencies,
			env,

			// Steps which write files should go above this line
			git,
		];

		for (const step of steps) {
			await step(ctx);
		}

		opts.debug && ctx.logger.debug('Running tasks...');

		await tasks(ctx.tasks);

		opts.debug && ctx.logger.debug('Running next steps...');

		await next(ctx);

		opts.debug && ctx.logger.debug('Interactive CLI completed, exiting...');

		process.exit(0);
	});

await program.parseAsync();
