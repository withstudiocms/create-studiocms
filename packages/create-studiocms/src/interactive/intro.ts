import color from 'chalk';
import { banner, label, say } from '../messages.js';
import { StudioCMSColorway, StudioCMSColorwayBg } from '../utils.js';
import type { Context } from './context.js';

export async function intro(
	ctx: Pick<Context, 'welcome' | 'version' | 'username' | 'skipBanners'>
) {
	banner();

	if (!ctx.skipBanners) {
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
	}
}
