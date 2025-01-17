import { rmSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { git } from '../dist/index.js';
import { setup } from './utils.js';

describe('git', () => {
	const fixture = setup();

	it('none', async () => {
		const context = {
			cwd: './test/fixtures/empty',
			dryRun: true,
			prompt: { ...fixture.prompt, confirm: async () => false },
		};
		// @ts-expect-error Testing purposes only
		await git(context);

		expect(fixture.hasMessage('Skipping Git initialization')).toBe(true);
	});

	it('yes (--dry-run)', async () => {
		const context = {
			cwd: './test/fixtures/empty',
			dryRun: true,
			prompt: { ...fixture.prompt, confirm: async () => true },
		};
		// @ts-expect-error Testing purposes only
		await git(context);

		expect(fixture.hasMessage('Skipping Git initialization')).toBe(true);
	});

	it('no (--dry-run)', async () => {
		const context = {
			cwd: './test/fixtures/empty',
			dryRun: true,
			prompt: { ...fixture.prompt, confirm: async () => false },
		};
		// @ts-expect-error Testing purposes only
		await git(context);

		expect(fixture.hasMessage('Skipping Git initialization')).toBe(true);
	});
});

describe('git initialized', () => {
	const fixture = setup();

	const dir = new URL('./fixtures/not-empty/.git', import.meta.url);

	beforeAll(async () => {
		await mkdir(dir, { recursive: true });
		await writeFile(new URL('./git.json', dir), '{}', { encoding: 'utf8' });
	});

	it('already initialized', async () => {
		const context = {
			git: true,
			cwd: './package/tests/fixtures/not-empty',
			dryRun: false,
			prompt: { ...fixture.prompt, confirm: async () => false },
		};
		// @ts-expect-error Testing purposes only
		await git(context);

		expect(fixture.hasMessage('Git has already been initialized')).toBe(true);
	});

	afterAll(() => {
		rmSync(dir, { recursive: true, force: true });
	});
});
