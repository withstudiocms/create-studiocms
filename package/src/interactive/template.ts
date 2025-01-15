import fs from 'node:fs';
import path from 'node:path';
import { downloadTemplate } from '@bluwy/giget-core';
import color from 'chalk';
import { error, info } from '../messages.js';
import { logger } from '../utils.js';
import type { Context } from './context.js';

function templateTargetFilter(
	template: string,
	templateRegistry: Context['templateRegistry'],
	explicitStudioCMS = false
) {
	if (explicitStudioCMS) {
		return template.startsWith(templateRegistry.filterRules.isStudioCMSProject);
	}

	return templateRegistry.filterRules.isWithStudioCMSRepo.some((rule) => template.startsWith(rule));
}

export async function template(
	ctx: Pick<
		Context,
		| 'template'
		| 'prompt'
		| 'yes'
		| 'dryRun'
		| 'exit'
		| 'tasks'
		| 'isStudioCMSProject'
		| 'debug'
		| 'templateRegistry'
	>
) {
	ctx.debug && logger.debug('Running template...');
	if (!ctx.template && ctx.yes) ctx.template = ctx.templateRegistry.defaultTemplate;

	if (ctx.template) {
		await info(
			'template',
			`Using ${color.reset(ctx.template)}${color.dim(' as project template')}`
		);
		ctx.isStudioCMSProject = templateTargetFilter(ctx.template, ctx.templateRegistry, true);
	} else {
		// These options correspond to the `withstudiocms/templates` repo on GitHub
		// the value is the directory in the root of the repo
		const projectType = await ctx.prompt.select({
			message: 'What StudioCMS package would you like to use?',
			options: ctx.templateRegistry.currentProjects,
		});

		if (ctx.prompt.isCancel(projectType)) {
			ctx.prompt.cancel('Operation cancelled.');
			ctx.exit(0);
		}

		ctx.debug && logger.debug(`Project type selected: ${projectType}`);

		const _template = await ctx.prompt.select({
			message: `How would you like to start your new ${ctx.templateRegistry.currentProjects.find((p) => p.value === projectType)?.label} project?`,
			options: ctx.templateRegistry.currentTemplates[projectType],
		});

		if (ctx.prompt.isCancel(_template)) {
			ctx.prompt.cancel('Operation cancelled.');
			ctx.exit(0);
		}

		ctx.debug && logger.debug(`Template selected: ${_template}`);

		ctx.template = _template;
		ctx.isStudioCMSProject = true;
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

	ctx.debug && logger.debug('Template complete');
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

export function getTemplateTarget(
	_template: string,
	templateRegistry: Context['templateRegistry'],
	ref = 'main'
) {
	if (!templateTargetFilter(_template, templateRegistry)) {
		// Handle third-party templates
		const isThirdParty = _template.includes('/');
		if (isThirdParty) return _template;
	}

	// Handle StudioCMS templates
	if (ref === 'main') {
		// `latest` ref is specially handled to route to a branch specifically
		// to allow faster downloads. Otherwise giget has to download the entire
		// repo and only copy a sub directory
		return `${templateRegistry.gigetRepoUrl}/${_template}`;
	}
	return `${templateRegistry.gigetRepoUrl}/${_template}#${ref}`;
}

export default async function copyTemplate(_template: string, ctx: Context) {
	const templateTarget = getTemplateTarget(_template, ctx.templateRegistry, ctx.templateRef);
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
