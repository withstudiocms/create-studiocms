import { describe, expect, it } from 'vitest';
import { template } from '../dist/index.js';
import { templateRegistry } from '../src/templates.config.js';
import { setup } from './utils.js';

describe('template', () => {
	const fixture = setup();

	it('none', async () => {
		const context = {
			template: '',
			cwd: '',
			dryRun: true,
			prompt: { ...fixture.prompt, select: () => 'studiocms/basics' },
			templateRegistry: templateRegistry,
		};
		// @ts-expect-error Testing purposes only
		await template(context);
		expect(fixture.hasMessage('Skipping template copying')).toBe(true);
		expect(context.template).toBe('studiocms/basics');
	});

	it('studiocms/basics (--dry-run)', async () => {
		const context = {
			template: 'studiocms/basics',
			cwd: '',
			dryRun: true,
			prompt: { ...fixture.prompt },
			templateRegistry: templateRegistry,
		};
		// @ts-expect-error Testing purposes only
		await template(context);
		expect(fixture.hasMessage('Using studiocms/basics as project template')).toBe(true);
	});

	it('studiocms/blog (--dry-run)', async () => {
		const context = {
			template: 'studiocms/blog',
			cwd: '',
			dryRun: true,
			prompt: { ...fixture.prompt },
			templateRegistry: templateRegistry,
		};
		// @ts-expect-error Testing purposes only
		await template(context);
		expect(fixture.hasMessage('Using studiocms/blog as project template')).toBe(true);
	});

	it('studiocms-ui/basics (--dry-run)', async () => {
		const context = {
			template: 'studiocms-ui/basics',
			cwd: '',
			dryRun: true,
			prompt: { ...fixture.prompt },
			templateRegistry: templateRegistry,
		};
		// @ts-expect-error Testing purposes only
		await template(context);
		expect(fixture.hasMessage('Using studiocms-ui/basics as project template')).toBe(true);
	});

	it('studiocms-ui/blog (--yes)', async () => {
		const context = {
			template: 'studiocms-ui/blog',
			cwd: '',
			dryRun: true,
			yes: true,
			prompt: { ...fixture.prompt },
			templateRegistry: templateRegistry,
		};
		// @ts-expect-error Testing purposes only
		await template(context);
		expect(fixture.hasMessage('Using studiocms-ui/blog as project template')).toBe(true);
	});
});
