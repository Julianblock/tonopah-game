import type { CemeteryPlan } from './cemetery';
import type { OsmData } from './meta';

export interface Destination {
  id: string;
  label: string;
  blurb: string;
}

export const DESTINATIONS: Destination[] = [
  {
    id: 'town',
    label: 'US-95 into Tonopah',
    blurb: 'Roll in from the north past the welcome sign and Love\u2019s, down Main Street into the old silver camp.',
  },
  {
    id: 'main',
    label: 'Main Street & the Mizpah',
    blurb: 'The five-storey red-brick Mizpah Hotel of 1907, the Mizpah Club, the Belvada and the old bank buildings of the camp\u2019s boom years.',
  },
  {
    id: 'clown',
    label: 'The Clown Motel',
    blurb: 'America\u2019s scariest motel: two thousand clowns in the lobby, next door to the miners\u2019 cemetery. Come back after dark. If you dare.',
  },
  {
    id: 'cemetery',
    label: 'Old Tonopah Cemetery',
    blurb: 'Plague victims, Belmont fire miners and gunfighters, 1901\u20131911, behind a wire fence beside the Clown Motel. Please respect the dead after dark.',
  },
  {
    id: 'overlook',
    label: 'Mount Oddie overlook',
    blurb: 'Above the mining park: the headframes below, the whole town spilling down the gulch, and the Big Smoky Valley beyond.',
  },
  {
    id: 'miningpark',
    label: 'Historic Mining Park',
    blurb: 'Desert Queen Road climbs to the headframes of the Desert Queen, the Mizpah, the Silver Top and the Red Plume, on the claim Jim Butler staked in 1900.',
  },
  {
    id: 'station',
    label: 'Tonopah Station',
    blurb: 'The casino, hotel and RV park on Erie Street, beside the Central Nevada Museum and the old Tonopah & Goldfield railroad yard.',
  },
  {
    id: 'stargazing',
    label: 'Stargazing Park',
    blurb: 'The darkest skies in the lower 48. Come at night and look up: the Milky Way casts shadows here.',
  },
  {
    id: 'solar',
    label: 'Crescent Dunes Solar Tower',
    blurb: 'Ten thousand mirrors in a 3-km circle, all aimed at a 640-ft tower that glows like a second sun.',
  },
  { id: 'dunes', label: 'Crescent Dunes', blurb: 'Singing sand dunes at the foot of the San Antonio Mountains, beyond the solar field.' },
  {
    id: 'austin',
    label: 'NV-376 up the Big Smoky',
    blurb: 'The road north to Austin: sixty miles of sagebrush between the Toiyabe and Toquima ranges, the snow on Arc Dome on the skyline.',
  },
  {
    id: 'testrange',
    label: 'US-6 toward the Test Range',
    blurb: 'East past the old Army Air Field, toward the restricted range where the F-117 Nighthawk flew in secret by night.',
  },
  { id: 'airport', label: 'Tonopah Airport', blurb: 'The WWII Army Air Field, where B-24 Liberator crews trained. Ruins of barracks still dot the sage.' },
  {
    id: 'goldfield',
    label: 'South to Goldfield',
    blurb: 'US-95 drops past Mud Lake toward Goldfield, Tonopah\u2019s rowdy sister camp, and the International Car Forest of the Last Church.',
  },
];

const ROAD_ANCHORS: Record<string, [string, number, number]> = {
  town: ['North Main Street', -1396, -956],
  main: ['North Main Street', -150, -240],
  clown: ['North Main Street', -480, -430],
  miningpark: ['Desert Queen Road', 900, -135],
  station: ['Erie Street', 900, 900],
  austin: ['Tonopah\u2013Austin Road', 9150, -900],
  testrange: ['Grand Army of the Republic Highway', 4615, -69],
  goldfield: ['Veterans Memorial Highway', -750, 31637],
};

/** Where each anchored drive should face: toward this point. */
const FACING: Record<string, [number, number]> = {
  town: [0, 0],
  main: [-45, -47],
  clown: [-1700, -1065],
  miningpark: [578, -219],
  station: [1300, 2000],
  austin: [11404, -9181],
  testrange: [19282, -1246],
  goldfield: [-339, 39985],
};

/** Off-road lookouts: position and the point to face. */
const LOOKOUTS: Record<string, [number, number, number, number]> = {
  overlook: [640, -360, -60, -30],
  stargazing: [1870, 1215, 1870, -3000],
  solar: [-9900, -17100, -11690, -18896],
  dunes: [-7300, -18300, -8300, -19400],
  airport: [12300, 300, 12928, 1101],
};

export interface Spot {
  x: number;
  z: number;
  psi: number;
  /** On a two-way road: keep right of the centreline. */
  road: boolean;
}

/** Point on the matching roads closest to (ax, az), with the segment heading. */
function nearestOn(osm: OsmData, match: (name: string, kind: string) => boolean, ax: number, az: number) {
  let best = Infinity;
  let spot: { x: number; z: number; dx: number; dz: number } | null = null;
  for (const r of osm.roads) {
    if (!match(r.name, r.kind)) continue;
    const p = r.pts;
    for (let i = 0; i + 3 < p.length; i += 2) {
      const ex = p[i + 2] - p[i], ez = p[i + 3] - p[i + 1];
      const l2 = ex * ex + ez * ez;
      if (l2 < 1) continue;
      const t = Math.max(0, Math.min(1, ((ax - p[i]) * ex + (az - p[i + 1]) * ez) / l2));
      const x = p[i] + ex * t, z = p[i + 1] + ez * t;
      const d = Math.hypot(ax - x, az - z);
      if (d < best) {
        best = d;
        const l = Math.sqrt(l2);
        spot = { x, z, dx: ex / l, dz: ez / l };
      }
    }
  }
  return spot;
}

export function resolveDestination(id: string, osm: OsmData, cemeteries: CemeteryPlan[]): Spot | null {
  const anchor = ROAD_ANCHORS[id];
  if (anchor) {
    const s = nearestOn(osm, (n) => n === anchor[0], anchor[1], anchor[2]);
    if (!s) return null;
    const [fx, fz] = FACING[id];
    const sg = s.dx * (fx - s.x) + s.dz * (fz - s.z) >= 0 ? 1 : -1;
    return { x: s.x, z: s.z, psi: Math.atan2(s.dx * sg, s.dz * sg), road: true };
  }
  const look = LOOKOUTS[id];
  if (look) {
    const [x, z, fx, fz] = look;
    return { x, z, psi: Math.atan2(fx - x, fz - z), road: false };
  }
  if (id === 'cemetery') {
    const c = cemeteries.find((p) => p.name === 'Tonopah Cemetery');
    if (!c?.gate) return null;
    const [ox, oz] = c.out;
    return { x: c.gate[0] + ox * 45, z: c.gate[1] + oz * 45, psi: Math.atan2(-ox, -oz), road: false };
  }
  return null;
}
