import path from 'node:path';
import color from 'chalk';
import { info, log } from '../messages';
import type { Context } from './context';
import { generateProjectName } from './data/project';
import { isEmpty, toValidName } from './shared';

export async function projectName(
	ctx: Pick<Context, 'cwd' | 'yes' | 'dryRun' | 'prompt' | 'projectName' | 'exit'>
) {
	await checkCwd(ctx.cwd);

	if (!ctx.cwd || !isEmpty(ctx.cwd)) {
		if (!isEmpty(ctx.cwd)) {
			await info('Hmm...', `${color.reset(`"${ctx.cwd}"`)}${color.dim(' is not empty!')}`);
		}

		if (ctx.yes) {
			ctx.projectName = generateProjectName();
			ctx.cwd = `./${ctx.projectName}`;
			await info('dir', `Project created at ./${ctx.projectName}`);
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

		ctx.cwd = (name as string).trim();
		ctx.projectName = toValidName(name as string);
		if (ctx.dryRun) {
			await info('--dry-run', 'Skipping project naming');
			return;
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
}

async function checkCwd(cwd: string | undefined) {
	const empty = cwd && isEmpty(cwd);
	if (empty) {
		log('');
		await info('dir', `Using ${color.reset(cwd)}${color.dim(' as project directory')}`);
	}

	return empty;
}
