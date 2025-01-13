import chalk from "chalk";
import { dt } from "./utils.js";

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