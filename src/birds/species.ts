// Birds that really work the skies over Tonopah, the sagebrush of the Big Smoky
// Valley and the pinyon ridges of the San Antonio Mountains. Dimensions from
// Cornell / Sibley.

export type TailShape = 'fan' | 'square' | 'wedge' | 'notched' | 'short';
export type BeakType = 'hook' | 'falcon' | 'goose' | 'spear' | 'pelican' | 'owl' | 'vulture' | 'corvid' | 'seed' | 'needle' | 'gape';
export type WingTip = 'slotted' | 'pointed' | 'rounded';

export interface Palette {
  name: string;
  head: string;
  throat: string;
  breast: string;
  belly: string;
  back: string;
  coverts: string;
  secondaries: string;
  primaries: string;
  underCoverts: string;
  underFlight: string;
  tail: string;
  tailUnder: string;
  beak: string;
  cere: string;
  legs: string;
  eye: string;
  skin: string; // bare head / crown patch / gorget
  bellyBand?: number;
  barring?: number;
  tailBands?: number;
  tailBandColor?: string;
  wingtipDark?: number;
  trailingEdge?: number;
  patagial?: number;
  carpal?: number;
  rump?: number;
  mottle?: number;
  helmet?: number; // falcon moustache / dark hood / osprey eye-stripe
  skinHead?: number; // fraction of head that is bare skin
  crown?: number; // coloured crown patch
  wingPanel?: number; // pale panel in the primaries (nighthawk bar, juv. eagle)
  gloss?: number; // iridescent blue-violet sheen (raven, hummingbird gorget)
}

export interface Shape {
  wingspan: number;
  length: number;
  bodyWidth: number;
  bodyDepth: number;
  neckLen: number;
  headSize: number;
  chord: number; // root chord as a fraction of semi-span
  taper: number; // 0 broad .. 1 pointed
  sweep: number; // radians of tip sweep-back
  tip: WingTip;
  fingers: number;
  fingerLen: number;
  tailLen: number;
  tailWidth: number;
  tail: TailShape;
  beak: BeakType;
  beakLen: number;
  legs: 'tucked' | 'trailing';
  legLen: number;
  dihedral: number; // radians at glide
  disk?: boolean; // owl facial disk
  tufts?: number; // owl "ear" tufts, length as a fraction of head size
  crest?: number; // shaggy crest (roadrunner) or teardrop topknot (quail)
}

export interface FlightTraits {
  massKg: number;
  cruise: number; // m/s best glide speed
  stall: number;
  maxDive: number;
  glideRatio: number;
  flapHz: number;
  flapPower: number; // m/s^2 of thrust when flapping at cruise
  climb: number; // agility factor
  hover?: boolean;
  soarer?: boolean;
  nocturnal?: boolean;
  swimmer?: boolean;
}

export type Call =
  | 'scream'
  | 'kek'
  | 'honk'
  | 'bugle'
  | 'croak'
  | 'hiss'
  | 'whistle'
  | 'screech'
  | 'chitter'
  | 'grunt'
  | 'hoot'
  | 'peent'
  | 'trill'
  | 'coo'
  | 'quail'
  | 'squawk';

export interface Species {
  id: string;
  name: string;
  latin: string;
  blurb: string;
  facts: string[];
  call: Call;
  shape: Shape;
  flight: FlightTraits;
  palettes: Palette[];
}

const base = {
  eye: '#2a1a0c',
  legs: '#e8c23a',
  cere: '#e3b93c',
  skin: '#c43a2c',
};

