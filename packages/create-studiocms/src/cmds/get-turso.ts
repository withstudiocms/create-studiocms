import { Command } from '@withstudiocms/cli-kit/commander';
import { buildLogger } from '@withstudiocms/cli-kit/logger';
import { runInteractiveCommand } from '@withstudiocms/cli-kit/utils';

await new Command('getTurso')
	.description('Turso CLI Installer')
	.summary('Turso CLI Installer')
	.action(async () => {
		const logger = buildLogger(false);
		try {
			logger.log('Starting Turso install...');
			await runInteractiveCommand('curl -sSfL https://get.tur.so/install.sh | bash');
			logger.log('Command completed successfully.');
		} catch (error) {
			logger.error(`Failed to run Turso install: ${(error as Error).message}`);
		}
	})
	.parseAsync();
