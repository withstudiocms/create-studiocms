import os from 'node:os';
import { describe, expect, it } from 'vitest';
import { getContext } from '../dist/cmds/interactive/context.js';

describe('context', () => {
	it('no arguments', async () => {
		const ctx = await getContext({});
		expect(ctx.projectName).toBeFalsy();
		expect(ctx.template).toBeFalsy();
		expect(ctx.skipBanners).toBe(os.platform() === 'win32');
		expect(ctx.dryRun).toBeFalsy();
	});

	it('project name', async () => {
		const ctx = await getContext({ projectName: 'foobar' });
		expect(ctx.projectName).toBe('foobar');
	});

	it('template', async () => {
		const ctx = await getContext({ template: 'minimal' });
		expect(ctx.template).toBe('minimal');
	});

	it('skip banners (explicit)', async () => {
		const ctx = await getContext({ skipBanners: true });
		expect(ctx.skipBanners).toBe(true);
	});

	it('skip banners (yes)', async () => {
		const ctx = await getContext({ yes: true });
		expect(ctx.yes).toBe(true);
	});

	it('skip banners (no)', async () => {
		const ctx = await getContext({ no: true });
		expect(ctx.skipBanners).toBe(true);
	});

	it('skip banners (install)', async () => {
		const ctx = await getContext({ install: true });
		expect(ctx.skipBanners).toBe(true);
	});

	it('dry run', async () => {
		const ctx = await getContext({ dryRun: true });
		expect(ctx.dryRun).toBe(true);
	});

	it('install', async () => {
		const ctx = await getContext({ install: true });
		expect(ctx.install).toBe(true);
	});

	it('no install', async () => {
		const ctx = await getContext({ doNotInstall: true });
		expect(ctx.install).toBe(false);
	});

	it('git', async () => {
		const ctx = await getContext({ git: true });
		expect(ctx.git).toBe(true);
	});

	it('no git', async () => {
		const ctx = await getContext({ doNotInitGit: true });
		expect(ctx.git).toBe(false);
	});
});
