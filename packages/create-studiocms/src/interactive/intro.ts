import color from 'chalk';
import { banner, label, say } from '../messages';
import type { Context } from './context';

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
					label('StudioCMS', color.bgGreen, color.black),
					Promise.resolve(ctx.version).then(
						(version) => `${version ? color.green(`v${version}`) : ''},`
					),
					Promise.resolve(ctx.username).then((username) => `${username}!`),
				],
				welcome ?? "Let's build something awesome!",
			] as string[],
			{ clear: true }
		);
	}
}
