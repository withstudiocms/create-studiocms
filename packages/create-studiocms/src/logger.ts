import chalk from "chalk";

const dt = new Intl.DateTimeFormat('en-us', {
	hour: '2-digit',
	minute: '2-digit',
});

const date = dt.format(new Date());

export const logger = {
    log: (message: string) => {
        console.log(
            `${chalk.blue.bold(`[${date}]:`)} ${message}`
        );
    },
    error: (message: string) => {
        console.error(
            `${chalk.red.bold(`ERROR [${date}]:`)} ${chalk.red(message)}`
        );
    },
    warn: (message: string) => {
        console.warn(
            `${chalk.yellow.bold(`WARN [${date}]:`)} ${chalk.yellow(message)}`
        );
    },
}