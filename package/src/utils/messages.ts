import { exec } from 'node:child_process';
import readline from 'node:readline';
import type { Key } from 'node:readline';
import type * as _prompts from '@clack/prompts';
import ansiEscapes from 'ansi-escapes';
import _boxen, { type Options as BoxenOptions } from 'boxen';
import color from 'chalk';
import cliCursor from 'cli-cursor';
import isUnicodeSupported from 'is-unicode-supported';
import sliceAnsi from 'slice-ansi';
import stripAnsi from 'strip-ansi';
import wrapAnsi from 'wrap-ansi';
import {
	StudioCMSColorway,
	StudioCMSColorwayBg,
	StudioCMSColorwayInfo,
	StudioCMSColorwayInfoBg,
} from './index.js';

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

export function setStdout(writable: typeof process.stdout) {
	stdout = writable;
}

export function boxen(
	header?: string,
	body?: { ln0?: string; ln1?: string; ln2?: string; ln3?: string; ln4?: string; ln5?: string },
	footer?: string,
	boxenOptions: BoxenOptions = { padding: 0, borderStyle: 'none' }
) {
	const prefix = stdout.columns < 80 ? ' ' : ' '.repeat(4);
	const boxContent: string[] = [];

	const logo = _boxen(
		[
			`${color.white.bold('    ████')}`,
			`${color.white.bold('  █ ████')}`,
			`${color.white.bold('█ █▄▄▄  ')}`,
			`${color.white.bold('█▄▄▄    ')}`,
		].join('\n'),
		{
			padding: 1,
			borderStyle: 'none',
			backgroundColor: 'black',
		}
	).split('\n');

	if (header) {
		boxContent.push(`${header}\n`);
	}

	boxContent.push(
		...[
			`${logo[0]}${prefix}${body?.ln0 || ''}`,
			`${logo[1]}${prefix}${body?.ln1 || ''}`,
			`${logo[2]}${prefix}${body?.ln2 || ''}`,
			`${logo[3]}${prefix}${body?.ln3 || ''}`,
			`${logo[4]}${prefix}${body?.ln4 || ''}`,
			`${logo[5]}${prefix}${body?.ln5 || ''}`,
		]
	);

	if (footer) {
		boxContent.push(`\n${footer}`);
	}

	return _boxen(boxContent.join('\n'), boxenOptions);
}

const unicode = isUnicodeSupported();
const s = (c: string, fallback: string) => (unicode ? c : fallback);
const S_BAR = s('│', '|');

export type LogMessageOptions = {
	symbol?: string;
};

const defaultTerminalHeight = 24;
const getWidth = ({ columns = 80 }) => columns;
const fitToTerminalHeight = (stream: typeof stdout, text: string) => {
	const terminalHeight = stream.rows ?? defaultTerminalHeight;
	const lines = text.split('\n');
	const toRemove = Math.max(0, lines.length - terminalHeight);
	return toRemove
		? sliceAnsi(text, stripAnsi(lines.slice(0, toRemove).join('\n')).length + 1)
		: text;
};

export function createClackMessageUpdate(
	stream = stdout,
	{ showCursor = false, symbol = color.gray(S_BAR) } = {}
) {
	let previousLineCount = 0;
	let previousWidth = getWidth(stream);
	let previousOutput = '';

	const reset = () => {
		previousOutput = '';
		previousWidth = getWidth(stream);
		previousLineCount = 0;
	};

	const render = (arguments_: string) => {
		if (!showCursor) {
			cliCursor.hide();
		}

		const parts = [];

		const [firstLine, ...lines] = arguments_.split('\n');
		parts.push(`${symbol}  ${firstLine}`, ...lines.map((ln) => `${color.gray(S_BAR)}  ${ln}`));

		let output = fitToTerminalHeight(stream, `${parts.join('\n')}\n`);
		const width = getWidth(stream);

		if (output === previousOutput && previousWidth === width) {
			return;
		}

		previousOutput = output;
		previousWidth = width;
		output = wrapAnsi(output, width, { trim: false, hard: true, wordWrap: false });

		stream.write(ansiEscapes.eraseLines(previousLineCount) + output);
		previousLineCount = output.split('\n').length;
	};

	render.clear = () => {
		stream.write(ansiEscapes.eraseLines(previousLineCount));
		reset();
	};

	render.done = () => {
		reset();
		if (!showCursor) {
			cliCursor.show();
		}
	};

	return render;
}

export const say = async (msg: string | string[] = [], { clear = false } = {}) => {
	const messages = Array.isArray(msg) ? msg : [msg];
	const rl = readline.createInterface({ input: stdin, escapeCodeTimeout: 50 });
	const logUpdate = createClackMessageUpdate(stdout, { showCursor: false });
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
			logUpdate(`\n${boxen(undefined, { ln3: msg.join(' ') })}`);
			if (!cancelled) await sleep(randomBetween(75, 200));
			j++;
		}
		if (!cancelled) await sleep(100);
		const tmp = await Promise.all(_message).then((res) => res.join(' '));
		const text = `\n${boxen(undefined, { ln3: tmp })}`;
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

export const nextSteps = async ({
	projectDir,
	devCmd,
	p,
	isStudioCMSProject,
}: { projectDir: string; devCmd: string; p: typeof _prompts; isStudioCMSProject: boolean }) => {
	p.log.success(
		boxen(
			color.bold(
				`${label('Setup Complete!', StudioCMSColorwayInfoBg, color.bold)} Explore your new project! 🚀`
			),
			{
				ln0: isStudioCMSProject
					? `Ensure your ${color.cyanBright('.env')} file is configured correctly.`
					: '',
				ln2: `Enter your project directory using ${StudioCMSColorwayInfo(`cd ${projectDir}`)}`,
				ln3: isStudioCMSProject
					? `Run ${color.cyan('astro db push')} to sync your database schema.`
					: `Run ${color.cyan(devCmd)} to start the dev server. ${color.cyanBright('CTRL+C')} to stop.`,
				ln4: isStudioCMSProject
					? `Run ${color.cyan(devCmd)} to start the dev server. ${color.cyanBright('CTRL+C')} to stop.`
					: '',
			}
		)
	);

	p.outro(
		`${label(isStudioCMSProject ? 'Enjoy your new CMS!' : 'Enjoy your new project!', StudioCMSColorwayBg, color.bold)} Stuck? Join us on Discord at ${StudioCMSColorway.bold.underline('https://chat.studiocms.dev')}`
	);
};

export const cancelMessage =
	"Operation cancelled, exiting... If you're stuck, join us at https://chat.studiocms.dev";
