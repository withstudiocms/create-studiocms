import color from 'chalk';
import { supportsColor } from './colors.js';
import { date, send } from './messages.js';

export interface Logger {
	log: (message: string) => void;
	debug: (message: string) => void;
	error: (message: string) => void;
	warn: (message: string) => void;
}

export const buildLogger = (isDebug: boolean) => ({
	log: (message: string) => {
		if (!supportsColor) {
			send(`[${date}]: ${message}`);
			return;
		}
		send(`${color.blue.bold(`[${date}]:`)} ${message}`);
	},
	debug: (message: string) => {
		if (!isDebug) return;
		if (!supportsColor) {
			send(`DEBUG [${date}]: ${message}`);
			return;
		}
		send(`${color.blue.bold(`DEBUG [${date}]:`)} ${message}`);
	},
	error: (message: string) => {
		if (!supportsColor) {
			send(`ERROR [${date}]: ${message}`);
			return;
		}
		send(`${color.red.bold(`ERROR [${date}]:`)} ${color.red(message)}`);
	},
	warn: (message: string) => {
		if (!supportsColor) {
			send(`WARN [${date}]: ${message}`);
			return;
		}
		send(`${color.yellow.bold(`WARN [${date}]:`)} ${color.yellow(message)}`);
	},
});
