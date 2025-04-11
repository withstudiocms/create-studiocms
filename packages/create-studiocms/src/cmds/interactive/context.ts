import os from 'node:os';
import * as p from '@clack/prompts';
import { type Logger, buildLogger, cancelMessage, getName } from '@withstudiocms/cli-kit';
import packageJson from 'package-json';
import { templateRegistry } from '../../templates.config.js';
import getSeasonalMessages from './data/seasonal.js';
import type { TemplateRegistry } from './templates.types.js';

interface InteractiveOptions {
	template?: string;
	templateRef?: string;
	projectName?: string;
	install?: boolean;
	doNotInstall?: boolean;
	git?: boolean;
	doNotInitGit?: boolean;
	dryRun?: boolean;
	yes?: boolean;
	no?: boolean;
	skipBanners?: boolean;
	debug?: boolean;
}

export interface Context extends InteractiveOptions {
	prompt: typeof p;
	promptCancel: (val: symbol) => void;
	promptOnCancel: () => void;
	cwd: string;
	packageManager: string;
	username: string;
	welcome: string;
	version: string;
	exit(code: number): never;
	tasks: p.Task[];
	isStudioCMSProject: boolean;
	templateRegistry: TemplateRegistry;
	logger: Logger;
}

export async function getContext(args: InteractiveOptions & { cwd?: string }): Promise<Context> {
	let {
		skipBanners,
		dryRun,
		git,
		install,
		doNotInitGit,
		doNotInstall,
		debug,
		template,
		yes,
		no,
		projectName,
		templateRef,
	} = args;

	const packageManager = detectPackageManager() ?? 'npm';
	const cwd = args.cwd ?? process.cwd();

	const { version } = await packageJson('studiocms');

	if (no) {
		yes = false;
		if (install === undefined) install = false;
		if (git === undefined) git = false;
	}

	skipBanners =
		(os.platform() === 'win32' || skipBanners) ??
		[yes, no, git, install].some((v) => v !== undefined);

	const { messages } = getSeasonalMessages();

	const logger = buildLogger(debug || false);

	const context: Context = {
		prompt: p,
		promptCancel(val: symbol) {
			p.isCancel(val);
			p.cancel(cancelMessage);
			process.exit(0);
		},
		promptOnCancel() {
			p.cancel(cancelMessage);
			process.exit(0);
		},
		packageManager,
		username: await getName(),
		version,
		dryRun,
		projectName,
		template,
		debug,
		templateRef: templateRef ?? 'main',
		welcome: random(messages),
		yes,
		no,
		install: install ?? (doNotInstall ? false : undefined),
		git: git ?? (doNotInitGit ? false : undefined),
		cwd,
		skipBanners,
		exit(code) {
			process.exit(code);
		},
		tasks: [],
		isStudioCMSProject: false,
		templateRegistry,
		logger,
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
