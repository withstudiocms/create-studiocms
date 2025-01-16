import { describe, expect, it } from 'vitest';
import { dependencies } from '../dist/index.js';
import { setup } from './utils.js';

describe('dependencies', () => {
	const fixture = setup();

	it('--yes', async () => {
		const context = {
			cwd: '',
			yes: true,
			packageManager: 'npm',
			dryRun: true,
		};

		// @ts-expect-error Testing purposes only
		await dependencies(context);

		expect(fixture.hasMessage('Skipping dependency installation')).toBe(true);
	});

	it('prompt yes', async () => {
		const context = {
			cwd: '',
			packageManager: 'npm',
			dryRun: true,
			install: undefined,
			prompt: { confirm: async () => true, isCancel: () => false, cancel: () => {} },
		};

		// @ts-expect-error Testing purposes only
		await dependencies(context);

		expect(fixture.hasMessage('Skipping dependency installation')).toBe(true);
		expect(context.install).toBe(true);
	});

	it('prompt no', async () => {
		const context = {
			cwd: '',
			packageManager: 'npm',
			dryRun: true,
			install: undefined,
			prompt: { confirm: async () => false, isCancel: () => false, cancel: () => {} },
		};

		// @ts-expect-error Testing purposes only
		await dependencies(context);

		expect(fixture.hasMessage('Skipping dependency installation')).toBe(true);
		expect(context.install).toBe(false);
	});

	it('--install', async () => {
		const context = {
			cwd: '',
			install: true,
			packageManager: 'npm',
			dryRun: true,
		};

		// @ts-expect-error Testing purposes only
		await dependencies(context);

		expect(fixture.hasMessage('Skipping dependency installation')).toBe(true);
		expect(context.install).toBe(true);
	});

	it('--no-install', async () => {
		const context = {
			cwd: '',
			install: false,
			packageManager: 'npm',
			dryRun: true,
		};

		// @ts-expect-error Testing purposes only
		await dependencies(context);

		expect(fixture.hasMessage('Skipping dependency installation')).toBe(true);
		expect(context.install).toBe(false);
	});
});
