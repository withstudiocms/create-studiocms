import { exec } from 'node:child_process';
import readline from 'node:readline';
import type { Key } from 'node:readline';
import { stripVTControlCharacters } from 'node:util';
import color from 'chalk';
import { createLogUpdate } from 'log-update';
import {
	StudioCMSColorway,
	StudioCMSColorwayBg,
	StudioCMSColorwayError,
	StudioCMSColorwayErrorBg,
	StudioCMSColorwayInfo,
	StudioCMSColorwayWarn,
} from './utils.js';

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
/** @internal Used to mock `process.stdout.write` for testing purposes */
export function setStdout(writable: typeof process.stdout) {
	stdout = writable;
}

type Message = string | Promise<string>;

// biome-ignore lint/style/useConst: <explanation>
let _stdout = stdout;

export const say = async (
	msg: Message | Message[] = [],
	{ clear = false, stdin = process.stdin, stdout = _stdout } = {}
) => {
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
		return [
			`${StudioCMSColorway.bold('    ████')}`,
			`${StudioCMSColorway.bold('  █ ████')}`,
			`${StudioCMSColorway.bold('█ █▄▄▄  ')}${prefix}${msg}`,
			`${StudioCMSColorway.bold('█▄▄▄    ')}`,
		].join('\n');
	};

	for (let message of messages) {
		message = await message;
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

export const log = (message: string) => stdout.write(`${message}\n`);

export const label = (text: string, c = StudioCMSColorwayBg, t = color.whiteBright) =>
	c(` ${t(text)} `);

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const strip = (str: string) => {
	const pattern = [
		'[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
		'(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PRZcf-ntqry=><~]))',
	].join('|');

	const RGX = new RegExp(pattern, 'g');
	return typeof str === 'string' ? str.replace(RGX, '') : str;
};

export const align = (text: string, dir: 'start' | 'end' | 'center', len: number) => {
	const pad = Math.max(len - strip(text).length, 0);
	switch (dir) {
		case 'start':
			return text + ' '.repeat(pad);
		case 'end':
			return ' '.repeat(pad) + text;
		case 'center':
			return ' '.repeat(Math.floor(pad / 2)) + text + ' '.repeat(Math.floor(pad / 2));
		default:
			return text;
	}
};

export const title = (text: string) => `${align(label(text), 'end', 7)} `;

export const banner = () => {
	const prefix = 'studiocms';
	const suffix = 'Interactive CLI';
	log(`${label(prefix, StudioCMSColorwayBg, color.black)}  ${suffix}`);
};

export const bannerAbort = () =>
	log(
		`\n${label('studiocms', StudioCMSColorwayErrorBg)} ${color.bold('Initialization sequence aborted.')}`
	);

export const info = async (prefix: string, text: string) => {
	await sleep(100);
	if (stdout.columns < 80) {
		log(`${' '.repeat(5)} ${StudioCMSColorwayInfo('◼')}  ${StudioCMSColorwayInfo(prefix)}`);
		log(`${' '.repeat(9)}${color.dim(text)}`);
	} else {
		log(
			`${' '.repeat(5)} ${StudioCMSColorwayInfo('◼')}  ${StudioCMSColorwayInfo(prefix)} ${color.dim(text)}`
		);
	}
};

export const warn = async (prefix: string, text: string) => {
	await sleep(100);
	if (stdout.columns < 80) {
		log(`${' '.repeat(5)} ${StudioCMSColorwayWarn('◼')}  ${StudioCMSColorwayWarn(prefix)}`);
		log(`${' '.repeat(9)}${color.dim(text)}`);
	} else {
		log(
			`${' '.repeat(5)} ${StudioCMSColorwayWarn('◼')}  ${StudioCMSColorwayWarn(prefix)} ${color.dim(text)}`
		);
	}
};

export const error = async (prefix: string, text: string) => {
	if (stdout.columns < 80) {
		log(`${' '.repeat(5)} ${StudioCMSColorwayError('▲')}  ${StudioCMSColorwayError(prefix)}`);
		log(`${' '.repeat(9)}${color.dim(text)}`);
	} else {
		log(
			`${' '.repeat(5)} ${StudioCMSColorwayError('▲')}  ${StudioCMSColorwayError(prefix)} ${color.dim(text)}`
		);
	}
};

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
	const prefix = max < 80 ? ' ' : ' '.repeat(9);
	await sleep(200);
	log(
		`\n ${StudioCMSColorwayBg(` ${color.black('next')} `)}  ${color.bold(
			'Setup Complete. Explore your project!'
		)}`
	);

	await sleep(100);
	if (projectDir !== '') {
		projectDir = projectDir.includes(' ') ? `"./${projectDir}"` : `./${projectDir}`;
		const enter = [
			`\n${prefix}Enter your project directory using`,
			StudioCMSColorway(`cd ${projectDir}`, ''),
		];
		const len = enter[0].length + stripVTControlCharacters(enter[1]).length;
		log(enter.join(len > max ? `\n${prefix}` : ' '));
	}
	log(
		`${prefix}Run ${StudioCMSColorway(devCmd)} to start the dev server. ${StudioCMSColorway('CTRL+C')} to stop.`
	);
	await sleep(100);
	log(`\n${prefix}Stuck? Join us at ${StudioCMSColorway('https://chat.studiocms.dev')}`);
	await sleep(200);
};

export const cancelMessage =
	"Operation cancelled, exiting... If you're stuck, join us at https://chat.studiocms.dev";
