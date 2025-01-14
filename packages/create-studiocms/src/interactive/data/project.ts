import { random } from '../../messages';

export function generateProjectName() {
	const adjective = random(adjectives);
	const validNouns = nouns.filter((n) => n[0] === adjective[0]);
	if (validNouns.length < 2) {
		return `${random(adjectives)}-${random(nouns)}`;
	}
	const noun = random(validNouns);
	return `${adjective}-${noun}`;
}

export const nouns = [
	'ablation',
	'accretion',
	'altitude',
	'antimatter',
	'aperture',
	'apogee',
	'ascension',
	'asteroid',
	'astronaut',
	'atmosphere',
	'aurora',
	'axis',
	'azimuth',
	'bar',
	'belt',
	'binary',
	'centauri',
	'chaos',
	'chasm',
	'chroma',
	'cloud',
	'cluster',
	'comet',
	'conjunction',
	'corot',
	'crater',
	'cycle',
	'debris',
	'disk',
	'doppler',
	'dwarf',
	'earth',
	'eclipse',
	'ellipse',
	'ephemera',
	'equator',
	'equinox',
	'escape',
	'event',
	'field',
	'filament',
	'fireball',
	'flare',
	'force',
	'fusion',
	'galaxy',
	'gamma',
	'giant',
	'graham',
	'gravity',
	'group',
	'halo',
	'heliosphere',
	'horizon',
	'houston',
	'hubble',
	'ice',
	'inclination',
	'iron',
	'jet',
	'jupiter',
	'kelvin',
	'kepler',
	'kuiper',
	'light',
	'limb',
	'limit',
	'luminosity',
	'magnitude',
	'main',
	'mars',
	'mass',
	'matter',
	'mercury',
	'meridian',
	'metal',
	'meteor',
	'meteorite',
	'moon',
	'motion',
	'nadir',
	'nebula',
	'neptune',
	'neutron',
	'nova',
	'orbit',
	'osiris',
	'parallax',
	'parsec',
	'pegasi',
	'phase',
	'photon',
	'planet',
	'plasma',
	'point',
	'proxima',
	'pulsar',
	'radiation',
	'raspberry',
	'remnant',
	'resonance',
	'ring',
	'rotation',
	'satellite',
	'saturn',
	'series',
	'shell',
	'shepherd',
	'singularity',
	'solstice',
	'spectrum',
	'sphere',
	'spiral',
	'star',
	'star',
	'telescope',
	'tower',
	'transit',
	'trappist',
	'velocity',
	'venus',
	'virgo',
	'visual',
	'wasp',
	'wavelength',
	'wind',
	'zenith',
	'zero',
];

export const adjectives = [
	'absent',
	'absolute',
	'adorable',
	'afraid',
	'agreeable',
	'apparent',
	'astronautical',
	'awesome',
	'beneficial',
	'better',
	'bizarre',
	'blue',
	'bustling',
	'callous',
	'capricious',
	'celestial',
	'certain',
	'civil',
	'cosmic',
	'curved',
	'cyan',
	'dangerous',
	'dark',
	'deeply',
	'density',
	'digital',
	'dimensional',
	'dreary',
	'eccentric',
	'ecliptic',
	'electrical',
	'eminent',
	'evolved',
	'exotic',
	'extinct',
	'extra',
	'extraterrestrial',
	'faithful',
	'far',
	'fast',
	'flaky',
	'former',
	'fumbling',
	'galactic',
	'grateful',
	'green',
	'growing',
	'grubby',
	'gullible',
	'helpless',
	'hilarious',
	'intergalactic',
	'interstellar',
	'irregular',
	'lonely',
	'lunar',
	'mad',
	'magenta',
	'magical',
	'majestic',
	'major',
	'mechanical',
	'minor',
	'molecular',
	'nasty',
	'nebulous',
	'nuclear',
	'opposite',
	'orbital',
	'ossified',
	'pale',
	'peaceful',
	'pink',
	'planetary',
	'popular',
	'proper',
	'proto',
	'proud',
	'puffy',
	'purple',
	'radiant',
	'receptive',
	'red',
	'regular',
	'retrograde',
	'satellite',
	'second',
	'shaggy',
	'shaky',
	'shining',
	'short',
	'sleepy',
	'smoggy',
	'solar',
	'spiffy',
	'squalid',
	'square',
	'squealing',
	'stale',
	'starry',
	'steadfast',
	'stellar',
	'strong',
	'subsequent',
	'super',
	'superior',
	'tasty',
	'teal',
	'technological',
	'tender',
	'terrestrial',
	'tested',
	'tidal',
	'tremendous',
	'ultraviolet',
	'united',
	'useful',
	'useless',
	'utter',
	'verdant',
	'vigorous',
	'violet',
	'virtual',
	'visible',
	'wandering',
	'whole',
	'wretched',
	'yellow',
	'zany',
	'zapping',
];
