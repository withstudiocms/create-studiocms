import type { KnipConfig } from 'knip';

const config: KnipConfig = {
	exclude: ['duplicates', 'optionalPeerDependencies'],
	workspaces: {
		'.': {
			ignoreDependencies: ['@changesets/config'],
			entry: [
				'.github/workflows/*.yml',
				'.changeset/config.json',
				'vitest.config.mts',
				'biome.json',
			],
			project: [
				'.github/workflows/*.yml',
				'.changeset/config.json',
				'vitest.config.mts',
				'biome.json',
			],
		},
		'packages/*': {
			ignoreDependencies: ['@clack/core'],
			entry: ['src/**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}'],
			project: ['**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}'],
		},
	},
};

export default config;
