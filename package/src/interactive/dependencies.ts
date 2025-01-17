import fs from 'node:fs';
import path from 'node:path';
import color from 'chalk';
import { shell } from '../shell.js';
import { StudioCMSColorwayError, StudioCMSColorwayInfo } from '../utils.js';
import type { Context } from './context.js';

export async function dependencies(
	ctx: Pick<
		Context,
		| 'install'
		| 'yes'
		| 'prompt'
		| 'promptCancel'
		| 'packageManager'
		| 'cwd'
		| 'dryRun'
		| 'tasks'
		| 'exit'
		| 'debug'
		| 'logger'
	>
) {
	ctx.debug && ctx.logger.debug('Running dependencies...');
	let deps = ctx.install ?? ctx.yes;
	if (deps === undefined) {
		const _deps = await ctx.prompt.confirm({
			message: 'Would you like to install dependencies?',
			initialValue: true,
		});

		if (typeof _deps === 'symbol') {
			ctx.promptCancel(_deps);
		} else {
			ctx.debug && ctx.logger.debug(`Dependencies: ${_deps}`);

			deps = _deps;
		}

		ctx.install = deps;
	}

	if (ctx.dryRun) {
		ctx.prompt.log.info(
			`${StudioCMSColorwayInfo.bold('--dry-run')} ${color.dim('Skipping dependency installation')}`
		);
	} else if (deps) {
		ctx.tasks.push({
			title: 'Install dependencies',
			task: async (message) => {
				message('Installing dependencies...');
				try {
					install({ packageManager: ctx.packageManager, cwd: ctx.cwd });
					message('Dependencies installed');
				} catch (e) {
					ctx.prompt.log.error(
						`Error: ${e instanceof Error ? e.message : 'Unable to install dependencies'}`
					);
					ctx.prompt.log.error(
						StudioCMSColorwayError(
							`Error: Dependencies failed to install, please run ${color.bold(
								`${ctx.packageManager} install`
							)} to install them manually after setup.}`
						)
					);
				}
			},
		});
	} else {
		ctx.prompt.log.info(
			StudioCMSColorwayInfo(
				`${ctx.yes === false ? 'deps [skip]' : 'No problem!'} 'Remember to install dependencies after setup.'`
			)
		);
	}

	ctx.debug && ctx.logger.debug('Dependencies complete');
}

async function install({ packageManager, cwd }: { packageManager: string; cwd: string }) {
	if (packageManager === 'yarn') await ensureYarnLock({ cwd });
	return shell(packageManager, ['install'], { cwd, timeout: 90_000, stdio: 'ignore' });
}

async function ensureYarnLock({ cwd }: { cwd: string }) {
	const yarnLock = path.join(cwd, 'yarn.lock');
	if (fs.existsSync(yarnLock)) return;
	return fs.promises.writeFile(yarnLock, '', { encoding: 'utf-8' });
}
