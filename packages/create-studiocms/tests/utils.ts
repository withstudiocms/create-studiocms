import { stripVTControlCharacters } from 'node:util';
import { beforeAll, beforeEach } from 'vitest';
import { setStdout } from '../dist/utils/messages.js';

export function setup() {
	const ctx: { messages: string[] } = { messages: [] };

	beforeAll(() => {
		setStdout(
			Object.assign({}, process.stdout, {
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				write(buf: any) {
					ctx.messages.push(stripVTControlCharacters(String(buf)).trim());
					return true;
				},
			})
		);
	});

	beforeEach(() => {
		ctx.messages = [];
	});

	return {
		messages() {
			return ctx.messages;
		},
		length() {
			return ctx.messages.length;
		},
		hasMessage(content: string): boolean {
			return !!ctx.messages.find((msg) => msg.includes(content));
		},
		prompt: {
			log: {
				info: (str: string) => ctx.messages.push(str),
				log: (str: string) => ctx.messages.push(str),
				warn: (str: string) => ctx.messages.push(str),
				error: (str: string) => ctx.messages.push(str),
			},
			isCancel: () => false,
			cancel: () => {},
		},
	};
}
