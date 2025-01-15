import dns from 'node:dns/promises';
import { verifyTemplate } from '@bluwy/giget-core';
import color from 'chalk';
import { bannerAbort, error, info, log } from '../messages.js';
import { logger } from '../utils.js';
import type { Context } from './context.js';
import { getTemplateTarget } from './template.js';

export async function verify(
	ctx: Pick<
		Context,
		'version' | 'dryRun' | 'template' | 'templateRef' | 'exit' | 'debug' | 'templateRegistry'
	>
) {
	const { debug } = ctx;

	if (!ctx.dryRun) {
		if (debug) logger.debug('Checking internet connection...');
		const online = await isOnline();
		if (!online) {
			bannerAbort();
			log('');
			error('error', 'Unable to connect to the internet.');
			ctx.exit(1);
		}
		if (debug) logger.debug('Internet connection verified');
	}

	if (ctx.template) {
		if (debug) logger.debug('Verifying template...');
		const target = getTemplateTarget(ctx.template, ctx.templateRegistry, ctx.templateRef);
		const ok = await verifyTemplate(target);
		if (!ok) {
			bannerAbort();
			log('');
			error('error', `Template ${color.reset(ctx.template)} ${color.dim('could not be found!')}`);
			await info('check', ctx.templateRegistry.currentRepositoryUrl);
			ctx.exit(1);
		}
		if (debug) logger.debug('Template verified');
	}
}

function isOnline(): Promise<boolean> {
	return dns.lookup('github.com').then(
		() => true,
		() => false
	);
}
