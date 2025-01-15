import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { error, info } from '../messages.js';
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
		ctx.debug && ctx.logger.debug('Not a StudioCMS project, skipping environment file creation');
		return;
	}

	let _env = ctx.yes;
	let envFileContent: string;

	if (_env) {
		await info('env', 'Setting up basic environment file');
	} else {
		const EnvPrompt = await ctx.prompt.select({
			message: 'What kind of environment file would you like to create?',
			options: [
				{ value: 'builder', label: 'Use Interactive .env Builder' },
				{ value: 'example', label: 'Use the Example .env file' },
				{ value: 'none', label: 'Skip Environment File Creation' },
			],
		});

		if (ctx.prompt.isCancel(EnvPrompt)) {
			ctx.prompt.cancel('Operation cancelled.');
			ctx.exit(0);
		}

		ctx.debug && ctx.logger.debug(`Environment file type selected: ${EnvPrompt}`);

		_env = EnvPrompt !== 'none';

		if (EnvPrompt === 'example') {
			envFileContent = ExampleEnv;
		} else if (EnvPrompt === 'builder') {
			let envBuilderOpts: EnvBuilderOptions = {};

			const envBuilderStep1 = await ctx.prompt.group(
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
					onCancel: () => {
						ctx.prompt.cancel('Operation cancelled.');
						process.exit(0);
					},
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
						onCancel: () => {
							ctx.prompt.cancel('Operation cancelled.');
							process.exit(0);
						},
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
						onCancel: () => {
							ctx.prompt.cancel('Operation cancelled.');
							process.exit(0);
						},
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
						onCancel: () => {
							ctx.prompt.cancel('Operation cancelled.');
							process.exit(0);
						},
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
						onCancel: () => {
							ctx.prompt.cancel('Operation cancelled.');
							process.exit(0);
						},
					}
				);

				ctx.debug && ctx.logger.debug(`Auth0 OAuth: ${auth0OAuth}`);

				envBuilderOpts.auth0OAuth = auth0OAuth;
			}

			envFileContent = buildEnvFile(envBuilderOpts);
		}
	}

	if (ctx.dryRun) {
		await info('--dry-run', 'Skipping environment file creation');
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
						error('error', e.message);
						process.exit(1);
					} else {
						error('error', 'Unable to create environment file.');
						process.exit(1);
					}
				}
			},
		});
	}

	ctx.debug && ctx.logger.debug('Environment complete');
}
