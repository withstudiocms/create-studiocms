import type { Key } from 'node:readline';
import ansiEscapes from 'ansi-escapes';
import cliCursor from 'cli-cursor';
import stripAnsi from 'strip-ansi';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
	action,
	askToContinue,
	boxen,
	cancelled,
	createClackMessageUpdate,
	random,
	randomBetween,
	send,
	success,
} from '../src/messages.js'; // Adjust the import path based on your project structure

// Mock dependencies
vi.mock('node:child_process');
vi.mock('node:readline');
vi.mock('ansi-escapes');
vi.mock('chalk', () => ({
	default: {
		white: { bold: (str: string) => `white.bold(${str})` },
		gray: (str: string) => `gray(${str})`,
		whiteBright: (str: string) => `whiteBright(${str})`,
		green: (str: string) => `green(${str})`,
		yellow: (str: string) => `yellow(${str})`,
		black: (str: string) => `black(${str})`,
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		bgGreen: (obj: any) => obj,
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		bgYellow: (obj: any) => obj,
		hex: (str: string) => `hex(${str})`,
		bgHex: (str: string) => `bgHex(${str})`,
	},
}));
vi.mock('cli-cursor');
vi.mock('figlet');
vi.mock('is-unicode-supported');
vi.mock('slice-ansi', () => ({
	default: (text: string) => text,
}));
vi.mock('strip-ansi', () => ({
	// biome-ignore lint/suspicious/noControlCharactersInRegex: <explanation>
	default: (str: string) => str.replace(/\u001b\[.*?m/g, ''),
}));
vi.mock('wrap-ansi', () => ({
	default: (text: string) => text,
}));
vi.mock('./colors.js', () => ({
	StudioCMSColorway: {
		bold: (str: string) => `StudioCMSColorway.bold(${str})`,
	},
	StudioCMSColorwayBg: (str: string) => `StudioCMSColorwayBg(${str})`,
	supportsColor: true,
}));

describe('CLI Utils Functions', () => {
	describe('action', () => {
		test('should handle ctrl keys correctly', () => {
			const ctrlA: Key = { ctrl: true, name: 'a', sequence: '' };
			const ctrlC: Key = { ctrl: true, name: 'c', sequence: '' };
			const ctrlD: Key = { ctrl: true, name: 'd', sequence: '' };
			const ctrlE: Key = { ctrl: true, name: 'e', sequence: '' };
			const ctrlG: Key = { ctrl: true, name: 'g', sequence: '' };

			expect(action(ctrlA, false)).toBe('first');
			expect(action(ctrlC, false)).toBe('abort');
			expect(action(ctrlD, false)).toBe('abort');
			expect(action(ctrlE, false)).toBe('last');
			expect(action(ctrlG, false)).toBe('reset');
		});

		test('should handle select-specific keys correctly', () => {
			const j: Key = { name: 'j', sequence: '' };
			const k: Key = { name: 'k', sequence: '' };
			const ctrlN: Key = { ctrl: true, name: 'n', sequence: '' };
			const ctrlP: Key = { ctrl: true, name: 'p', sequence: '' };

			expect(action(j, true)).toBe('down');
			expect(action(k, true)).toBe('up');
			expect(action(ctrlN, true)).toBe('down');
			expect(action(ctrlP, true)).toBe('up');

			// Should not handle these keys in non-select mode
			expect(action(j, false)).toBe(false);
			expect(action(k, false)).toBe(false);
			expect(action(ctrlN, false)).toBe(false);
			expect(action(ctrlP, false)).toBe(false);
		});

		test('should handle navigation keys correctly', () => {
			const returnKey: Key = { name: 'return', sequence: '' };
			const enter: Key = { name: 'enter', sequence: '' };
			const backspace: Key = { name: 'backspace', sequence: '' };
			const deleteKey: Key = { name: 'delete', sequence: '' };
			const abort: Key = { name: 'abort', sequence: '' };
			// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
			const escape: Key = { name: 'escape', sequence: '' };
			const tab: Key = { name: 'tab', sequence: '' };
			const pagedown: Key = { name: 'pagedown', sequence: '' };
			const pageup: Key = { name: 'pageup', sequence: '' };
			const home: Key = { name: 'home', sequence: '' };
			const end: Key = { name: 'end', sequence: '' };
			const up: Key = { name: 'up', sequence: '' };
			const down: Key = { name: 'down', sequence: '' };
			const right: Key = { name: 'right', sequence: '' };
			const left: Key = { name: 'left', sequence: '' };

			expect(action(returnKey, false)).toBe('submit');
			expect(action(enter, false)).toBe('submit');
			expect(action(backspace, false)).toBe('delete');
			expect(action(deleteKey, false)).toBe('deleteForward');
			expect(action(abort, false)).toBe('abort');
			expect(action(escape, false)).toBe('exit');
			expect(action(tab, false)).toBe('next');
			expect(action(pagedown, false)).toBe('nextPage');
			expect(action(pageup, false)).toBe('prevPage');
			expect(action(home, false)).toBe('home');
			expect(action(end, false)).toBe('end');
			expect(action(up, false)).toBe('up');
			expect(action(down, false)).toBe('down');
			expect(action(right, false)).toBe('right');
			expect(action(left, false)).toBe('left');
		});

		test('should ignore meta keys except escape', () => {
			const metaA: Key = { meta: true, name: 'a', sequence: '' };
			const metaEscape: Key = { meta: true, name: 'escape', sequence: '' };

			expect(action(metaA, false)).toBeUndefined();
			expect(action(metaEscape, false)).toBe('exit');
		});

		test('should return false for unknown keys', () => {
			const unknown: Key = { name: 'unknown', sequence: '' };
			expect(action(unknown, false)).toBe(false);
		});
	});

	describe('boxen', () => {
		beforeEach(() => {
			// Mock process.stdout
			vi.stubGlobal('process', {
				...process,
				stdout: { columns: 100 },
			});
		});

		test('should create box with header, body and footer', () => {
			const result = boxen(
				'Header',
				{ ln0: 'Line 0', ln1: 'Line 1', ln2: 'Line 2', ln3: 'Line 3' },
				'Footer'
			);

			// Since we've mocked _boxen, we're just checking that our function
			// processes the inputs correctly before passing to _boxen
			expect(result).toContain('Header');
			expect(result).toContain('Line 0');
			expect(result).toContain('Line 1');
			expect(result).toContain('Line 2');
			expect(result).toContain('Line 3');
			expect(result).toContain('Footer');
		});

		test('should handle small terminal width', () => {
			vi.stubGlobal('process', {
				...process,
				stdout: { columns: 60 },
			});

			const result = boxen('Header', { ln0: 'Line 0' }, 'Footer');

			expect(result).toContain('Header');
			expect(result).toContain('Line 0');
			expect(result).toContain('Footer');
		});
	});

	describe('createClackMessageUpdate', () => {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		let mockStream: any;

		beforeEach(() => {
			mockStream = {
				write: vi.fn(),
				rows: 24,
				columns: 80,
			};

			vi.mocked(ansiEscapes.eraseLines).mockReturnValue('ERASE_LINES');
			vi.mocked(cliCursor.hide).mockImplementation(() => {});
			vi.mocked(cliCursor.show).mockImplementation(() => {});
		});

		test('should render message and hide cursor', () => {
			const update = createClackMessageUpdate(mockStream);
			update('Test message');

			expect(cliCursor.hide).toHaveBeenCalled();
			expect(mockStream.write).toHaveBeenCalledWith(expect.stringContaining('Test message'));
		});

		test('should not re-render if message and width are unchanged', () => {
			const update = createClackMessageUpdate(mockStream);
			update('Test message');
			mockStream.write.mockClear();

			update('Test message');
			expect(mockStream.write).not.toHaveBeenCalled();
		});

		test('should re-render if message changes', () => {
			const update = createClackMessageUpdate(mockStream);
			update('Test message');
			mockStream.write.mockClear();

			update('New message');
			expect(mockStream.write).toHaveBeenCalled();
		});

		test('should re-render if width changes', () => {
			const update = createClackMessageUpdate(mockStream);
			update('Test message');
			mockStream.write.mockClear();

			mockStream.columns = 100;
			update('Test message');
			expect(mockStream.write).toHaveBeenCalled();
		});

		test('should clear previous output', () => {
			const update = createClackMessageUpdate(mockStream);
			update('Test message');
			mockStream.write.mockClear();

			update.clear();
			expect(mockStream.write).toHaveBeenCalledWith('ERASE_LINES');
		});

		test('should show cursor when done', () => {
			const update = createClackMessageUpdate(mockStream);
			update('Test message');
			vi.mocked(cliCursor.show).mockClear();

			update.done();
			expect(cliCursor.show).toHaveBeenCalled();
		});
	});

	describe('randomBetween', () => {
		beforeEach(() => {
			vi.spyOn(Math, 'random').mockReturnValue(0.5);
		});

		afterEach(() => {
			vi.restoreAllMocks();
		});

		test('should return a number between min and max (inclusive)', () => {
			expect(randomBetween(10, 20)).toBe(15);
			expect(randomBetween(0, 100)).toBe(50);
			expect(randomBetween(-10, 10)).toBe(0);
		});
	});

	describe('random', () => {
		beforeEach(() => {
			vi.spyOn(Math, 'random').mockReturnValue(0.5);
		});

		afterEach(() => {
			vi.restoreAllMocks();
		});

		test('should return a random item from the array', () => {
			expect(random('a', 'b', 'c')).toBe('b');
			expect(random([1, 2, 3])).toBe(2);
		});

		test('should flatten nested arrays one level', () => {
			expect(random(['a', 'b'], ['c', 'd'])).toBe('c');
		});
	});

	describe('send', () => {
		test('should write message to stdout', () => {
			const mockWrite = vi.fn();
			vi.stubGlobal('process', {
				...process,
				stdout: { write: mockWrite },
			});

			send('Test message');
			expect(mockWrite).toHaveBeenCalledWith('Test message\n');
		});
	});

	describe('cancelled', () => {
		test('should format cancellation message without tip', () => {
			const result = cancelled('Operation cancelled');
			const stripped = stripAnsi(result);

			expect(stripped).toContain('cancelled');
			expect(stripped).toContain('Operation cancelled');
			expect(stripped).not.toContain('▶');
		});

		test('should format cancellation message with tip', () => {
			const result = cancelled('Operation cancelled', 'Try again later');
			const stripped = stripAnsi(result);

			expect(stripped).toContain('cancelled');
			expect(stripped).toContain('Operation cancelled');
			expect(stripped).toContain('▶ Try again later');
		});
	});

	describe('success', () => {
		test('should format success message without tip', () => {
			const result = success('Operation completed');
			const stripped = stripAnsi(result);

			expect(stripped).toContain('success');
			expect(stripped).toContain('Operation completed');
			expect(stripped).not.toContain('▶');
		});

		test('should format success message with tip', () => {
			const result = success('Operation completed', 'Next steps...');
			const stripped = stripAnsi(result);

			expect(stripped).toContain('success');
			expect(stripped).toContain('Operation completed');
			expect(stripped).toContain('▶ Next steps...');
		});
	});

	describe('askToContinue', () => {
		test('should return true when user confirms', async () => {
			const mockPrompts = {
				confirm: vi.fn().mockResolvedValue(true),
				isCancel: vi.fn().mockReturnValue(false),
			};

			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			const result = await askToContinue(mockPrompts as any);

			expect(result).toBe(true);
			expect(mockPrompts.confirm).toHaveBeenCalledWith({
				message: 'Continue?',
				initialValue: true,
			});
		});

		test('should return false when user cancels', async () => {
			const mockPrompts = {
				confirm: vi.fn().mockResolvedValue(Symbol('cancel')),
				isCancel: vi.fn().mockReturnValue(true),
			};

			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			const result = await askToContinue(mockPrompts as any);

			expect(result).toBe(false);
		});

		test('should return false when user declines', async () => {
			const mockPrompts = {
				confirm: vi.fn().mockResolvedValue(false),
				isCancel: vi.fn().mockReturnValue(false),
			};

			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			const result = await askToContinue(mockPrompts as any);

			expect(result).toBe(false);
		});
	});
});
