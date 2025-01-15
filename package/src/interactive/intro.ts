import color from 'chalk';
import { banner, label, say } from '../messages.js';
import { StudioCMSColorway, StudioCMSColorwayBg, logger } from '../utils.js';
import type { Context } from './context.js';

export async function intro(
	ctx: Pick<Context, 'welcome' | 'version' | 'username' | 'skipBanners' | 'debug'>
) {
	ctx.debug && logger.debug('Running intro...');
	banner();

	if (!ctx.skipBanners) {
		ctx.debug && logger.debug('Printing welcome message...');
		const { welcome } = ctx;
		await say(
			[
				[
					'Welcome',
					'to',
					label('StudioCMS', StudioCMSColorwayBg, color.black),
					Promise.resolve(ctx.version).then(
						(version) => `${version ? StudioCMSColorway(`v${version}`) : ''},`
					),
					Promise.resolve(ctx.username).then((username) => `${username}!`),
				],
				welcome ?? `Let's create something unforgettable!`,
			] as string[],
			{ clear: true }
		);
		ctx.debug && logger.debug('Welcome message printed');
	}
}
