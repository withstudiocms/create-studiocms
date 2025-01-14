import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { error, info } from '../messages.js';
import type { Context } from './context.js';
import ExampleEnv from './data/studiocmsenv.js';

export async function env(
	ctx: Pick<Context, 'cwd' | 'yes' | 'prompt' | 'dryRun' | 'tasks' | 'exit' | 'isStudioCMSProject'>
) {
	if (!ctx.isStudioCMSProject) {
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
				{ value: 'empty', label: 'Create a Empty (key only) file' },
				{ value: 'builder', label: 'Use Interactive .env Builder' },
				{ value: 'none', label: 'Skip Environment File Creation' },
			],
		});

		if (ctx.prompt.isCancel(EnvPrompt)) {
			ctx.prompt.cancel('Operation cancelled.');
			ctx.exit(0);
		}

		_env = EnvPrompt !== 'none';

		if (EnvPrompt === 'empty') {
			envFileContent = ExampleEnv;
		} else if (EnvPrompt === 'builder') {
			let envBuilderOpts: {
				astroDbRemoteUrl?: string;
				astroDbToken?: string;
				encryptionKey?: string;
				oAuthOptions?: ('github' | 'discord' | 'google' | 'auth0')[];
				githubOAuth?: {
					clientId: string;
					clientSecret: string;
					redirectUri: string;
				};
				discordOAuth?: {
					clientId: string;
					clientSecret: string;
					redirectUri: string;
				};
				googleOAuth?: {
					clientId: string;
					clientSecret: string;
					redirectUri: string;
				};
				auth0OAuth?: {
					clientId: string;
					clientSecret: string;
					domain: string;
					redirectUri: string;
				};
			} = {};

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
						}),
				},
				{
					// On Cancel callback that wraps the group
					// So if the user cancels one of the prompts in the group this function will be called
					onCancel: ({ results }) => {
						ctx.prompt.cancel('Operation cancelled.');
						process.exit(0);
					},
				}
			);

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
								message: 'GitHub Redirect URI',
								initialValue: 'http://localhost:4321/studiocms_api/auth/github/callback',
							}),
					},
					{
						onCancel: ({ results }) => {
							ctx.prompt.cancel('Operation cancelled.');
							process.exit(0);
						},
					}
				);

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
								message: 'Discord Redirect URI',
								initialValue: 'http://localhost:4321/studiocms_api/auth/discord/callback',
							}),
					},
					{
						onCancel: ({ results }) => {
							ctx.prompt.cancel('Operation cancelled.');
							process.exit(0);
						},
					}
				);

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
								message: 'Google Redirect URI',
								initialValue: 'http://localhost:4321/studiocms_api/auth/google/callback',
							}),
					},
					{
						onCancel: ({ results }) => {
							ctx.prompt.cancel('Operation cancelled.');
							process.exit(0);
						},
					}
				);

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
								message: 'Auth0 Redirect URI',
								initialValue: 'http://localhost:4321/studiocms_api/auth/auth0/callback',
							}),
					},
					{
						onCancel: ({ results }) => {
							ctx.prompt.cancel('Operation cancelled.');
							process.exit(0);
						},
					}
				);

				envBuilderOpts.auth0OAuth = auth0OAuth;
			}

			envFileContent = `# StudioCMS Environment Variables

# libSQL URL and Token for AstroDB
ASTRO_DB_REMOTE_URL=${envBuilderOpts.astroDbRemoteUrl}
ASTRO_DB_APP_TOKEN=${envBuilderOpts.astroDbToken}

# Auth encryption key
CMS_ENCRYPTION_KEY="${envBuilderOpts.encryptionKey}" # openssl rand --base64 16

# credentials for GitHub OAuth
CMS_GITHUB_CLIENT_ID=${envBuilderOpts.githubOAuth?.clientId}
CMS_GITHUB_CLIENT_SECRET=${envBuilderOpts.githubOAuth?.clientSecret}
CMS_GITHUB_REDIRECT_URI=${envBuilderOpts.githubOAuth?.redirectUri}

# credentials for Discord OAuth
CMS_DISCORD_CLIENT_ID=${envBuilderOpts.discordOAuth?.clientId}
CMS_DISCORD_CLIENT_SECRET=${envBuilderOpts.discordOAuth?.clientSecret}
CMS_DISCORD_REDIRECT_URI=${envBuilderOpts.discordOAuth?.redirectUri}

# credentials for Google OAuth
CMS_GOOGLE_CLIENT_ID=${envBuilderOpts.googleOAuth?.clientId}
CMS_GOOGLE_CLIENT_SECRET=${envBuilderOpts.googleOAuth?.clientSecret}
CMS_GOOGLE_REDIRECT_URI=${envBuilderOpts.googleOAuth?.redirectUri}

# credentials for auth0 OAuth
CMS_AUTH0_CLIENT_ID=${envBuilderOpts.auth0OAuth?.clientId}
CMS_AUTH0_CLIENT_SECRET=${envBuilderOpts.auth0OAuth?.clientSecret}
CMS_AUTH0_DOMAIN=${envBuilderOpts.auth0OAuth?.domain}
CMS_AUTH0_REDIRECT_URI=${envBuilderOpts.auth0OAuth?.redirectUri}
`;
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
}
