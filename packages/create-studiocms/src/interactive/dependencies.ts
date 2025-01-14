import fs from 'node:fs';
import path from 'node:path';
import color from 'chalk';
import { error, info } from '../messages';
import { shell } from '../shell';
import type { Context } from './context';

export async function dependencies(
	ctx: Pick<Context, 'install' | 'yes' | 'prompt' | 'packageManager' | 'cwd' | 'dryRun' | 'tasks'>
) {
	let deps = ctx.install ?? ctx.yes;
	if (deps === undefined) {
		deps = (await ctx.prompt.confirm({
			message: 'Would you like to install dependencies?',
			initialValue: true,
		})) as boolean;
		ctx.install = deps;
	}

	if (ctx.dryRun) {
		await info('--dry-run', 'Skipping dependency installation');
	} else if (deps) {
		ctx.tasks.push({
			title: 'Install dependencies',
			task: async (message) => {
				message('Installing dependencies...');
				try {
					install({ packageManager: ctx.packageManager, cwd: ctx.cwd });
					message('Dependencies installed');
				} catch (e) {
					error('error', e instanceof Error ? e.message : 'Unable to install dependencies');
					error(
						'error',
						`Dependencies failed to install, please run ${color.bold(
							`${ctx.packageManager} install`
						)} to install them manually after setup.`
					);
				}
			},
		});
	} else {
		await info(
			ctx.yes === false ? 'deps [skip]' : 'No problem!',
			'Remember to install dependencies after setup.'
		);
	}
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
