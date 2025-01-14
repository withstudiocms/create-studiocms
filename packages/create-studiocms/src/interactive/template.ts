import fs from 'node:fs';
import path from 'node:path';
import { downloadTemplate } from '@bluwy/giget-core';
import color from 'chalk';
import { error, info } from '../messages.js';
import type { Context } from './context.js';

export async function template(
	ctx: Pick<Context, 'template' | 'prompt' | 'yes' | 'dryRun' | 'exit' | 'tasks'>
) {
	if (!ctx.template && ctx.yes) ctx.template = 'basics';

	if (ctx.template) {
		await info(
			'template',
			`Using ${color.reset(ctx.template)}${color.dim(' as project template')}`
		);
	} else {
		const projectType = await ctx.prompt.select({
			message: 'What StudioCMS package would you like to use?',
			options: [
				{ value: 'studiocms', label: 'StudioCMS' },
				{ value: 'studiocms-ui', label: 'StudioCMS UI (@studiocms/ui)' },
			],
		});

		let _template: string;

		switch (projectType) {
			case 'studiocms': {
				_template = (await ctx.prompt.select({
					message: 'How would you like to start your new StudioCMS project?',
					options: [
						{ value: 'studiocms/basics', label: 'A basic, StudioCMS Project', hint: 'recommended' },
						{ value: 'studiocms/blog', label: 'StudioCMS project with the Blog Plugin' },
					],
				})) as string;
				ctx.template = _template;
				break;
			}
			case 'studiocms-ui': {
				_template = (await ctx.prompt.select({
					message: 'How would you like to start your new StudioCMS/UI project?',
					options: [
						{
							value: 'studiocms-ui/basics',
							label: 'A basic, StudioCMS UI Project',
							hint: 'recommended',
						},
						{ value: 'studiocms-ui/tailwind', label: 'StudioCMS UI project with Tailwind CSS' },
					],
				})) as string;
				ctx.template = _template;
				break;
			}
		}
	}

	if (ctx.dryRun) {
		await info('--dry-run', 'Skipping template copying');
	} else if (ctx.template) {
		ctx.tasks.push({
			title: 'Template',
			task: async (message) => {
				message('Template copying...');
				try {
					// biome-ignore lint/style/noNonNullAssertion: <explanation>
					await copyTemplate(ctx.template!, ctx as Context);
					message('Template copied');
				} catch (e) {
					if (e instanceof Error) {
						error('error', e.message);
						process.exit(1);
					} else {
						error('error', 'Unable to clone template.');
						process.exit(1);
					}
				}
			},
		});
	} else {
		ctx.exit(1);
	}
}

const FILES_TO_REMOVE = ['CHANGELOG.md', '.codesandbox'];
const FILES_TO_UPDATE = {
	'package.json': (file: string, overrides: { name: string }) =>
		fs.promises.readFile(file, 'utf-8').then((value) => {
			// Match first indent in the file or fallback to `\t`
			const indent = /(^\s+)/m.exec(value)?.[1] ?? '\t';
			return fs.promises.writeFile(
				file,
				JSON.stringify(
					Object.assign(JSON.parse(value), Object.assign(overrides, { private: undefined })),
					null,
					indent
				),
				'utf-8'
			);
		}),
};

export function getTemplateTarget(_template: string, ref = 'main') {
	// Handle third-party templates
	const isThirdParty = _template.includes('/');
	if (isThirdParty) return _template;

	// Handle StudioCMS templates
	if (ref === 'main') {
		// `latest` ref is specially handled to route to a branch specifically
		// to allow faster downloads. Otherwise giget has to download the entire
		// repo and only copy a sub directory
		return `github:withstudiocms/templates/${_template}`;
	}
	return `github:withstudiocms/templates/${_template}#${ref}`;
}

export default async function copyTemplate(_template: string, ctx: Context) {
	const templateTarget = getTemplateTarget(_template, ctx.templateRef);
	// Copy
	if (!ctx.dryRun) {
		try {
			await downloadTemplate(templateTarget, {
				force: true,
				cwd: ctx.cwd,
				dir: '.',
			});
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (err: any) {
			// Only remove the directory if it's most likely created by us.
			if (ctx.cwd !== '.' && ctx.cwd !== './' && !ctx.cwd.startsWith('../')) {
				try {
					fs.rmdirSync(ctx.cwd);
				} catch (_) {
					// Ignore any errors from removing the directory,
					// make sure we throw and display the original error.
				}
			}

			if (err.message?.includes('404')) {
				throw new Error(`Template ${color.reset(_template)} ${color.dim('does not exist!')}`);
			}

			if (err.message) {
				error('error', err.message);
			}
			try {
				// The underlying error is often buried deep in the `cause` property
				// This is in a try/catch block in case of weirdness's in accessing the `cause` property
				if ('cause' in err) {
					// This is probably included in err.message, but we can log it just in case it has extra info
					error('error', err.cause);
					if ('cause' in err.cause) {
						// Hopefully the actual fetch error message
						error('error', err.cause?.cause);
					}
				}
			} catch {}
			throw new Error(`Unable to download template ${color.reset(_template)}`);
		}

		// Post-process in parallel
		const removeFiles = FILES_TO_REMOVE.map(async (file) => {
			const fileLoc = path.resolve(path.join(ctx.cwd, file));
			if (fs.existsSync(fileLoc)) {
				return fs.promises.rm(fileLoc, { recursive: true });
			}
		});
		const updateFiles = Object.entries(FILES_TO_UPDATE).map(async ([file, update]) => {
			const fileLoc = path.resolve(path.join(ctx.cwd, file));
			if (fs.existsSync(fileLoc)) {
				// biome-ignore lint/style/noNonNullAssertion: <explanation>
				return update(fileLoc, { name: ctx.projectName! });
			}
		});

		await Promise.all([...removeFiles, ...updateFiles]);
	}
}
