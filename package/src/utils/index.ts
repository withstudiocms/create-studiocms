import { type SpawnOptions, exec, spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { Option } from '@commander-js/extra-typings';
import chalk from 'chalk';
import figlet from 'figlet';

export const termPrefix = process.stdout.columns < 80 ? ' ' : ' '.repeat(2);

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
		exec(command, (error, stdout, stderr) => {
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

export const ASCIIText = figlet.textSync('StudioCMS');

export const dt = new Intl.DateTimeFormat('en-us', {
	hour: '2-digit',
	minute: '2-digit',
});

export const date = dt.format(new Date());

export const supportsColor = chalk.level > 0;

export const StudioCMSColorway = chalk.hex('#a581f3');
export const StudioCMSColorwayBg = chalk.bgHex('#a581f3');
export const StudioCMSColorwayInfo = chalk.hex('#22c55e');
export const StudioCMSColorwayInfoBg = chalk.bgHex('#22c55e');
export const StudioCMSColorwayWarn = chalk.hex('#facc14');
export const StudioCMSColorwayWarnBg = chalk.bgHex('#facc14');
export const StudioCMSColorwayError = chalk.hex('#bd0249');
export const StudioCMSColorwayErrorBg = chalk.bgHex('#bd0249');

export const ChalkColorOption = new Option(
	'--color',
	'Force color output'
); /* implemented by chalk */
export const ChalkColorOptionNo = new Option(
	'--no-color',
	'Disable color output'
); /* implemented by chalk */

export const TursoColorway = chalk.bgHex('#4ff8d2');

export const CLITitle = supportsColor ? StudioCMSColorway.bold(`${ASCIIText}\n`) : `${ASCIIText}\n`;

export function exists(path: string | URL | undefined) {
	if (!path) return false;
	try {
		fs.statSync(path);
		return true;
	} catch {
		return false;
	}
}

const send = (message: string) => process.stdout.write(`${message}\n`);

export const logger = {
	log: (message: string) => {
		if (!supportsColor) {
			send(`[${date}]: ${message}`);
			return;
		}
		send(`${chalk.blue.bold(`[${date}]:`)} ${message}`);
	},
	debug: (message: string) => {
		if (!supportsColor) {
			send(`DEBUG [${date}]: ${message}`);
			return;
		}
		send(`${chalk.blue.bold(`DEBUG [${date}]:`)} ${message}`);
	},
	error: (message: string) => {
		if (!supportsColor) {
			send(`ERROR [${date}]: ${message}`);
			return;
		}
		send(`${chalk.red.bold(`ERROR [${date}]:`)} ${chalk.red(message)}`);
	},
	warn: (message: string) => {
		if (!supportsColor) {
			send(`WARN [${date}]: ${message}`);
			return;
		}
		send(`${chalk.yellow.bold(`WARN [${date}]:`)} ${chalk.yellow(message)}`);
	},
};
