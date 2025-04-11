import os from 'node:os';
import * as p from '@clack/prompts';
import { type Task, log } from '@clack/prompts';
import c, { type ChalkInstance } from 'chalk';
import { cancelMessage, getName } from './messages.js';

interface BaseContext {
	p: typeof p;
	c: ChalkInstance;
	cwd: string;
	packageManager: string;
	username: string;
	tasks: p.Task[];
	log: typeof log;
	exit(code: number): never;
	addTask(task: Task): void;
	pCancel(val: symbol): void;
	pOnCancel(): void;
}

interface InteractiveOptions {
	dryRun?: boolean;
	skipBanners?: boolean;
	debug?: boolean;
}

export interface Context extends BaseContext, InteractiveOptions {}

export async function getBaseContext(args: InteractiveOptions): Promise<Context> {
	let { debug, dryRun, skipBanners } = args;

	const packageManager = detectPackageManager() ?? 'npm';
	const cwd = process.cwd();

	skipBanners = !!((os.platform() === 'win32' || skipBanners) && !process.env.CI);

	const username = await getName();

	const tasks: Task[] = [];

	return {
		p,
		c,
		packageManager,
		dryRun,
		debug,
		cwd,
		skipBanners,
		log,
		username,
		tasks,
		addTask(task) {
			tasks.push(task);
		},
		exit(code) {
			process.exit(code);
		},
		pCancel(val: symbol) {
			p.isCancel(val);
			p.cancel(cancelMessage);
			process.exit(0);
		},
		pOnCancel() {
			p.cancel(cancelMessage);
			process.exit(0);
		},
	};
}

export function detectPackageManager() {
	if (!process.env.npm_config_user_agent) return;
	const specifier = process.env.npm_config_user_agent.split(' ')[0];
	const name = specifier.substring(0, specifier.lastIndexOf('/'));
	return name === 'npminstall' ? 'cnpm' : name;
}
