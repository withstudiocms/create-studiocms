import color from 'chalk';
import { label, say } from '../messages.js';
import { StudioCMSColorway, StudioCMSColorwayBg } from '../utils.js';
import type { Context } from './context.js';

export async function intro(
	ctx: Pick<
		Context,
		'welcome' | 'version' | 'username' | 'skipBanners' | 'debug' | 'logger' | 'prompt'
	>
) {
	if (!ctx.skipBanners) {
		ctx.debug && ctx.logger.debug('Printing welcome message...');
		await say(
			[
				[
					'Welcome',
					'to',
					label('StudioCMS', StudioCMSColorwayBg, color.black),
					StudioCMSColorway(`v${ctx.version}`),
					ctx.username,
				],
				ctx.welcome || `Let's create something unforgettable!`,
			] as string[],
			{ clear: true }
		);
		ctx.debug && ctx.logger.debug('Welcome message printed');
	}
}
