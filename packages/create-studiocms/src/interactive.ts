import { MyCommand } from "./commander.js";
import { logger } from "./logger.js";

export async function interactive() {
    const interactive = new MyCommand('interactive');

    interactive
        .description('Interactive CLI Toolkit.')
        .action(() => {
            logger.log('Starting interactive CLI...');
        });

    return interactive;
}