import { Command as _Command, Help as _Help } from '@commander-js/extra-typings';
import { type ChalkInstance, chalkStderr as chalkStdErr, default as chalkStdOut } from 'chalk';
import stripAnsi from 'strip-ansi';
import wrapAnsi from 'wrap-ansi';

export class Help extends _Help {
	chalk: ChalkInstance;
	colorway: ChalkInstance;

	constructor() {
		super();
		this.chalk = chalkStdOut;
		this.colorway = this.chalk.hex('#a581f3');
	}

	prepareContext(contextOptions: {
		error?: boolean;
		helpWidth?: number;
		outputHasColors?: boolean;
	}) {
		super.prepareContext(contextOptions);
		if (contextOptions?.error) {
			this.chalk = chalkStdErr;
		}
	}

	displayWidth(str: string) {
		return stripAnsi(str).length; // use imported package
	}

	boxWrap(str: string, width: number) {
		return wrapAnsi(str, width, { hard: true }); // use imported package
	}

	styleTitle(str: string) {
		return this.chalk.bold(str);
	}
	styleCommandText(str: string) {
		return this.chalk.cyan(str);
	}
	styleCommandDescription(str: string) {
		return this.chalk.magenta(str);
	}
	styleDescriptionText(str: string) {
		return this.chalk.italic(str);
	}
	styleOptionText(str: string) {
		return this.chalk.green(str);
	}
	styleArgumentText(str: string) {
		return this.chalk.yellow(str);
	}
	styleSubcommandText(str: string) {
		return this.colorway(str);
	}
}

export class Command extends _Command {
	createCommand(name: string | undefined) {
		return new Command(name);
	}
	createHelp() {
		return Object.assign(new Help(), this.configureHelp());
	}
}

export type newInstanceCommand = InstanceType<typeof Command>;

export type instanceCommand = InstanceType<typeof _Command>;

export function subCommandOptions({ options }: instanceCommand) {
	if (!options.length) {
		return '';
	}
	return `\n${options
		.map(
			({ flags, description }) =>
				`${chalkStdOut.hidden('..')}${chalkStdOut.reset.green(flags)} ― ${chalkStdOut.italic(description)}`
		)
		.join('\n')}`;
}
