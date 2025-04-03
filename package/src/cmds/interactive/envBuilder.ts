import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import color from 'chalk';
import {
	StudioCMSColorwayError,
	StudioCMSColorwayInfo,
	StudioCMSColorwayWarnBg,
	TursoColorway,
	commandExists,
	exists,
	runInteractiveCommand,
	runShellCommand,
} from '../../utils/index.js';
import { label } from '../../utils/messages.js';
import type { Context } from './context.js';
import { ExampleEnv, buildEnvFile } from './data/studiocmsenv.js';

interface GenericOAuth {
	clientId: string;
	clientSecret: string;
	redirectUri: string;
}

interface Auth0OAuth extends GenericOAuth {
	domain: string;
}

export interface EnvBuilderOptions {
	astroDbRemoteUrl?: string;
	astroDbToken?: string;
	encryptionKey?: string;
	oAuthOptions?: ('github' | 'discord' | 'google' | 'auth0')[];
	githubOAuth?: GenericOAuth;
	discordOAuth?: GenericOAuth;
	googleOAuth?: GenericOAuth;
	auth0OAuth?: Auth0OAuth;
}

export async function env(
	ctx: Pick<
		Context,
		| 'cwd'
		| 'yes'
		| 'prompt'
		| 'promptCancel'
		| 'promptOnCancel'
		| 'dryRun'
		| 'tasks'
		| 'exit'
		| 'isStudioCMSProject'
		| 'debug'
		| 'logger'
	>
) {
	ctx.debug && ctx.logger.debug('Running env...');
	if (!ctx.isStudioCMSProject) {
		ctx.debug &&
			ctx.logger.debug(
				StudioCMSColorwayInfo('Not a StudioCMS project, skipping environment file creation')
			);
		return;
	}

	let _env = ctx.yes;
	let envFileContent: string;

	const envExists = exists(path.join(ctx.cwd, '.env'));

	ctx.debug && ctx.logger.debug(`Environment file exists: ${envExists}`);

	if (envExists) {
		ctx.prompt.log.warn(
			`${label('Warning', StudioCMSColorwayWarnBg, color.black)} An environment file already exists. Would you like to overwrite it?`
		);

		const check = await ctx.prompt.confirm({
			message: 'Confirm Overwrite',
		});

		if (typeof check === 'symbol') {
			ctx.promptCancel(check);
		} else {
			ctx.debug && ctx.logger.debug(`Environment file overwrite selected: ${check}`);
			if (!check) {
				return;
			}
		}
	}

	if (_env) {
		ctx.prompt.log.info(StudioCMSColorwayInfo('Setting up basic environment file'));
	} else {
		const EnvPrompt = await ctx.prompt.select({
			message: 'What kind of environment file would you like to create?',
			options: [
				{ value: 'builder', label: 'Use Interactive .env Builder' },
				{ value: 'example', label: 'Use the Example .env file' },
				{ value: 'none', label: 'Skip Environment File Creation' },
			],
		});

		if (typeof EnvPrompt === 'symbol') {
			ctx.promptCancel(EnvPrompt);
		} else {
			ctx.debug && ctx.logger.debug(`Environment file type selected: ${EnvPrompt}`);

			_env = EnvPrompt !== 'none';
		}

		if (EnvPrompt === 'example') {
			envFileContent = ExampleEnv;
		} else if (EnvPrompt === 'builder') {
			let envBuilderOpts: EnvBuilderOptions = {};

			const isWindows = os.platform() === 'win32';

			if (isWindows) {
				ctx.prompt.log.warn(
					`${label('Warning', StudioCMSColorwayWarnBg, color.black)} Turso DB CLI is not supported on Windows outside of WSL.`
				);
			}

			let tursoDB: symbol | 'yes' | 'no' = 'no';

			if (!isWindows) {
				tursoDB = await ctx.prompt.select({
					message: 'Would you like us to setup a new Turso DB for you? (Runs `turso db create`)',
					options: [
						{ value: 'yes', label: 'Yes' },
						{ value: 'no', label: 'No' },
					],
				});
			}

			if (typeof tursoDB === 'symbol') {
				ctx.promptCancel(tursoDB);
			} else {
				ctx.debug && ctx.logger.debug(`AstroDB setup selected: ${tursoDB}`);

				if (tursoDB === 'yes') {
					if (!commandExists('turso')) {
						ctx.prompt.log.error(StudioCMSColorwayError('Turso CLI is not installed.'));

						const installTurso = await ctx.prompt.confirm({
							message: 'Would you like to install Turso CLI now?',
						});

						if (typeof installTurso === 'symbol') {
							ctx.promptCancel(installTurso);
						} else {
							if (installTurso) {
								try {
									await runInteractiveCommand('curl -sSfL https://get.tur.so/install.sh | bash');
									console.log('Command completed successfully.');
								} catch (error) {
									console.error(`Failed to run Turso install: ${(error as Error).message}`);
								}
							} else {
								ctx.prompt.log.warn(
									`${label('Warning', StudioCMSColorwayWarnBg, color.black)} You will need to setup your own AstroDB and provide the URL and Token.`
								);
							}
						}
					}

					try {
						const res = await runShellCommand('turso auth login --headless');

						if (
							!res.includes('Already signed in as') &&
							!res.includes('Success! Existing JWT still valid')
						) {
							ctx.prompt.log.message(`Please sign in to Turso to continue.\n${res}`);

							const loginToken = await ctx.prompt.text({
								message: 'Enter the login token ( the code within the " " )',
								placeholder: 'eyJhb...tnPnw',
							});

							if (typeof loginToken === 'symbol') {
								ctx.promptCancel(loginToken);
							} else {
								ctx.debug && ctx.logger.debug(`Login token received: ${loginToken}`);

								if (!loginToken) {
									ctx.prompt.log.error(StudioCMSColorwayError('No token provided'));
									process.exit(1);
								}

								const loginRes = await runShellCommand(`turso config set token "${loginToken}"`);

								if (loginRes.includes('Token set succesfully.')) {
									ctx.prompt.log.success('Successfully logged in to Turso.');
								} else {
									ctx.prompt.log.error(StudioCMSColorwayError('Unable to login to Turso.'));
									process.exit(1);
								}
							}
						}
					} catch (error) {
						if (error instanceof Error) {
							ctx.prompt.log.error(StudioCMSColorwayError(`Error: ${error.message}`));
							process.exit(1);
						} else {
							ctx.prompt.log.error(
								StudioCMSColorwayError('Unknown Error: Unable to login to Turso.')
							);
							process.exit(1);
						}
					}

					const customName = await ctx.prompt.confirm({
						message: 'Would you like to provide a custom name for the database?',
						initialValue: false,
					});

					if (typeof customName === 'symbol') {
						ctx.promptCancel(customName);
					} else {
						const dbName = customName
							? await ctx.prompt.text({
									message: 'Enter a custom name for the database',
									initialValue: 'your-database-name',
								})
							: undefined;

						if (typeof dbName === 'symbol') {
							ctx.promptCancel(dbName);
						} else {
							ctx.debug && ctx.logger.debug(`Custom database name: ${dbName}`);

							const tursoSetup = ctx.prompt.spinner();
							tursoSetup.start(
								`${label('Turso', TursoColorway, color.black)} Setting up Turso DB...`
							);
							try {
								tursoSetup.message(
									`${label('Turso', TursoColorway, color.black)} Creating Database...`
								);
								const createRes = await runShellCommand(`turso db create ${dbName ? dbName : ''}`);

								const dbNameMatch = createRes.match(/^Created database (\S+) at group/m);

								const dbFinalName = dbNameMatch ? dbNameMatch[1] : undefined;

								tursoSetup.message(
									`${label('Turso', TursoColorway, color.black)} Retrieving database information...`
								);
								ctx.debug && ctx.logger.debug(`Database name: ${dbFinalName}`);

								const showCMD = `turso db show ${dbFinalName}`;
								const tokenCMD = `turso db tokens create ${dbFinalName}`;

								const showRes = await runShellCommand(showCMD);

								const urlMatch = showRes.match(/^URL:\s+(\S+)/m);

								const dbURL = urlMatch ? urlMatch[1] : undefined;

								ctx.debug && ctx.logger.debug(`Database URL: ${dbURL}`);

								const tokenRes = await runShellCommand(tokenCMD);

								const dbToken = tokenRes.trim();

								ctx.debug && ctx.logger.debug(`Database Token: ${dbToken}`);

								envBuilderOpts.astroDbRemoteUrl = dbURL;
								envBuilderOpts.astroDbToken = dbToken;

								tursoSetup.stop(
									`${label('Turso', TursoColorway, color.black)} Database setup complete. New Database: ${dbFinalName}`
								);
								ctx.prompt.log.message('Database Token and Url saved to environment file.');
							} catch (e) {
								tursoSetup.stop();
								if (e instanceof Error) {
									ctx.prompt.log.error(StudioCMSColorwayError(`Error: ${e.message}`));
									process.exit(1);
								} else {
									ctx.prompt.log.error(
										StudioCMSColorwayError('Unknown Error: Unable to create database.')
									);
									process.exit(1);
								}
							}
						}
					}
				} else {
					ctx.prompt.log.warn(
						`${label('Warning', StudioCMSColorwayWarnBg, color.black)} You will need to setup your own AstroDB and provide the URL and Token.`
					);
					const envBuilderStep_AstroDB = await ctx.prompt.group(
						{
							astroDbRemoteUrl: () =>
								ctx.prompt.text({
									message: 'Remote URL for AstroDB',
									initialValue: 'libsql://your-database.turso.io',
								}),
							astroDbToken: () =>
								ctx.prompt.text({
									message: 'AstroDB Token',
									initialValue: 'your-astrodb-token',
								}),
						},
						{
							onCancel: () => ctx.promptOnCancel(),
						}
					);

					ctx.debug && ctx.logger.debug(`AstroDB setup: ${envBuilderStep_AstroDB}`);

					envBuilderOpts = { ...envBuilderStep_AstroDB };
				}
			}

			const envBuilderStep1 = await ctx.prompt.group(
				{
					encryptionKey: () =>
						ctx.prompt.text({
							message: 'StudioCMS Auth Encryption Key',
							initialValue: crypto.randomBytes(16).toString('base64'),
						}),
					oAuthOptions: () =>
						ctx.prompt.multiselect({
							message: 'Setup OAuth Providers',
							options: [
								{ value: 'github', label: 'GitHub' },
								{ value: 'discord', label: 'Discord' },
								{ value: 'google', label: 'Google' },
								{ value: 'auth0', label: 'Auth0' },
							],
							required: false,
						}),
				},
				{
					// On Cancel callback that wraps the group
					// So if the user cancels one of the prompts in the group this function will be called
					onCancel: () => ctx.promptOnCancel(),
				}
			);

			ctx.debug && ctx.logger.debug(`Environment Builder Step 1: ${envBuilderStep1}`);

			envBuilderOpts = { ...envBuilderStep1 };

			if (envBuilderStep1.oAuthOptions.includes('github')) {
				const githubOAuth = await ctx.prompt.group(
					{
						clientId: () =>
							ctx.prompt.text({
								message: 'GitHub Client ID',
								initialValue: 'your-github-client-id',
							}),
						clientSecret: () =>
							ctx.prompt.text({
								message: 'GitHub Client Secret',
								initialValue: 'your-github-client-secret',
							}),
						redirectUri: () =>
							ctx.prompt.text({
								message: 'GitHub Redirect URI Domain',
								initialValue: 'http://localhost:4321',
							}),
					},
					{
						onCancel: () => ctx.promptOnCancel(),
					}
				);

				ctx.debug && ctx.logger.debug(`GitHub OAuth: ${githubOAuth}`);

				envBuilderOpts.githubOAuth = githubOAuth;
			}

			if (envBuilderStep1.oAuthOptions.includes('discord')) {
				const discordOAuth = await ctx.prompt.group(
					{
						clientId: () =>
							ctx.prompt.text({
								message: 'Discord Client ID',
								initialValue: 'your-discord-client-id',
							}),
						clientSecret: () =>
							ctx.prompt.text({
								message: 'Discord Client Secret',
								initialValue: 'your-discord-client-secret',
							}),
						redirectUri: () =>
							ctx.prompt.text({
								message: 'Discord Redirect URI Domain',
								initialValue: 'http://localhost:4321',
							}),
					},
					{
						onCancel: () => ctx.promptOnCancel(),
					}
				);

				ctx.debug && ctx.logger.debug(`Discord OAuth: ${discordOAuth}`);

				envBuilderOpts.discordOAuth = discordOAuth;
			}

			if (envBuilderStep1.oAuthOptions.includes('google')) {
				const googleOAuth = await ctx.prompt.group(
					{
						clientId: () =>
							ctx.prompt.text({
								message: 'Google Client ID',
								initialValue: 'your-google-client-id',
							}),
						clientSecret: () =>
							ctx.prompt.text({
								message: 'Google Client Secret',
								initialValue: 'your-google-client-secret',
							}),
						redirectUri: () =>
							ctx.prompt.text({
								message: 'Google Redirect URI Domain',
								initialValue: 'http://localhost:4321',
							}),
					},
					{
						onCancel: () => ctx.promptOnCancel(),
					}
				);

				ctx.debug && ctx.logger.debug(`Google OAuth: ${googleOAuth}`);

				envBuilderOpts.googleOAuth = googleOAuth;
			}

			if (envBuilderStep1.oAuthOptions.includes('auth0')) {
				const auth0OAuth = await ctx.prompt.group(
					{
						clientId: () =>
							ctx.prompt.text({
								message: 'Auth0 Client ID',
								initialValue: 'your-auth0-client-id',
							}),
						clientSecret: () =>
							ctx.prompt.text({
								message: 'Auth0 Client Secret',
								initialValue: 'your-auth0-client-secret',
							}),
						domain: () =>
							ctx.prompt.text({
								message: 'Auth0 Domain',
								initialValue: 'your-auth0-domain',
							}),
						redirectUri: () =>
							ctx.prompt.text({
								message: 'Auth0 Redirect URI Domain',
								initialValue: 'http://localhost:4321',
							}),
					},
					{
						onCancel: () => ctx.promptOnCancel(),
					}
				);

				ctx.debug && ctx.logger.debug(`Auth0 OAuth: ${auth0OAuth}`);

				envBuilderOpts.auth0OAuth = auth0OAuth;
			}

			envFileContent = buildEnvFile(envBuilderOpts);
		}
	}

	if (ctx.dryRun) {
		ctx.prompt.log.info(
			`${StudioCMSColorwayInfo.bold('--dry-run')} ${color.dim('Skipping environment file creation')}`
		);
	} else if (_env) {
		ctx.tasks.push({
			title: 'Environment Variable File',
			task: async (message) => {
				message('Creating environment file...');
				try {
					await fs.writeFile(path.join(ctx.cwd, '.env'), envFileContent, {
						encoding: 'utf-8',
					});
					message('Environment file created');
				} catch (e) {
					if (e instanceof Error) {
						ctx.prompt.log.error(StudioCMSColorwayError(`Error: ${e.message}`));
						process.exit(1);
					} else {
						ctx.prompt.log.error(
							StudioCMSColorwayError('Unknown Error: Unable to create environment file.')
						);
						process.exit(1);
					}
				}
			},
		});
	}

	ctx.debug && ctx.logger.debug('Environment complete');
}
