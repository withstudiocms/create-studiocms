import { exec } from 'node:child_process';
import readline from 'node:readline';
import type { Key } from 'node:readline';
import boxen from 'boxen';
import color from 'chalk';
import { createLogUpdate } from 'log-update';
import { StudioCMSColorway, StudioCMSColorwayBg, StudioCMSColorwayInfo } from './utils.js';

export const action = (key: Key, isSelect: boolean) => {
	if (key.meta && key.name !== 'escape') return;

	if (key.ctrl) {
		if (key.name === 'a') return 'first';
		if (key.name === 'c') return 'abort';
		if (key.name === 'd') return 'abort';
		if (key.name === 'e') return 'last';
		if (key.name === 'g') return 'reset';
	}

	if (isSelect) {
		if (key.name === 'j') return 'down';
		if (key.name === 'k') return 'up';
		if (key.ctrl && key.name === 'n') return 'down';
		if (key.ctrl && key.name === 'p') return 'up';
	}

	if (key.name === 'return') return 'submit';
	if (key.name === 'enter') return 'submit'; // ctrl + J
	if (key.name === 'backspace') return 'delete';
	if (key.name === 'delete') return 'deleteForward';
	if (key.name === 'abort') return 'abort';
	if (key.name === 'escape') return 'exit';
	if (key.name === 'tab') return 'next';
	if (key.name === 'pagedown') return 'nextPage';
	if (key.name === 'pageup') return 'prevPage';
	// TODO create home() in prompt types (e.g. TextPrompt)
	if (key.name === 'home') return 'home';
	// TODO create end() in prompt types (e.g. TextPrompt)
	if (key.name === 'end') return 'end';

	if (key.name === 'up') return 'up';
	if (key.name === 'down') return 'down';
	if (key.name === 'right') return 'right';
	if (key.name === 'left') return 'left';

	return false;
};

let stdout = process.stdout;

const stdin = process.stdin;

/** @internal Used to mock `process.stdout.write` for testing purposes */
export function setStdout(writable: typeof process.stdout) {
	stdout = writable;
}

const StudioCMSLogo = (
	prefix: string,
	msg: string,
	messages?: { ln1?: string; ln2?: string; ln4?: string }
) =>
	[
		`${color.white.bold('    ████')}${prefix}${messages?.ln1 || ''}`,
		`${color.white.bold('  █ ████')}${prefix}${messages?.ln2 || ''}`,
		`${color.white.bold('█ █▄▄▄  ')}${prefix}${msg}`,
		`${color.white.bold('█▄▄▄    ')}${prefix}${messages?.ln4 || ''}`,
	].join('\n');

export const say = async (msg: string | string[] = [], { clear = false } = {}) => {
	const messages = Array.isArray(msg) ? msg : [msg];
	const rl = readline.createInterface({ input: stdin, escapeCodeTimeout: 50 });
	const logUpdate = createLogUpdate(stdout, { showCursor: false });
	readline.emitKeypressEvents(stdin, rl);
	let i = 0;
	let cancelled = false;
	const done = async () => {
		stdin.off('keypress', done);
		if (stdin.isTTY) stdin.setRawMode(false);
		rl.close();
		cancelled = true;
		if (i < messages.length - 1) {
			logUpdate.clear();
		} else if (clear) {
			logUpdate.clear();
		} else {
			logUpdate.done();
		}
	};

	if (stdin.isTTY) stdin.setRawMode(true);
	stdin.on('keypress', (str, key) => {
		if (stdin.isTTY) stdin.setRawMode(true);
		const k = action(key, true);
		if (k === 'abort') {
			done();
			return process.exit(0);
		}
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		if (['up', 'down', 'left', 'right'].includes(k as any)) return;
		done();
	});

	const face = (msg: string) => {
		const max = stdout.columns;
		const prefix = max < 80 ? ' ' : ' '.repeat(4);

		const box = boxen(StudioCMSLogo(prefix, msg), {
			width: max < 80 ? max : max / 2,
			textAlignment: 'left',
			padding: 1,
			borderColor: '#a581f3',
			borderStyle: 'double',
			backgroundColor: 'black',
		});

		return box;
	};

	for (let message of messages) {
		// biome-ignore lint/correctness/noSelfAssign: <explanation>
		message = message;
		const _message = Array.isArray(message) ? message : message.split(' ');
		const msg = [];
		let j = 0;
		for (let word of [''].concat(_message)) {
			// biome-ignore lint/correctness/noSelfAssign: <explanation>
			word = word;
			if (word) msg.push(word);
			logUpdate(`\n${face(msg.join(' '))}`);
			if (!cancelled) await sleep(randomBetween(75, 200));
			j++;
		}
		if (!cancelled) await sleep(100);
		const tmp = await Promise.all(_message).then((res) => res.join(' '));
		const text = `\n${face(tmp)}`;
		logUpdate(text);
		if (!cancelled) await sleep(randomBetween(1200, 1400));
		i++;
	}
	stdin.off('keypress', done);
	await sleep(100);
	done();
	if (stdin.isTTY) stdin.setRawMode(false);
	stdin.removeAllListeners('keypress');
};

export const randomBetween = (min: number, max: number) =>
	Math.floor(Math.random() * (max - min + 1) + min);

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const random = (...arr: any[]) => {
	const flattenedArray = arr.flat(1);
	return flattenedArray[Math.floor(flattenedArray.length * Math.random())];
};

export const label = (text: string, c = StudioCMSColorwayBg, t = color.whiteBright) =>
	c(` ${t(text)} `);

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getName = () =>
	new Promise<string>((resolve) => {
		exec('git config user.name', { encoding: 'utf-8' }, (_1, gitName) => {
			if (gitName.trim()) {
				return resolve(gitName.split(' ')[0].trim());
			}
			exec('whoami', { encoding: 'utf-8' }, (_3, whoami) => {
				if (whoami.trim()) {
					return resolve(whoami.split(' ')[0].trim());
				}
				return resolve('StudioCMS User');
			});
		});
	});

export const nextSteps = async ({ projectDir, devCmd }: { projectDir: string; devCmd: string }) => {
	const max = stdout.columns;
	const prefix = max < 80 ? ' ' : ' '.repeat(4);
	const logUpdate = createLogUpdate(stdout, { showCursor: false });

	logUpdate(
		boxen(
			[
				color.bold('Setup Complete. Explore your new project!'),
				'',
				StudioCMSLogo(prefix, '', {
					ln1: `Enter your project directory using ${StudioCMSColorwayInfo(`cd ${projectDir}`)}`,
					ln2: `Run ${color.cyan(devCmd)} to start the dev server. ${color.cyanBright('CTRL+C')} to stop.`,
					ln4: `Stuck? Join us on Discord at ${StudioCMSColorway.bold.underline('https://chat.studiocms.dev')}`,
				}),
			].join('\n'),
			{
				width: max < 80 ? max : max / 2,
				borderColor: '#a581f3',
				borderStyle: 'double',
				padding: 1,
				backgroundColor: 'black',
			}
		)
	);
};

export const cancelMessage =
	"Operation cancelled, exiting... If you're stuck, join us at https://chat.studiocms.dev";
