import { EventEmitter } from 'node:events';
import * as fs from 'node:fs';
import { Readable } from 'node:stream';
import { URL } from 'node:url';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
	appendForwardSlash,
	applyPolyfill,
	checkRequiredEnvVars,
	exists,
	exitIfEmptyTasks,
	pathToFileURL,
	pathUtil,
	resolveRoot,
} from '../src/utils.js'; // Adjust the import path based on your project structure

// Mock dependencies
vi.mock('node:fs');
vi.mock('node:child_process');
vi.mock('node:crypto');
vi.mock('node:buffer');
vi.mock('@clack/prompts');

// Helper to create a mock readable stream
function createMockStream(content: string): Readable {
	const stream = new Readable();
	stream.push(content);
	stream.push(null);
	return stream;
}

// Mock child process
class MockChildProcess extends EventEmitter {
	stdout: Readable | null = null;
	stderr: Readable | null = null;
	exitCode: number | null = 0;

	constructor(stdout = '', stderr = '', exitCode = 0) {
		super();
		this.stdout = createMockStream(stdout);
		this.stderr = createMockStream(stderr);
		this.exitCode = exitCode;
	}

	close(code: number) {
		this.emit('close', code);
	}
}

describe('Utils Functions', () => {
	describe('pathUtil', () => {
		test('should return correct file paths', () => {
			const mockUrl = 'file:///path/to/current/file.js';
			const path = require('node:path');
			path.dirname = vi.fn().mockReturnValue('/path/to/current');
			path.join = vi.fn().mockImplementation((...args) => args.join('/'));

			const utils = pathUtil(mockUrl);

			expect(utils.filename).toBe('/path/to/current/file.js');
			expect(utils.dirname).toBe('/path/to/current');
			expect(utils.getRelPath('subdir', 'file.txt')).toBe('/path/to/current/subdir/file.txt');
		});
	});

	describe('applyPolyfill', () => {
		const originalCrypto = globalThis.crypto;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const originalFile = (globalThis as any).File;

		beforeEach(() => {
			// biome-ignore lint/performance/noDelete: <explanation>
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			delete (globalThis as any).crypto;
			// biome-ignore lint/performance/noDelete: <explanation>
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			delete (globalThis as any).File;
		});

		afterEach(() => {
			if (originalCrypto) {
				globalThis.crypto = originalCrypto;
			} else {
				// biome-ignore lint/performance/noDelete: <explanation>
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				delete (globalThis as any).crypto;
			}

			if (originalFile) {
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				(globalThis as any).File = originalFile;
			} else {
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				// biome-ignore lint/performance/noDelete: <explanation>
				delete (globalThis as any).File;
			}
		});

		test('should not override existing globals', () => {
			// @ts-ignore
			globalThis.crypto = 'existing crypto';
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			(globalThis as any).File = 'existing File';

			applyPolyfill();

			expect(globalThis.crypto).toBe('existing crypto');
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			expect((globalThis as any).File).toBe('existing File');
		});
	});

	describe('resolveRoot', () => {
		const originalCwd = process.cwd;

		beforeEach(() => {
			process.cwd = vi.fn().mockReturnValue('/default/cwd');
		});

		afterEach(() => {
			process.cwd = originalCwd;
		});

		test('should resolve path from string', () => {
			const path = require('node:path');
			path.resolve = vi.fn().mockImplementation((dir) => `/resolved/${dir}`);

			expect(resolveRoot('/some/path')).toBe('/resolved//some/path');
		});

		test('should resolve path from URL', () => {
			const path = require('node:path');
			path.resolve = vi.fn().mockImplementation((dir) => `/resolved/${dir}`);

			expect(resolveRoot(new URL('file:///some/path'))).toBe('/resolved//some/path');
		});

		test('should use process.cwd() when no path provided', () => {
			const path = require('node:path');
			path.resolve = vi.fn().mockImplementation((dir) => `/resolved/${dir}`);

			expect(resolveRoot()).toBe('/default/cwd');
			expect(process.cwd).toHaveBeenCalled();
		});
	});

	describe('exists', () => {
		test('should return true when path exists', () => {
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			vi.mocked(fs.statSync).mockImplementation(() => ({ isFile: () => true }) as any);

			expect(exists('/existing/path')).toBe(true);
			expect(fs.statSync).toHaveBeenCalledWith('/existing/path');
		});

		test('should return false when path does not exist', () => {
			vi.mocked(fs.statSync).mockImplementation(() => {
				throw new Error('ENOENT');
			});

			expect(exists('/non-existing/path')).toBe(false);
		});

		test('should return false when path is undefined', () => {
			expect(exists(undefined)).toBe(false);
		});
	});

	describe('pathToFileURL', () => {
		let originalPlatform: string;

		beforeEach(() => {
			originalPlatform = process.platform;
		});

		afterEach(() => {
			Object.defineProperty(process, 'platform', { value: originalPlatform });
		});

		test('should convert Windows path to file URL', () => {
			Object.defineProperty(process, 'platform', { value: 'win32' });

			const url = pathToFileURL('C:\\folder\\file.txt');

			expect(url.href).toBe('file:///C:/folder/file.txt');
		});

		test('should convert Unix path to file URL', () => {
			Object.defineProperty(process, 'platform', { value: 'linux' });

			const url = pathToFileURL('/folder/file.txt');

			expect(url.href).toBe('file:///folder/file.txt');
		});
	});

	describe('appendForwardSlash', () => {
		test('should add slash when missing', () => {
			expect(appendForwardSlash('/path')).toBe('/path/');
		});

		test('should not add slash when already present', () => {
			expect(appendForwardSlash('/path/')).toBe('/path/');
		});
	});

	describe('checkRequiredEnvVars', () => {
		const originalEnv = process.env;
		const originalExit = process.exit;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		let exitMock: any;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		let promptsMock: any;

		beforeEach(() => {
			process.env = { EXISTING_VAR: 'exists' };
			exitMock = vi.fn();
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			process.exit = exitMock as any;

			promptsMock = {
				log: {
					error: vi.fn(),
				},
			};
		});

		afterEach(() => {
			process.env = originalEnv;
			process.exit = originalExit;
		});

		test('should not exit when all required vars exist', () => {
			checkRequiredEnvVars(promptsMock, ['EXISTING_VAR']);

			expect(promptsMock.log.error).not.toHaveBeenCalled();
			expect(exitMock).not.toHaveBeenCalled();
		});

		test('should exit when required var is missing', () => {
			checkRequiredEnvVars(promptsMock, ['MISSING_VAR']);

			expect(promptsMock.log.error).toHaveBeenCalledWith(
				'MISSING_VAR is a required environment variable when using this utility.'
			);
			expect(exitMock).toHaveBeenCalledWith(1);
		});
	});

	describe('exitIfEmptyTasks', () => {
		const originalExit = process.exit;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		let exitMock: any;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		let promptsMock: any;

		beforeEach(() => {
			exitMock = vi.fn();
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			process.exit = exitMock as any;

			promptsMock = {
				log: {
					warn: vi.fn(),
				},
			};
		});

		afterEach(() => {
			process.exit = originalExit;
		});

		test('should not exit when list has items', () => {
			exitIfEmptyTasks([1, 2, 3], 'tasks', promptsMock);

			expect(promptsMock.log.warn).not.toHaveBeenCalled();
			expect(exitMock).not.toHaveBeenCalled();
		});

		test('should exit when list is empty', () => {
			exitIfEmptyTasks([], 'tasks', promptsMock);

			expect(promptsMock.log.warn).toHaveBeenCalledWith('No tasks selected, exiting...');
			expect(exitMock).toHaveBeenCalledWith(0);
		});
	});
});
