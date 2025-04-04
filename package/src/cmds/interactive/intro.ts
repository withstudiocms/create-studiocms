import color from 'chalk';
import { StudioCMSColorway, StudioCMSColorwayBg } from '../../utils/index.js';
import { label, say } from '../../utils/messages.js';
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
				ctx.welcome,
			] as string[],
			{ clear: true }
		);
		ctx.debug && ctx.logger.debug('Welcome message printed');
	}
}
