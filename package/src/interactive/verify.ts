import dns from 'node:dns/promises';
import { verifyTemplate } from '@bluwy/giget-core';
import color from 'chalk';
import { StudioCMSColorwayError, StudioCMSColorwayInfo } from '../utils.js';
import type { Context } from './context.js';
import { getTemplateTarget } from './template.js';

export async function verify(
	ctx: Pick<
		Context,
		| 'version'
		| 'dryRun'
		| 'template'
		| 'templateRef'
		| 'exit'
		| 'debug'
		| 'templateRegistry'
		| 'logger'
		| 'prompt'
	>
) {
	if (!ctx.dryRun) {
		if (ctx.debug) ctx.logger.debug('Checking internet connection...');
		const online = await isOnline();
		if (!online) {
			ctx.prompt.log.error(StudioCMSColorwayError('Error: Unable to connect to the internet.'));
			ctx.exit(1);
		}
		if (ctx.debug) ctx.logger.debug('Internet connection verified');
	}

	if (ctx.template) {
		if (ctx.debug) ctx.logger.debug('Verifying template...');
		const target = getTemplateTarget(ctx.template, ctx.templateRegistry, ctx.templateRef);
		const ok = await verifyTemplate(target);
		if (!ok) {
			ctx.prompt.log.error(
				StudioCMSColorwayError(
					`Error: Template ${color.reset(ctx.template)} ${color.dim('could not be found!')}`
				)
			);
			ctx.prompt.log.info(
				StudioCMSColorwayInfo(
					`Check ${ctx.templateRegistry.currentRepositoryUrl} for available templates.`
				)
			);
			ctx.exit(1);
		}
		if (ctx.debug) ctx.logger.debug('Template verified');
	}
}

function isOnline(): Promise<boolean> {
	return dns.lookup('github.com').then(
		() => true,
		() => false
	);
}
