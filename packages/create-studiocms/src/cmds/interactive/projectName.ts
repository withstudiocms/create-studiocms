import path from 'node:path';
import { StudioCMSColorwayInfo, StudioCMSColorwayWarn } from '@withstudiocms/cli-kit/colors';
import color from 'chalk';
import type { Context } from './context.js';
import { generateProjectName } from './data/project.js';
import { isEmpty, toValidName } from './shared.js';

export async function projectName(
	ctx: Pick<
		Context,
		| 'cwd'
		| 'yes'
		| 'dryRun'
		| 'prompt'
		| 'projectName'
		| 'exit'
		| 'debug'
		| 'logger'
		| 'promptCancel'
	>
) {
	ctx.debug && ctx.logger.debug('Running projectName...');

	ctx.debug && ctx.logger.debug('Checking cwd...');
	await checkCwd(ctx.cwd, ctx.prompt);

	if (!ctx.cwd || !isEmpty(ctx.cwd)) {
		if (!isEmpty(ctx.cwd)) {
			ctx.prompt.log.warn(
				`${StudioCMSColorwayWarn('Hmm...')} ${color.reset(`"${ctx.cwd}"`)}${color.dim(' is not empty!')}`
			);
		}

		if (ctx.yes) {
			ctx.projectName = generateProjectName();
			ctx.cwd = `./${ctx.projectName}`;
			ctx.prompt.log.info(StudioCMSColorwayInfo(`Project created at ./${ctx.projectName}`));
			return;
		}

		const name = await ctx.prompt.text({
			message: 'Where should we create your new project?',
			initialValue: `./${generateProjectName()}`,
			validate(value) {
				if (!isEmpty(value)) {
					return 'Directory is not empty!';
				}
				// Check for non-printable characters
				if (value.match(/[^\x20-\x7E]/g) !== null)
					return 'Invalid non-printable character present!';
			},
		});

		if (typeof name === 'symbol') {
			ctx.promptCancel(name);
		} else {
			ctx.cwd = name.trim();
			ctx.projectName = toValidName(name);
			if (ctx.dryRun) {
				ctx.prompt.log.info(
					`${StudioCMSColorwayInfo.bold('--dry-run')} ${color.dim('Skipping project naming')}`
				);
				return;
			}
		}
	} else {
		let name = ctx.cwd;
		if (name === '.' || name === './') {
			const parts = process.cwd().split(path.sep);
			name = parts[parts.length - 1];
		} else if (name.startsWith('./') || name.startsWith('../')) {
			const parts = name.split('/');
			name = parts[parts.length - 1];
		}
		ctx.projectName = toValidName(name);
	}

	if (!ctx.cwd) {
		ctx.exit(1);
	}

	ctx.debug && ctx.logger.debug(`Project name: ${ctx.projectName}`);
}

async function checkCwd(cwd: string | undefined, prompt: Context['prompt']) {
	const empty = cwd && isEmpty(cwd);
	if (empty) {
		prompt.log.info(
			StudioCMSColorwayInfo(`Using ${color.reset(cwd)}${color.dim(' as project directory')}`)
		);
	}

	return empty;
}
