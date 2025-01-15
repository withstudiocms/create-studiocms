import { tasks } from '@clack/prompts';
import type { instanceCommand } from '../commander.js';
import { logger } from '../utils.js';
import { getContext } from './context.js';
import { dependencies } from './dependencies.js';
import { env } from './envBuilder.js';
import { git } from './git.js';
import { intro } from './intro.js';
import { next } from './nextSteps.js';
import { projectName } from './projectName.js';
import { template } from './template.js';
import { verify } from './verify.js';

export async function interactiveCLI(this: instanceCommand) {
	logger.log('Starting interactive CLI...');

	const opts = this.opts();

	opts.debug && logger.debug(`Options: ${JSON.stringify(opts, null, 2)}`);

	const ctx = await getContext(this.opts());

	opts.debug && logger.debug(`Context: ${JSON.stringify(ctx, null, 2)}`);

	console.log('');

	opts.debug && logger.debug('Running interactive CLI Steps...');

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

	opts.debug && logger.debug('Running tasks...');

	await tasks(ctx.tasks);

	opts.debug && logger.debug('Running next steps...');

	await next(ctx);

	opts.debug && logger.debug('Interactive CLI completed, exiting...');

	process.exit(0);
}
