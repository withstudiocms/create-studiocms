import path from 'node:path';
import {
	StudioCMSColorway,
	StudioCMSColorwayBg,
	StudioCMSColorwayInfo,
	StudioCMSColorwayInfoBg,
} from '@withstudiocms/cli-kit/colors';
import { boxen, label } from '@withstudiocms/cli-kit/messages';
import color from 'chalk';
import type { Context } from './context.js';

export async function next(
	ctx: Pick<
		Context,
		'cwd' | 'packageManager' | 'skipBanners' | 'debug' | 'logger' | 'prompt' | 'isStudioCMSProject'
	>
) {
	ctx.debug && ctx.logger.debug('Running next steps...');
	const projectDir = path.relative(process.cwd(), ctx.cwd);

	ctx.debug && ctx.logger.debug(`Project directory: ${projectDir}`);

	const commandMap: { [key: string]: string } = {
		npm: 'npm run dev',
		bun: 'bun run dev',
		yarn: 'yarn dev',
		pnpm: 'pnpm dev',
	};

	const devCmd = commandMap[ctx.packageManager as keyof typeof commandMap] || 'npm run dev';

	ctx.debug && ctx.logger.debug(`Dev command: ${devCmd}`);

	ctx.debug && ctx.logger.debug('Running next steps fn...');

	ctx.prompt.log.success(
		boxen(
			color.bold(
				`${label('Setup Complete!', StudioCMSColorwayInfoBg, color.bold)} Explore your new project! 🚀`
			),
			{
				ln0: ctx.isStudioCMSProject
					? `Ensure your ${color.cyanBright('.env')} file is configured correctly.`
					: '',
				ln2: `Enter your project directory using ${StudioCMSColorwayInfo(`cd ${projectDir}`)}`,
				ln3: ctx.isStudioCMSProject
					? `Run ${color.cyan('astro db push')} to sync your database schema.`
					: `Run ${color.cyan(devCmd)} to start the dev server. ${color.cyanBright('CTRL+C')} to stop.`,
				ln4: ctx.isStudioCMSProject
					? `Run ${color.cyan(devCmd)} to start the dev server. ${color.cyanBright('CTRL+C')} to stop.`
					: '',
			}
		)
	);

	ctx.prompt.outro(
		`${label(ctx.isStudioCMSProject ? 'Enjoy your new CMS!' : 'Enjoy your new project!', StudioCMSColorwayBg, color.bold)} Stuck? Join us on Discord at ${StudioCMSColorway.bold.underline('https://chat.studiocms.dev')}`
	);

	ctx.debug && ctx.logger.debug('Next steps complete');
}
