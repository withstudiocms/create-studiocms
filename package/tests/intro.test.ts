import { describe, expect, it } from 'vitest';
import { intro } from '../dist/index.js';
import { setup } from './utils.js';

async function setUsername() {
	return 'user';
}

const username = setUsername();

describe('intro', () => {
	const fixture = setup();

	it('Test Response', async () => {
		// @ts-expect-error Testing purposes only
		await intro({ skipBanners: true, version: '0.0.0', username });
		expect(fixture.length()).toBe(1);
		expect(fixture.hasMessage('Interactive CLI')).toBe(true);
	});
});
