import { tasks } from '@clack/prompts';
import type { instanceCommand } from '../commander.js';
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

export async function interactiveCLI(this: instanceCommand) {
	const opts = this.opts();

	const ctx = await getContext(this.opts());

	ctx.logger.log('Starting interactive CLI...');

	opts.debug && ctx.logger.debug(`Options: ${JSON.stringify(opts, null, 2)}`);

	opts.debug && ctx.logger.debug(`Context: ${JSON.stringify(ctx, null, 2)}`);

	console.log('');

	opts.debug && ctx.logger.debug('Running interactive CLI Steps...');

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

	console.log(''); // Add a newline after the last step

	opts.debug && ctx.logger.debug('Running tasks...');

	await tasks(ctx.tasks);

	opts.debug && ctx.logger.debug('Running next steps...');

	await next(ctx);

	opts.debug && ctx.logger.debug('Interactive CLI completed, exiting...');

	process.exit(0);
}
