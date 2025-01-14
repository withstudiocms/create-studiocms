import * as p from '@clack/prompts';
import pkgJson from '../../package.json';
import { getName } from '../messages.js';
import type { InteractiveOptions } from '../types.js';
import getSeasonalMessages from './data/seasonal.js';

export interface Context extends InteractiveOptions {
	prompt: typeof p;
	cwd: string;
	packageManager: string;
	username: Promise<string>;
	welcome: string;
	version: string;
	stdin?: typeof process.stdin;
	stdout?: typeof process.stdout;
	exit(code: number): never;
	tasks: p.Task[];
}

export async function getContext(args: InteractiveOptions): Promise<Context> {
	const {
		skipBanners,
		dryRun,
		git,
		install,
		template,
		yes,
		projectName: projectN,
		templateRef,
	} = args;

	const packageManager = detectPackageManager() ?? 'npm';
	const cwd = process.cwd();
	const projectName = projectN || cwd.split('/').pop();

	const { messages } = getSeasonalMessages();

	const context: Context = {
		prompt: p,
		packageManager,
		username: getName(),
		version: pkgJson.version,
		dryRun,
		projectName,
		template,
		templateRef: templateRef ?? 'latest',
		welcome: random(messages),
		yes,
		install: install,
		git: git,
		cwd,
		skipBanners,
		exit(code) {
			process.exit(code);
		},
		tasks: [],
	};
	return context;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const random = (...arr: any[]) => {
	const flattenedArray = arr.flat(1);
	return flattenedArray[Math.floor(flattenedArray.length * Math.random())];
};

function detectPackageManager() {
	if (!process.env.npm_config_user_agent) return;
	const specifier = process.env.npm_config_user_agent.split(' ')[0];
	const name = specifier.substring(0, specifier.lastIndexOf('/'));
	return name === 'npminstall' ? 'cnpm' : name;
}
