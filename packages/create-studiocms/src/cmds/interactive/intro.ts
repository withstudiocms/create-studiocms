import { StudioCMSColorway, StudioCMSColorwayBg } from '@withstudiocms/cli-kit/colors';
import { label, say } from '@withstudiocms/cli-kit/messages';
import color from 'chalk';
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
