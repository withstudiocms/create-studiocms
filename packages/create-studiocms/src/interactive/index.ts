import { tasks } from '@clack/prompts';
import type { FancyCommand } from '../commander.js';
import { logger } from '../utils.js';
import { getContext } from './context.js';
import { dependencies } from './dependencies.js';
import { git } from './git.js';
import { intro } from './intro.js';
import { next } from './nextSteps.js';
import { projectName } from './projectName.js';
import { template } from './template.js';
import { verify } from './verify.js';

export async function interactiveCLI(this: FancyCommand) {
	logger.log('Starting interactive CLI...');

	const ctx = await getContext(this.opts());

	console.log('');

	// Run the interactive CLI
	const steps = [
		verify,
		intro,
		projectName,
		template,
		dependencies,

		// Steps which write files should go above this line
		git,
	];

	for (const step of steps) {
		await step(ctx);
	}

	console.log(''); // Add a newline after the last step

	await tasks(ctx.tasks);

	await next(ctx);

	process.exit(0);
}
