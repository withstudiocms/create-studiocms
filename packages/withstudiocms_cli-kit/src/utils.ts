import buffer from 'node:buffer';
import {
	type ChildProcess,
	type SpawnOptions,
	type StdioOptions,
	exec as _exec,
	spawn,
	spawnSync,
} from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { Readable } from 'node:stream';
import { text as textFromStream } from 'node:stream/consumers';
import { fileURLToPath } from 'node:url';
import type * as p from '@clack/prompts';
import { NonZeroExitError, type Options, x } from 'tinyexec';

interface ExecError extends Error {
	stderr?: string;
	stdout?: string;
}

export interface ExecaOptions {
	cwd?: string | URL;
	stdio?: StdioOptions;
	timeout?: number;
}
export interface Output {
	stdout: string;
	stderr: string;
	exitCode: number;
}
const text = (stream: NodeJS.ReadableStream | Readable | null) =>
	stream ? textFromStream(stream).then((t) => t.trimEnd()) : '';

export async function shell(
	command: string,
	flags: string[],
	opts: ExecaOptions = {}
): Promise<Output> {
	let child: ChildProcess;
	let stdout = '';
	let stderr = '';
	try {
		child = spawn(command, flags, {
			cwd: opts.cwd,
			shell: true,
			stdio: opts.stdio,
			timeout: opts.timeout,
		});
		const done = new Promise((resolve) => child.on('close', resolve));
		[stdout, stderr] = await Promise.all([text(child.stdout), text(child.stderr)]);
		await done;
	} catch {
		throw { stdout, stderr, exitCode: 1 };
	}
	const { exitCode } = child;
	if (exitCode === null) {
		throw new Error('Timeout');
	}
	if (exitCode !== 0) {
		throw new Error(stderr);
	}
	return { stdout, stderr, exitCode };
}

/**
 * Improve tinyexec error logging and set `throwOnError` to `true` by default
 */
export function exec(command: string, args?: string[], options?: Partial<Options>) {
	return x(command, args, {
		throwOnError: true,
		...options,
	}).then(
		(o) => o,
		(e) => {
			if (e instanceof NonZeroExitError) {
				const fullCommand = args?.length
					? `${command} ${args.map((a) => (a.includes(' ') ? `"${a}"` : a)).join(' ')}`
					: command;
				const message = `The command \`${fullCommand}\` exited with code ${e.exitCode}`;
				const newError = new Error(message, e.cause ? { cause: e.cause } : undefined);
				(newError as ExecError).stderr = e.output?.stderr;
				(newError as ExecError).stdout = e.output?.stdout;
				throw newError;
			}
			throw e;
		}
	);
}

/**
 * Check if a command exists on the system.
 * @param command The command to check.
 * @returns A boolean indicating if the command exists.
 */
export function commandExists(command: string): boolean {
	const result = spawnSync(command, ['--version'], {
		stdio: 'ignore',
		shell: true,
	});
	return result.status === 0;
}

// // Example usage
// const command = 'turso';

// if (commandExists(command)) {
//   console.log(`${command} exists on the system.`);
// } else {
//   console.log(`${command} does not exist on the system.`);
// }

/**
 * Run a shell command.
 * @param command The full shell command to execute.
 * @returns A Promise that resolves with the command's output or rejects with an error.
 */
export function runShellCommand(command: string): Promise<string> {
	return new Promise((resolve, reject) => {
		_exec(command, (error, stdout, stderr) => {
			if (error) {
				reject(new Error(`Error: ${error.message}\n${stderr}`));
				return;
			}
			resolve(stdout);
		});
	});
}

// // Example usage
// (async () => {
//     try {
//       const output = await runShellCommand('curl -sSfL https://get.tur.so/install.sh | bash');
//       console.log(`Command output: ${output}`);
//     } catch (error) {
//       console.error(`Failed to run command: ${(error as Error).message}`);
//     }
//   })();

/**
 * Run a shell command interactively.
 * @param command The shell command to execute.
 * @param options Optional spawn options.
 * @returns A Promise that resolves when the command completes or rejects on error.
 */
export function runInteractiveCommand(
	command: string,
	options: SpawnOptions = { shell: true, stdio: 'inherit' }
): Promise<void> {
	return new Promise((resolve, reject) => {
		const process = spawn(command, [], options);

		process.on('close', (code: number) => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`Command exited with code ${code}`));
			}
		});

		process.on('error', (error) => {
			reject(error);
		});
	});
}

// // Example usage
// (async () => {
// 	try {
// 		await runInteractiveCommand('curl -sSfL https://get.tur.so/install.sh | bash');
// 		console.log('Command completed successfully.');
// 	} catch (error) {
// 		console.error(`Failed to run command: ${(error as Error).message}`);
// 	}
// })();

export default function pathUtil(importMetaUrl: string) {
	const filename = fileURLToPath(importMetaUrl);
	const dirname = path.dirname(filename);

	return {
		filename,
		dirname,
		getRelPath: (...url: string[]) => path.join(dirname, ...url),
	};
}

/**
 * StudioCMS aims to compatible with web standards as much as possible.
 * This function adds two objects that are globally-available on most javascript runtimes but not on node 18.
 */
export function applyPolyfill() {
	// Remove when Node 18 is dropped for Node 20
	if (!globalThis.crypto) {
		Object.defineProperty(globalThis, 'crypto', {
			value: crypto.webcrypto,
		});
	}

	// Remove when Node 18 is dropped for Node 20
	if (!globalThis.File) {
		Object.defineProperty(globalThis, 'File', {
			value: buffer.File,
		});
	}
}

export function resolveRoot(cwd?: string | URL): string {
	let localCwd = cwd;
	if (localCwd instanceof URL) {
		localCwd = fileURLToPath(localCwd);
	}
	return localCwd ? path.resolve(localCwd) : process.cwd();
}

export function exists(path: URL | string | undefined) {
	if (!path) return false;
	try {
		fs.statSync(path);
		return true;
	} catch {
		return false;
	}
}

const isWindows = process?.platform === 'win32';

function slash(path: string) {
	const isExtendedLengthPath = path.startsWith('\\\\?\\');

	if (isExtendedLengthPath) {
		return path;
	}

	return path.replace(/\\/g, '/');
}

export function pathToFileURL(path: string): URL {
	if (isWindows) {
		let slashed = slash(path);
		// Windows like C:/foo/bar
		if (!slashed.startsWith('/')) {
			slashed = `/${slashed}`;
		}
		return new URL(`file://${slashed}`);
	}

	// Unix is easy
	return new URL(`file://${path}`);
}

export function appendForwardSlash(path: string) {
	return path.endsWith('/') ? path : `${path}/`;
}

export function checkRequiredEnvVars(prompts: typeof p, envVars: string[]) {
	for (const varName of envVars) {
		if (!process.env[varName]) {
			prompts.log.error(`${varName} is a required environment variable when using this utility.`);
			process.exit(1);
		}
	}
}

// biome-ignore lint/suspicious/noExplicitAny: An Array of any type is allowed
export function exitIfEmptyTasks(items: any[], label: string, prompts: typeof p) {
	if (items.length !== 0) return;
	prompts.log.warn(`No ${label} selected, exiting...`);
	process.exit(0);
}
