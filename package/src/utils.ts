import chalk from 'chalk';
import figlet from 'figlet';

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

export const CLITitle = supportsColor ? StudioCMSColorway.bold(`${ASCIIText}\n`) : `${ASCIIText}\n`;

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
