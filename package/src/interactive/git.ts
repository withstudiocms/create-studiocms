import fs from 'node:fs';
import path from 'node:path';
import color from 'chalk';
import { shell } from '../shell.js';
import { StudioCMSColorwayError, StudioCMSColorwayInfo } from '../utils.js';
import type { Context } from './context.js';

export async function git(
	ctx: Pick<
		Context,
		| 'cwd'
		| 'git'
		| 'yes'
		| 'prompt'
		| 'dryRun'
		| 'tasks'
		| 'exit'
		| 'debug'
		| 'logger'
		| 'promptCancel'
	>
) {
	ctx.debug && ctx.logger.debug('Running git...');
	if (fs.existsSync(path.join(ctx.cwd, '.git'))) {
		ctx.prompt.log.info(StudioCMSColorwayInfo('Nice! Git has already been initialized'));
		return;
	}
	let _git = ctx.git ?? ctx.yes;
	if (_git === undefined) {
		const __git = await ctx.prompt.confirm({
			message: 'Initialize a new git repository?',
			initialValue: true,
		});

		if (typeof __git === 'symbol') {
			ctx.promptCancel(__git);
		} else {
			ctx.debug && ctx.logger.debug(`Git: ${__git}`);
			_git = __git;
		}
	}

	if (ctx.dryRun) {
		ctx.prompt.log.info(
			`${StudioCMSColorwayInfo.bold('--dry-run')} ${color.dim('Skipping Git initialization')}`
		);
	} else if (_git) {
		ctx.tasks.push({
			title: 'Git',
			task: async (message) => {
				message('Git initializing...');
				try {
					await init({ cwd: ctx.cwd });
					message('Git initialized');
				} catch (e) {
					ctx.prompt.log.error(
						StudioCMSColorwayError(
							`Error: ${e instanceof Error ? e.message : 'Unable to initialize git'}`
						)
					);
					ctx.prompt.log.error(
						StudioCMSColorwayError(
							'Unknown Error: Git failed to initialize, please run git init manually after setup.'
						)
					);
				}
			},
		});
	} else {
		ctx.prompt.log.info(
			StudioCMSColorwayInfo(
				`${ctx.yes === false ? 'git [skip]' : 'Sounds good!'} You can always run ${color.reset('git init')}${color.dim(' manually.')}`
			)
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
