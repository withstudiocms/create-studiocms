import chalk from 'chalk';
import figlet from 'figlet';

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

export const ASCIIText = figlet.textSync('StudioCMS');
export const ASCIIAbbr = figlet.textSync('SCMS');

export const CLITitle = supportsColor ? StudioCMSColorway.bold(`${ASCIIText}\n`) : `${ASCIIText}\n`;

export const logger = {
	log: (message: string) => {
		if (!supportsColor) {
			console.log(`[${date}]: ${message}`);
			return;
		}
		console.log(`${chalk.blue.bold(`[${date}]:`)} ${message}`);
	},
	error: (message: string) => {
		if (!supportsColor) {
			console.error(`ERROR [${date}]: ${message}`);
			return;
		}
		console.error(`${chalk.red.bold(`ERROR [${date}]:`)} ${chalk.red(message)}`);
	},
	warn: (message: string) => {
		if (!supportsColor) {
			console.warn(`WARN [${date}]: ${message}`);
			return;
		}
		console.warn(`${chalk.yellow.bold(`WARN [${date}]:`)} ${chalk.yellow(message)}`);
	},
};