export const SPECIES: Species[] = [
  {
    id: 'redtail',
    name: 'Red-tailed Hawk',
    latin: 'Buteo jamaicensis',
    blurb: 'Perches on the power poles along US-95 and the old headframes, then rides ridge lift off Mount Oddie over the sagebrush flats.',
    facts: [
      'Its raspy keee-eeer scream is the "eagle" call Hollywood dubs into every movie.',
      'Hunts jackrabbits and ground squirrels from the tops of power poles and headframes.',
      'Great Basin birds are paler than coastal ones, sun-bleached like everything else out here.',
    ],
    call: 'scream',
    shape: {
      wingspan: 1.24, length: 0.55, bodyWidth: 0.15, bodyDepth: 0.16, neckLen: 0.02, headSize: 0.07,
      chord: 0.42, taper: 0.25, sweep: 0.12, tip: 'slotted', fingers: 5, fingerLen: 0.24,
      tailLen: 0.22, tailWidth: 0.16, tail: 'fan', beak: 'hook', beakLen: 0.035, legs: 'tucked', legLen: 0.09, dihedral: 0.09,
    },
    flight: { massKg: 1.1, cruise: 13, stall: 6.5, maxDive: 55, glideRatio: 13, flapHz: 2.7, flapPower: 6, climb: 1, soarer: true },
    palettes: [
      { ...base, name: 'Light morph', head: '#7a5636', throat: '#f2ebdd', breast: '#f4ecdd', belly: '#f0e5d1', back: '#64452b', coverts: '#7a5636', secondaries: '#654b35', primaries: '#3d2c1f', underCoverts: '#f1e7d6', underFlight: '#ece6dd', tail: '#c0592e', tailUnder: '#ecceba', beak: '#2e2a28', bellyBand: 0.6, patagial: 0.9, trailingEdge: 0.7, wingtipDark: 0.25, mottle: 0.6, tailBands: 1, tailBandColor: '#2a1d14' },
      { ...base, name: 'Rufous morph', head: '#5a3520', throat: '#c78a5a', breast: '#b9703f', belly: '#a65e34', back: '#4a2e1c', coverts: '#5a3822', secondaries: '#4a3424', primaries: '#30231a', underCoverts: '#9c5a34', underFlight: '#dcd2c6', tail: '#b0502a', tailUnder: '#d9a587', beak: '#2e2a28', bellyBand: 0.5, patagial: 0.6, trailingEdge: 0.8, wingtipDark: 0.3, mottle: 0.4, tailBands: 1, tailBandColor: '#2a1d14' },
      { ...base, name: 'Juvenile', head: '#6e5136', throat: '#efe6d8', breast: '#efe5d3', belly: '#e9dcc5', back: '#5e4430', coverts: '#73563a', secondaries: '#6a5038', primaries: '#4a3726', underCoverts: '#eadfcc', underFlight: '#e2dcd2', tail: '#7a6248', tailUnder: '#d8cfc2', beak: '#2e2a28', eye: '#c9b26a', bellyBand: 0.9, patagial: 0.8, trailingEdge: 0.3, wingtipDark: 0.2, mottle: 0.8, tailBands: 6, tailBandColor: '#3a2a1c' },
    ],
  },
  {
    id: 'raven',
    name: 'Common Raven',
    latin: 'Corvus corax',
    blurb: 'The unofficial mayor of Tonopah. Works the dumpsters behind Love\u2019s and the Mizpah kitchen, then tumbles for fun over the mining park headframes.',
    facts: [
      'Ravens barrel-roll and fly upside down purely for play.',
      'They follow US-95 at dawn for roadkill, and remember which cars feed them.',
      'Wedge-shaped tail and a deep, croaking gronk tell it from a crow at a glance.',
    ],
    call: 'croak',
    shape: {
      wingspan: 1.2, length: 0.62, bodyWidth: 0.13, bodyDepth: 0.14, neckLen: 0.04, headSize: 0.07,
      chord: 0.36, taper: 0.3, sweep: 0.1, tip: 'slotted', fingers: 5, fingerLen: 0.2,
      tailLen: 0.25, tailWidth: 0.13, tail: 'wedge', beak: 'corvid', beakLen: 0.075, legs: 'tucked', legLen: 0.1, dihedral: 0.05,
    },
    flight: { massKg: 1.2, cruise: 12, stall: 5.5, maxDive: 50, glideRatio: 11, flapHz: 3.0, flapPower: 7, climb: 1.3, soarer: true },
    palettes: [
      { ...base, name: 'Adult', head: '#121216', throat: '#141418', breast: '#131317', belly: '#121216', back: '#14141a', coverts: '#15151c', secondaries: '#121218', primaries: '#0f0f13', underCoverts: '#111115', underFlight: '#2a2a2e', tail: '#121217', tailUnder: '#18181c', beak: '#0c0c0e', cere: '#0c0c0e', legs: '#141414', eye: '#140e0a', gloss: 1, mottle: 0.15 },
    ],
  },
  {
    id: 'goldeneagle',
    name: 'Golden Eagle',
    latin: 'Aquila chrysaetos',
    blurb: 'Patrols the crest of the San Antonio Mountains and Lone Mountain on two-metre wings, scanning the sage for jackrabbits and pronghorn fawns.',
    facts: [
      'Can dive at over 240 km/h onto jackrabbits in the sagebrush flats.',
      'The golden hackles on the nape catch low sun like burnished bronze.',
      'Nevada has one of the densest golden eagle populations in the West; they nest on rhyolite cliffs.',
    ],
    call: 'kek',
    shape: {
      wingspan: 2.05, length: 0.86, bodyWidth: 0.22, bodyDepth: 0.24, neckLen: 0.04, headSize: 0.1,
      chord: 0.4, taper: 0.2, sweep: 0.1, tip: 'slotted', fingers: 6, fingerLen: 0.26,
      tailLen: 0.34, tailWidth: 0.22, tail: 'square', beak: 'hook', beakLen: 0.06, legs: 'tucked', legLen: 0.14, dihedral: 0.06,
    },
    flight: { massKg: 4.5, cruise: 17, stall: 8, maxDive: 70, glideRatio: 15, flapHz: 1.9, flapPower: 5, climb: 0.8, soarer: true },
    palettes: [
      { ...base, name: 'Adult', head: '#c08a3e', throat: '#3a2618', breast: '#3a2718', belly: '#34231a', back: '#3e2a1c', coverts: '#6a4a2c', secondaries: '#3a2a1e', primaries: '#21170f', underCoverts: '#33241a', underFlight: '#4a3b30', tail: '#3e3024', tailUnder: '#5a4a3c', beak: '#3a3532', cere: '#e8c050', mottle: 0.5, tailBands: 3, tailBandColor: '#26190f', trailingEdge: 0.4 },
      { ...base, name: 'Juvenile (white patches)', head: '#b98238', throat: '#3a2618', breast: '#3a2718', belly: '#34231a', back: '#3a281b', coverts: '#4e3622', secondaries: '#3a2a1e', primaries: '#21170f', underCoverts: '#30211a', underFlight: '#3e3128', tail: '#f0ebe2', tailUnder: '#f0ebe2', beak: '#3a3532', cere: '#e8c050', wingPanel: 0.9, tailBands: 1, tailBandColor: '#1e150e', mottle: 0.2 },
    ],
  },
  {
    id: 'vulture',
    name: 'Turkey Vulture',
    latin: 'Cathartes aura',
    blurb: 'Teeters in a deep V over US-95 for hours without a single wingbeat, riding the heat off the asphalt.',
    facts: [
      'One of the few birds with a keen sense of smell; it can find carrion hidden under a sagebrush.',
      'Leaves the Great Basin in September and streams south in kettles of hundreds.',
      'Spreads its wings to the morning sun on the Tonopah water tanks to warm up.',
    ],
    call: 'hiss',
    shape: {
      wingspan: 1.75, length: 0.7, bodyWidth: 0.17, bodyDepth: 0.17, neckLen: 0.05, headSize: 0.06,
      chord: 0.36, taper: 0.15, sweep: 0.06, tip: 'slotted', fingers: 6, fingerLen: 0.25,
      tailLen: 0.27, tailWidth: 0.15, tail: 'fan', beak: 'vulture', beakLen: 0.04, legs: 'tucked', legLen: 0.1, dihedral: 0.26,
    },
    flight: { massKg: 1.6, cruise: 12, stall: 5.5, maxDive: 40, glideRatio: 16, flapHz: 1.8, flapPower: 4, climb: 0.7, soarer: true },
    palettes: [
      { ...base, name: 'Adult', head: '#b8362a', throat: '#2a2220', breast: '#251d19', belly: '#221b18', back: '#2b211c', coverts: '#3a2c22', secondaries: '#2b231f', primaries: '#221c19', underCoverts: '#1e1816', underFlight: '#b9b4ae', tail: '#26201c', tailUnder: '#a8a29b', beak: '#efe6d6', cere: '#d9c9b4', legs: '#d8c3b0', skin: '#b8362a', skinHead: 1, mottle: 0.4 },
      { ...base, name: 'Juvenile (grey head)', head: '#4b4440', throat: '#2a2220', breast: '#251d19', belly: '#221b18', back: '#2b211c', coverts: '#33271f', secondaries: '#2b231f', primaries: '#221c19', underCoverts: '#1e1816', underFlight: '#aca69f', tail: '#26201c', tailUnder: '#9c968f', beak: '#3a3532', cere: '#3a3532', legs: '#d8c3b0', skin: '#4b4440', skinHead: 1, mottle: 0.6 },
    ],
  },
  {
    id: 'prairiefalcon',
    name: 'Prairie Falcon',
    latin: 'Falco mexicanus',
    blurb: 'A pale, sand-coloured falcon that nests on the volcanic cliffs and screams low across the Big Smoky Valley after horned larks.',
    facts: [
      'Black "armpits" give it away from below.',
      'Hugs the ground on the attack, using every wash and rise for cover.',
      'Its colour is a near-perfect match for Great Basin caliche and tuff.',
    ],
    call: 'kek',
    shape: {
      wingspan: 1.0, length: 0.42, bodyWidth: 0.11, bodyDepth: 0.12, neckLen: 0.01, headSize: 0.055,
      chord: 0.32, taper: 0.85, sweep: 0.38, tip: 'pointed', fingers: 0, fingerLen: 0,
      tailLen: 0.18, tailWidth: 0.1, tail: 'square', beak: 'falcon', beakLen: 0.025, legs: 'tucked', legLen: 0.06, dihedral: 0.02,
    },
    flight: { massKg: 0.7, cruise: 16, stall: 8, maxDive: 85, glideRatio: 11, flapHz: 4.2, flapPower: 9, climb: 1.4 },
    palettes: [
      { ...base, name: 'Adult', head: '#a3825e', throat: '#f2ebe0', breast: '#efe4d4', belly: '#ece0cd', back: '#957656', coverts: '#a08262', secondaries: '#8e7054', primaries: '#6a5440', underCoverts: '#2e241c', underFlight: '#ddd2c4', tail: '#a08466', tailUnder: '#e2d6c6', beak: '#4c5058', cere: '#e8c84a', barring: 0.45, helmet: 0.5, mottle: 0.5, tailBands: 5, tailBandColor: '#6a5440' },
    ],
  },
  {
    id: 'kestrel',
    name: 'American Kestrel',
    latin: 'Falco sparverius',
    blurb: 'A jewel of a falcon that hovers over the shoulders of US-6 and perches on the wires along Erie Street.',
    facts: [
      'North America\u2019s smallest falcon, barely heavier than a robin.',
      'Can see ultraviolet light, so it tracks rodents by the glow of their urine trails.',
      'Bobs its tail nervously whenever it lands on a wire.',
    ],
    call: 'kek',
    shape: {
      wingspan: 0.56, length: 0.26, bodyWidth: 0.07, bodyDepth: 0.075, neckLen: 0.01, headSize: 0.04,
      chord: 0.32, taper: 0.8, sweep: 0.32, tip: 'pointed', fingers: 0, fingerLen: 0,
      tailLen: 0.12, tailWidth: 0.065, tail: 'square', beak: 'falcon', beakLen: 0.015, legs: 'tucked', legLen: 0.04, dihedral: 0.04,
    },
    flight: { massKg: 0.12, cruise: 10, stall: 4.2, maxDive: 50, glideRatio: 9, flapHz: 6, flapPower: 10, climb: 1.6, hover: true },
    palettes: [
      { ...base, name: 'Male', head: '#7c8aa6', throat: '#f4eee4', breast: '#f0d6b4', belly: '#f3e6d2', back: '#c4673a', coverts: '#7d8cab', secondaries: '#6f7d99', primaries: '#2a2a30', underCoverts: '#f2e6d4', underFlight: '#e6e0d8', tail: '#c9673a', tailUnder: '#e4b48e', beak: '#3c4250', cere: '#f0c440', helmet: 0.7, wingtipDark: 0.3, tailBands: 1, tailBandColor: '#1a1a1c', mottle: 0.35, crown: 0.8, skin: '#c4673a' },
      { ...base, name: 'Female', head: '#8c94a4', throat: '#f4eee4', breast: '#e8c7a4', belly: '#efdcc2', back: '#b8673e', coverts: '#b4663e', secondaries: '#a45d38', primaries: '#3a2e28', underCoverts: '#efdcc2', underFlight: '#e2dad0', tail: '#b8673e', tailUnder: '#dcb08e', beak: '#3c4250', cere: '#f0c440', helmet: 0.7, barring: 0.5, tailBands: 8, tailBandColor: '#2c2420', mottle: 0.6 },
    ],
  },
  {
    id: 'magpie',
    name: 'Black-billed Magpie',
    latin: 'Pica hudsonia',
    blurb: 'Flashes black and white across the ranch yards of the Big Smoky Valley, its long iridescent tail streaming behind.',
    facts: [
      'The tail is longer than the whole rest of the bird.',
      'Gathers around a dead magpie and calls loudly, a "funeral" scientists still argue about.',
      'Builds a domed stick nest with a roof, sometimes used for years.',
    ],
    call: 'squawk',
    shape: {
      wingspan: 0.6, length: 0.52, bodyWidth: 0.075, bodyDepth: 0.08, neckLen: 0.02, headSize: 0.045,
      chord: 0.46, taper: 0.25, sweep: 0.04, tip: 'rounded', fingers: 4, fingerLen: 0.12,
      tailLen: 0.3, tailWidth: 0.07, tail: 'wedge', beak: 'corvid', beakLen: 0.035, legs: 'tucked', legLen: 0.07, dihedral: 0.03,
    },
    flight: { massKg: 0.18, cruise: 9, stall: 4.5, maxDive: 30, glideRatio: 5, flapHz: 4.5, flapPower: 8, climb: 1.3 },
    palettes: [
      { ...base, name: 'Adult', head: '#101014', throat: '#121216', breast: '#121216', belly: '#f4f2ee', back: '#121218', coverts: '#f2f0ea', secondaries: '#1a2a4a', primaries: '#e8e6e0', underCoverts: '#f0eee8', underFlight: '#d8d6d0', tail: '#1c3a2e', tailUnder: '#141418', beak: '#0c0c0e', cere: '#0c0c0e', legs: '#141414', eye: '#140e0a', gloss: 1, wingtipDark: 0.4, bellyBand: 0.0 },
    ],
  },
  {
    id: 'chukar',
    name: 'Chukar',
    latin: 'Alectoris chukar',
    blurb: 'Coveys call chuck-chuck-chukar from the rocky slopes of Mount Oddie, then burst downhill in a whirr of wings and glide to cover.',
    facts: [
      'Brought from Pakistan in the 1930s, now a Great Basin classic.',
      'Always runs uphill and flies downhill, which makes hunters curse.',
      'The black necklace and barred flanks blend into rhyolite rubble.',
    ],
    call: 'quail',
    shape: {
      wingspan: 0.5, length: 0.34, bodyWidth: 0.1, bodyDepth: 0.1, neckLen: 0.01, headSize: 0.045,
      chord: 0.5, taper: 0.2, sweep: 0.04, tip: 'rounded', fingers: 0, fingerLen: 0,
      tailLen: 0.08, tailWidth: 0.07, tail: 'fan', beak: 'seed', beakLen: 0.012, legs: 'tucked', legLen: 0.05, dihedral: 0.05,
    },
    flight: { massKg: 0.5, cruise: 11, stall: 6, maxDive: 30, glideRatio: 4, flapHz: 14, flapPower: 12, climb: 1.4 },
    palettes: [
      { ...base, name: 'Adult', head: '#9a9086', throat: '#f2ead8', breast: '#a6a8ac', belly: '#e6cfa4', back: '#a08a74', coverts: '#a4907a', secondaries: '#968270', primaries: '#7a6a5a', underCoverts: '#d8ccb8', underFlight: '#c0b6a6', tail: '#b0643a', tailUnder: '#a06040', beak: '#c8302a', cere: '#c8302a', legs: '#c8302a', eye: '#2a1a0c', skin: '#c8302a', helmet: 0.9, barring: 0.7, mottle: 0.2 },
    ],
  },
  {
    id: 'hornedowl',
    name: 'Great Horned Owl',
    latin: 'Bubo virginianus',
    blurb: 'Hoots from the old headframes of the Tonopah mines at dusk and hunts the washes under the darkest skies in America.',
    facts: [
      'The "horns" are just feather tufts; its hearing comes from offset ears hidden under the disk.',
      'Strong enough to take skunks, rabbits and even other owls.',
      'Often nests in abandoned mine shafts and old raven nests.',
    ],
    call: 'hoot',
    shape: {
      wingspan: 1.25, length: 0.55, bodyWidth: 0.18, bodyDepth: 0.19, neckLen: 0.01, headSize: 0.1,
      chord: 0.44, taper: 0.3, sweep: 0.06, tip: 'rounded', fingers: 0, fingerLen: 0,
      tailLen: 0.2, tailWidth: 0.15, tail: 'fan', beak: 'owl', beakLen: 0.022, legs: 'tucked', legLen: 0.11, dihedral: 0.03, disk: true, tufts: 0.75,
    },
    flight: { massKg: 1.4, cruise: 10, stall: 4.5, maxDive: 35, glideRatio: 10, flapHz: 2.4, flapPower: 7, climb: 1, nocturnal: true },
    palettes: [
      { ...base, name: 'Desert pale', head: '#8a7258', throat: '#efe8da', breast: '#c4ae8e', belly: '#d8c8ac', back: '#7a6450', coverts: '#86705a', secondaries: '#806a54', primaries: '#6e5a48', underCoverts: '#d4c2a2', underFlight: '#c8b8a0', tail: '#806a54', tailUnder: '#c4b49c', beak: '#2a2622', cere: '#2a2622', legs: '#d4c4a8', eye: '#f0b828', mottle: 0.9, barring: 0.7, tailBands: 6, tailBandColor: '#4a3c30' },
    ],
  },
  {
    id: 'burrowingowl',
    name: 'Burrowing Owl',
    latin: 'Athene cunicularia',
    blurb: 'A long-legged little owl that bobs at the mouth of a ground-squirrel burrow by the old airfield and hunts beetles under the streetlights.',
    facts: [
      'Lines its burrow with dung to attract dung beetles, its favourite snack.',
      'Mimics a rattlesnake\u2019s buzz to scare off anything poking into its burrow.',
      'Active by day as well as night, unlike most owls.',
    ],
    call: 'coo',
    shape: {
      wingspan: 0.55, length: 0.24, bodyWidth: 0.09, bodyDepth: 0.1, neckLen: 0.01, headSize: 0.06,
      chord: 0.42, taper: 0.3, sweep: 0.06, tip: 'rounded', fingers: 0, fingerLen: 0,
      tailLen: 0.08, tailWidth: 0.08, tail: 'square', beak: 'owl', beakLen: 0.012, legs: 'trailing', legLen: 0.09, dihedral: 0.03, disk: true,
    },
    flight: { massKg: 0.16, cruise: 8, stall: 3.6, maxDive: 28, glideRatio: 8, flapHz: 5, flapPower: 9, climb: 1.3, hover: true },
    palettes: [
      { ...base, name: 'Adult', head: '#8e7458', throat: '#f2ebdd', breast: '#a68a6a', belly: '#efe4d2', back: '#866c52', coverts: '#8c7258', secondaries: '#806850', primaries: '#6c5844', underCoverts: '#e6dac4', underFlight: '#d8ccb8', tail: '#806850', tailUnder: '#d6cab4', beak: '#d8cfa8', cere: '#d8cfa8', legs: '#b8b0a0', eye: '#f2d22a', mottle: 1, barring: 0.6, tailBands: 4, tailBandColor: '#efe4d2' },
    ],
  },
  {
    id: 'nighthawk',
    name: 'Common Nighthawk',
    latin: 'Chordeiles minor',
    blurb: 'Booms over the parking lot lights at Tonopah Station on summer nights, scooping insects with an enormous gape.',
    facts: [
      'Not a hawk at all but a nightjar, kin to the whip-poor-will.',
      'Nests right on bare gravel, even on flat roofs in town.',
      'Diving males make a booming roar with their wings at the bottom of the plunge.',
    ],
    call: 'trill',
    shape: {
      wingspan: 0.56, length: 0.22, bodyWidth: 0.06, bodyDepth: 0.06, neckLen: 0.0, headSize: 0.04,
      chord: 0.3, taper: 0.88, sweep: 0.3, tip: 'pointed', fingers: 0, fingerLen: 0,
      tailLen: 0.1, tailWidth: 0.07, tail: 'notched', beak: 'gape', beakLen: 0.006, legs: 'tucked', legLen: 0.015, dihedral: 0.12,
    },
    flight: { massKg: 0.05, cruise: 8, stall: 3.5, maxDive: 30, glideRatio: 8, flapHz: 5.5, flapPower: 10, climb: 1.9, nocturnal: true },
    palettes: [
      { ...base, name: 'Adult', head: '#7a6a58', throat: '#efe6d6', breast: '#8a7864', belly: '#c8b89e', back: '#6e5e4e', coverts: '#7c6c5a', secondaries: '#5e5044', primaries: '#3e342c', underCoverts: '#a8987e', underFlight: '#6a5e52', tail: '#6a5a4a', tailUnder: '#8a7a68', beak: '#2a2622', cere: '#2a2622', legs: '#5a4e44', mottle: 1, barring: 0.6, wingPanel: 0.9, tailBands: 5, tailBandColor: '#3a3028' },
    ],
  },
  {
    id: 'swift',
    name: 'White-throated Swift',
    latin: 'Aeronautes saxatalis',
    blurb: 'Screams in tight packs along the rhyolite cliffs of the San Antonio Mountains and around the mining park headframes.',
    facts: [
      'Among the fastest small birds on the continent, clocked near 300 km/h in display.',
      'Mates in mid-air, tumbling together for hundreds of metres.',
      'Roosts in deep rock crevices, clinging to the vertical stone.',
    ],
    call: 'trill',
    shape: {
      wingspan: 0.36, length: 0.17, bodyWidth: 0.045, bodyDepth: 0.045, neckLen: 0.0, headSize: 0.03,
      chord: 0.26, taper: 0.92, sweep: 0.6, tip: 'pointed', fingers: 0, fingerLen: 0,
      tailLen: 0.07, tailWidth: 0.045, tail: 'notched', beak: 'gape', beakLen: 0.004, legs: 'tucked', legLen: 0.01, dihedral: 0.02,
    },
    flight: { massKg: 0.032, cruise: 15, stall: 6, maxDive: 75, glideRatio: 9, flapHz: 9, flapPower: 14, climb: 2.1 },
    palettes: [
      { ...base, name: 'Adult', head: '#2a2622', throat: '#f2efe8', breast: '#efece4', belly: '#f0ede6', back: '#26221e', coverts: '#2a2622', secondaries: '#24201c', primaries: '#1c1a18', underCoverts: '#26221e', underFlight: '#3a3632', tail: '#24201c', tailUnder: '#2e2a26', beak: '#1a1816', cere: '#1a1816', legs: '#1a1816', rump: 0.0 },
    ],
  },
  {
    id: 'hummingbird',
    name: 'Broad-tailed Hummingbird',
    latin: 'Selasphorus platycercus',
    blurb: 'A mountain hummer with a rose-red gorget, buzzing between the penstemon blooms and the feeders on Tonopah porches.',
    facts: [
      'Wings beat around 50 times a second; it can fly backwards and upside down.',
      'Drops into torpor on cold Great Basin nights, cooling its body to save energy.',
      'The male\u2019s wingtips trill like a cricket as he flies, a sound you hear before you see him.',
    ],
    call: 'trill',
    shape: {
      wingspan: 0.115, length: 0.085, bodyWidth: 0.022, bodyDepth: 0.022, neckLen: 0.0, headSize: 0.016,
      chord: 0.28, taper: 0.8, sweep: 0.3, tip: 'pointed', fingers: 0, fingerLen: 0,
      tailLen: 0.025, tailWidth: 0.02, tail: 'fan', beak: 'needle', beakLen: 0.018, legs: 'tucked', legLen: 0.004, dihedral: 0.02,
    },
    flight: { massKg: 0.003, cruise: 9, stall: 2, maxDive: 26, glideRatio: 3, flapHz: 40, flapPower: 16, climb: 2.4, hover: true },
    palettes: [
      { ...base, name: 'Male', head: '#3e6a3a', throat: '#c8204a', breast: '#e6e4dc', belly: '#d8d4c4', back: '#3e6e3a', coverts: '#3e6e3a', secondaries: '#2e2e2a', primaries: '#262624', underCoverts: '#8a9070', underFlight: '#3a3a36', tail: '#3a4a2e', tailUnder: '#4a4a40', beak: '#141414', cere: '#141414', legs: '#141414', skin: '#d0204a', gloss: 0.9 },
    ],
  },
  {
    id: 'ferruginous',
    name: 'Ferruginous Hawk',
    latin: 'Buteo regalis',
    blurb: 'The biggest hawk in North America, pale as the playa, hunting ground squirrels and jackrabbits across the Ralston Valley.',
    facts: [
      'Feathered all the way down to its toes, like an eagle.',
      'Hunts from the ground beside burrows as often as from the air.',
      'Its rusty legs form a dark V against the white belly when seen from below.',
    ],
    call: 'scream',
    shape: {
      wingspan: 1.42, length: 0.6, bodyWidth: 0.16, bodyDepth: 0.17, neckLen: 0.02, headSize: 0.075,
      chord: 0.4, taper: 0.3, sweep: 0.14, tip: 'slotted', fingers: 5, fingerLen: 0.22,
      tailLen: 0.23, tailWidth: 0.17, tail: 'fan', beak: 'hook', beakLen: 0.04, legs: 'tucked', legLen: 0.1, dihedral: 0.12,
    },
    flight: { massKg: 1.4, cruise: 13, stall: 6.5, maxDive: 55, glideRatio: 13, flapHz: 2.5, flapPower: 6, climb: 1, soarer: true, hover: true },
    palettes: [
      { ...base, name: 'Light morph', head: '#e8e2d6', throat: '#f6f3ec', breast: '#f6f2ea', belly: '#f2ede2', back: '#a0603a', coverts: '#b06a3c', secondaries: '#8a6a52', primaries: '#4a3a2c', underCoverts: '#efe8dc', underFlight: '#f2efe8', tail: '#efe6d8', tailUnder: '#f4f0e8', beak: '#2e2a28', patagial: 0.2, carpal: 0.5, wingtipDark: 0.25, mottle: 0.3, bellyBand: 0.15 },
      { ...base, name: 'Dark morph', head: '#3a2418', throat: '#3a2418', breast: '#4a2c1c', belly: '#44281a', back: '#3a2418', coverts: '#4a2e1e', secondaries: '#3a2a20', primaries: '#2a1e16', underCoverts: '#4a2c1c', underFlight: '#e2dcd2', tail: '#d8d0c4', tailUnder: '#ece6dc', beak: '#2e2a28', wingtipDark: 0.3, mottle: 0.3 },
    ],
  },
  {
    id: 'baldeagle',
    name: 'Bald Eagle',
    latin: 'Haliaeetus leucocephalus',
    blurb: 'A rare winter visitor, perching on the power poles over the Big Smoky Valley and scavenging winter-killed jackrabbits.',
    facts: [
      'Wintering bald eagles drift south out of the northern Great Basin when lakes freeze.',
      'Takes five years to grow the iconic white head and tail.',
      'Out here it eats more carrion than fish, sharing roadkill with the ravens.',
    ],
    call: 'chitter',
    shape: {
      wingspan: 2.03, length: 0.9, bodyWidth: 0.23, bodyDepth: 0.25, neckLen: 0.06, headSize: 0.1,
      chord: 0.42, taper: 0.15, sweep: 0.06, tip: 'slotted', fingers: 6, fingerLen: 0.24,
      tailLen: 0.3, tailWidth: 0.2, tail: 'wedge', beak: 'hook', beakLen: 0.075, legs: 'tucked', legLen: 0.14, dihedral: 0.03,
    },
    flight: { massKg: 4.7, cruise: 16, stall: 8, maxDive: 60, glideRatio: 14, flapHz: 2.0, flapPower: 5, climb: 0.8, soarer: true },
    palettes: [
      { ...base, name: 'Adult', head: '#f6f4ef', throat: '#f3f1ec', breast: '#2a1d14', belly: '#26190f', back: '#2c1f15', coverts: '#3a2a1c', secondaries: '#2a1f16', primaries: '#1c140e', underCoverts: '#24170f', underFlight: '#2c241e', tail: '#f5f3ee', tailUnder: '#f2f0eb', beak: '#f0c23a', cere: '#f0c23a', eye: '#e8d48a', mottle: 0.3 },
      { ...base, name: 'Immature (mottled)', head: '#3a2c20', throat: '#4a3a2c', breast: '#5c4632', belly: '#d8c8b0', back: '#4a3624', coverts: '#5c4530', secondaries: '#3a2c20', primaries: '#22180f', underCoverts: '#d6c6ae', underFlight: '#6a5a4a', tail: '#a69684', tailUnder: '#c8b8a2', beak: '#3a3532', cere: '#8a8274', eye: '#7a5a3a', mottle: 0.9, barring: 0.2 },
    ],
  },
  {
    id: 'heron',
    name: 'Great Blue Heron',
    latin: 'Ardea herodias',
    blurb: 'Stalks the edges of the mill ponds and sewage lagoons east of town, and flaps slowly over the playa with its neck folded and legs trailing.',
    facts: [
      'Stands well over a metre tall but weighs barely two kilos.',
      'Hunts at night as well as day, thanks to eyes rich in rod cells.',
      'Will fly 30 km between desert ponds to hunt frogs and voles.',
    ],
    call: 'squawk',
    shape: {
      wingspan: 1.8, length: 1.15, bodyWidth: 0.14, bodyDepth: 0.15, neckLen: 0.09, headSize: 0.055,
      chord: 0.38, taper: 0.2, sweep: 0.05, tip: 'rounded', fingers: 0, fingerLen: 0,
      tailLen: 0.15, tailWidth: 0.12, tail: 'fan', beak: 'spear', beakLen: 0.14, legs: 'trailing', legLen: 0.6, dihedral: 0.0,
    },
    flight: { massKg: 2.2, cruise: 11, stall: 5, maxDive: 35, glideRatio: 10, flapHz: 2.0, flapPower: 6, climb: 0.8, swimmer: true },
    palettes: [
      { ...base, name: 'Adult', head: '#f0ede6', throat: '#ece8e0', breast: '#9a9ea4', belly: '#6a6e74', back: '#7c8a98', coverts: '#8492a0', secondaries: '#5e6a78', primaries: '#2e3238', underCoverts: '#6c727a', underFlight: '#4e545c', tail: '#6e7884', tailUnder: '#5e6670', beak: '#d8b040', cere: '#a8a868', legs: '#6a5c48', eye: '#e8d040', helmet: 0.5, mottle: 0.3, wingtipDark: 0.35 },
    ],
  },
];

export function speciesById(id: string): Species {
  return SPECIES.find((s) => s.id === id) ?? SPECIES[0];
}
