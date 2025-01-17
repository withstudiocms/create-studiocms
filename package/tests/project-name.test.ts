import { describe, expect, it } from 'vitest';
import { projectName } from '../dist/index.js';
import { setup } from './utils.js';

describe('project name', () => {
	const fixture = setup();

	it('pass in name', async () => {
		const context = { projectName: '', cwd: './foo/bar/baz', prompt: { ...fixture.prompt } };
		// @ts-expect-error Testing purposes only
		await projectName(context);
		expect(context.cwd).toBe('./foo/bar/baz');
		expect(context.projectName).toBe('baz');
	});

	it('dot', async () => {
		const context = {
			projectName: '',
			cwd: '.',
			prompt: { ...fixture.prompt, text: () => 'foobar' },
		};
		// @ts-expect-error Testing purposes only
		await projectName(context);
		expect(fixture.hasMessage('"." is not empty!')).toBe(true);
		expect(context.projectName).toBe('foobar');
	});

	it('dot slash', async () => {
		const context = {
			projectName: '',
			cwd: './',
			prompt: { ...fixture.prompt, text: () => 'foobar' },
		};
		// @ts-expect-error Testing purposes only
		await projectName(context);
		expect(fixture.hasMessage('"./" is not empty!')).toBe(true);
		expect(context.projectName).toBe('foobar');
	});

	it('empty', async () => {
		const context = {
			projectName: '',
			cwd: './package/tests/fixtures/empty',
			prompt: { ...fixture.prompt, text: () => 'foobar' },
		};
		// @ts-expect-error Testing purposes only
		await projectName(context);
		expect(fixture.hasMessage('"./package/tests/fixtures/empty" is not empty!')).toBe(false);
		expect(context.projectName).toBe('empty');
	});

	it('not empty', async () => {
		const context = {
			projectName: '',
			cwd: './package/tests/fixtures/not-empty',
			prompt: { ...fixture.prompt, text: () => 'foobar' },
		};
		// @ts-expect-error Testing purposes only
		await projectName(context);
		expect(fixture.hasMessage('"./package/tests/fixtures/not-empty" is not empty!')).toBe(true);
		expect(context.projectName).toBe('foobar');
	});

	it('basic', async () => {
		const context = {
			projectName: '',
			cwd: '',
			prompt: { ...fixture.prompt, text: () => 'foobar' },
		};
		// @ts-expect-error Testing purposes only
		await projectName(context);
		expect(context.cwd).toBe('foobar');
		expect(context.projectName).toBe('foobar');
	});

	it('head and tail blank spaces should be trimmed', async () => {
		const context = {
			projectName: '',
			cwd: '',
			prompt: { ...fixture.prompt, text: () => 'foobar' },
		};
		// @ts-expect-error Testing purposes only
		await projectName(context);
		expect(context.cwd).toBe('foobar');
		expect(context.projectName).toBe('foobar');
	});

	it('normalize', async () => {
		const context = {
			projectName: '',
			cwd: '',
			prompt: { ...fixture.prompt, text: () => 'Invalid Name' },
		};
		// @ts-expect-error Testing purposes only
		await projectName(context);
		expect(context.cwd).toBe('Invalid Name');
		expect(context.projectName).toBe('invalid-name');
	});

	it('remove leading/trailing dashes', async () => {
		const context = {
			projectName: '',
			cwd: '',
			prompt: { ...fixture.prompt, text: () => '(invalid)' },
		};
		// @ts-expect-error Testing purposes only
		await projectName(context);
		expect(context.projectName).toBe('invalid');
	});

	it('handles scoped packages', async () => {
		const context = {
			projectName: '',
			cwd: '',
			prompt: { ...fixture.prompt, text: () => '@astro/site' },
		};
		// @ts-expect-error Testing purposes only
		await projectName(context);
		expect(context.cwd).toBe('@astro/site');
		expect(context.projectName).toBe('@astro/site');
	});

	it('--yes', async () => {
		const context = {
			projectName: '',
			cwd: './foo/bar/baz',
			yes: true,
			prompt: { ...fixture.prompt, text: () => 'foobar' },
		};
		// @ts-expect-error Testing purposes only
		await projectName(context);
		expect(context.projectName).toBe('baz');
	});

	it('dry run with name', async () => {
		const context = {
			projectName: '',
			cwd: './foo/bar/baz',
			dryRun: true,
			prompt: { ...fixture.prompt },
		};
		// @ts-expect-error Testing purposes only
		await projectName(context);
		expect(context.projectName).toBe('baz');
	});

	it('dry run with dot', async () => {
		const context = {
			projectName: '',
			cwd: '.',
			dryRun: true,
			prompt: { ...fixture.prompt, text: () => 'foobar' },
		};
		// @ts-expect-error Testing purposes only
		await projectName(context);
		expect(context.projectName).toBe('foobar');
	});

	it('dry run with empty', async () => {
		const context = {
			projectName: '',
			cwd: './tests/fixtures/empty',
			dryRun: true,
			prompt: { ...fixture.prompt, text: () => 'foobar' },
		};
		// @ts-expect-error Testing purposes only
		await projectName(context);
		expect(context.projectName).toBe('empty');
	});
});
