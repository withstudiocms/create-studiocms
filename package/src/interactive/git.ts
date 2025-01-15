import fs from 'node:fs';
import path from 'node:path';
import color from 'chalk';
import { error, info } from '../messages.js';
import { shell } from '../shell.js';
import type { Context } from './context.js';

export async function git(
	ctx: Pick<
		Context,
		'cwd' | 'git' | 'yes' | 'prompt' | 'dryRun' | 'tasks' | 'exit' | 'debug' | 'logger'
	>
) {
	ctx.debug && ctx.logger.debug('Running git...');
	if (fs.existsSync(path.join(ctx.cwd, '.git'))) {
		await info('Nice!', 'Git has already been initialized');
		return;
	}
	let _git = ctx.git ?? ctx.yes;
	if (_git === undefined) {
		const __git = await ctx.prompt.confirm({
			message: 'Initialize a new git repository?',
			initialValue: true,
		});

		if (ctx.prompt.isCancel(__git)) {
			ctx.prompt.cancel('Operation cancelled.');
			ctx.exit(0);
		}

		ctx.debug && ctx.logger.debug(`Git: ${__git}`);

		_git = __git;
	}

	if (ctx.dryRun) {
		await info('--dry-run', 'Skipping Git initialization');
	} else if (_git) {
		ctx.tasks.push({
			title: 'Git',
			task: async (message) => {
				message('Git initializing...');
				try {
					await init({ cwd: ctx.cwd });
					message('Git initialized');
				} catch (e) {
					error('error', e instanceof Error ? e.message : 'Unable to initialize git');
					error('error', 'Git failed to initialize, please run git init manually after setup.');
				}
			},
		});
	} else {
		await info(
			ctx.yes === false ? 'git [skip]' : 'Sounds good!',
			`You can always run ${color.reset('git init')}${color.dim(' manually.')}`
		);
	}

	ctx.debug && ctx.logger.debug('Git complete');
}

async function init({ cwd }: { cwd: string }) {
	try {
		await shell('git', ['init'], { cwd, stdio: 'ignore' });
		await shell('git', ['add', '-A'], { cwd, stdio: 'ignore' });
		await shell(
			'git',
			[
				'commit',
				'-m',
				'"Initial commit from StudioCMS"',
				'--author="StudioCMS[bot] <studiocms-no-reply@users.noreply.github.com>"',
			],
			{ cwd, stdio: 'ignore' }
		);
	} catch {}
}
