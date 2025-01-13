import { FancyCommand } from './commander.js';
import { logger } from './utils.js';

export async function interactive() {
	const interactive = new FancyCommand('interactive');

	interactive.description('Interactive CLI Toolkit.').action(() => {
		logger.log('Starting interactive CLI...');
	});

	return interactive;
}
