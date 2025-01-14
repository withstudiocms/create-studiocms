import path from 'node:path';
import { nextSteps, say } from '../messages.js';
import type { Context } from './context.js';

export async function next(ctx: Pick<Context, 'cwd' | 'packageManager' | 'skipBanners'>) {
	const projectDir = path.relative(process.cwd(), ctx.cwd);

	const commandMap: { [key: string]: string } = {
		npm: 'npm run dev',
		bun: 'bun run dev',
		yarn: 'yarn dev',
		pnpm: 'pnpm dev',
	};

	const devCmd = commandMap[ctx.packageManager as keyof typeof commandMap] || 'npm run dev';
	await nextSteps({ projectDir, devCmd });

	if (!ctx.skipBanners) {
		await say(['Enjoy your new StudioCMS Project! 🚀']);
	}
	return;
}
