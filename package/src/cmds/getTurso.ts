import { Command } from '../utils/commander.js';
import { logger, runInteractiveCommand } from '../utils/index.js';

export const getTurso = new Command('getTurso')
	.description('Turso CLI Utilities')
	.summary('Turso CLI Utilities')
	.action(async () => {
		try {
			logger.log('Starting Turso install...');
			await runInteractiveCommand('curl -sSfL https://get.tur.so/install.sh | bash');
			logger.log('Command completed successfully.');
		} catch (error) {
			logger.error(`Failed to run Turso install: ${(error as Error).message}`);
		}
	});
