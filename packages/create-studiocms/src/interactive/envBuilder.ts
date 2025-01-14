import fs from 'node:fs';
import path from 'node:path';
import { info } from '../messages.js';
import type { Context } from './context.js';
import ExampleEnv from './data/studiocmsenv.js';

export async function env(
	ctx: Pick<Context, 'cwd' | 'yes' | 'prompt' | 'dryRun' | 'tasks' | 'exit' | 'isStudioCMSProject'>
) {
	if (!ctx.isStudioCMSProject) {
		return;
	}

	let _env = ctx.yes;

	if (_env) {
		await info('env', 'Setting up basic environment file');
	} else {
		const envPrompt = await ctx.prompt.confirm({
			message: 'Would you like a basic environment file? (i.e .env)',
			initialValue: true,
		});

		if (ctx.prompt.isCancel(envPrompt)) {
			ctx.prompt.cancel('Operation cancelled.');
			ctx.exit(0);
		}

		_env = envPrompt;
	}

	if (ctx.dryRun) {
		await info('--dry-run', 'Skipping environment file creation');
	} else if (_env) {
		ctx.tasks.push({
			title: 'Environment Variable File',
			task: async () => {
				const s = ctx.prompt.spinner();
				s.start('Creating environment file...');
				try {
					await fs.writeFileSync(path.join(ctx.cwd, '.env'), ExampleEnv, {
						encoding: 'utf-8',
					});
					s.stop('Environment file created');
				} catch (e) {
					s.stop();
					if (e instanceof Error) {
						throw e;
					}
					throw new Error('Unable to create environment file');
				}
			},
		});
	}
}
