import { describe, expect, it } from 'vitest';
import { intro } from '../dist/index.js';
import { setup } from './utils.js';

describe('intro', () => {
	const fixture = setup();

	it('Test Response', async () => {
		// @ts-expect-error Testing purposes only
		await intro({ skipBanners: false, version: '0.0.0', username: 'user', welcome: 'Welcome!' });
		expect(fixture.hasMessage('      █ █▄▄▄         Welcome to  StudioCMS  v0.0.0 user   \n')).toBe(
			true
		);
	});

	it('Test Response - Skip Banners', async () => {
		// @ts-expect-error Testing purposes only
		await intro({ skipBanners: true, version: '0.0.0', username: 'user' });
		expect(fixture.length()).toBe(0);
	});
});
