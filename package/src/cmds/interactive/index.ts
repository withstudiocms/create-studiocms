import { tasks } from '@clack/prompts';
import { Option } from '@commander-js/extra-typings';
import color from 'chalk';
import { Command, type instanceCommand } from '../../utils/commander.js';
import { StudioCMSColorwayBg } from '../../utils/index.js';
import { label } from '../../utils/messages.js';
import { getContext } from './context.js';
import { dependencies } from './dependencies.js';
import { env } from './envBuilder.js';
import { git } from './git.js';
import { intro } from './intro.js';
import { next } from './nextSteps.js';
import { projectName } from './projectName.js';
import { template } from './template.js';
import { verify } from './verify.js';

export { getContext, dependencies, env, git, intro, next, projectName, template, verify };

export const InteractiveCMD = new Command('interactive')
	.description(
		'Start the interactive CLI. Powered by Clack.cc.\n\nThis command will open an interactive CLI prompt to guide you through\nthe process of creating a new StudioCMS(or StudioCMS Ecosystem package)\nproject using one of the available templates.'
	)
	.summary('Start the interactive CLI.')
	.addOption(new Option('-t, --template <template>', 'The template to use.'))
	.addOption(new Option('-r, --template-ref <template-ref>', 'The template reference to use.'))
	.addOption(new Option('-p, --project-name <project-name>', 'The name of the project.'))
	.addOption(new Option('-i, --install', 'Install dependencies.'))
	.addOption(new Option('-g, --git', 'Initialize a git repository.'))
	.addOption(new Option('-y, --yes', 'Skip all prompts and use default values.'))
	.addOption(new Option('-n, --no', 'Skip all prompts and use default values.'))
	.addOption(new Option('-q, --skip-banners', 'Skip all banners and messages.'))
	.addOption(new Option('--do-not-install', 'Do not install dependencies.'))
	.addOption(new Option('--do-not-init-git', 'Do not initializing a git repository.'))
	.addOption(new Option('--dry-run', 'Do not perform any actions.'))
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
