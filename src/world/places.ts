import type { OsmData, OsmPoi } from './meta';

interface Area {
  name: string;
  x: number;
  z: number;
  r: number;
  note?: string;
}

// Local coordinates (m, x east / z south) of named landscapes without OSM points.
const AREAS: Area[] = [
  { name: 'Tonopah Historic Mining Park', x: 450, z: -260, r: 380, note: 'Headframes, hoist houses and stopes on the hill where Jim Butler struck silver' },
  { name: 'Old Tonopah Cemetery', x: -767, z: -444, r: 110, note: 'The 1901\u20131911 boneyard beside the Clown Motel' },
  { name: 'Nye County Courthouse', x: 47, z: -64, r: 45, note: 'The 1905 domed courthouse at the head of Brougher Avenue' },
  { name: 'Mount Oddie', x: 693, z: -523, r: 500, note: 'The silver hill above town, riddled with shafts' },
  { name: 'Mount Butler', x: -209, z: 1975, r: 700, note: 'Named for the man whose burro found Tonopah' },
  { name: 'Brougher Mountain', x: -819, z: 310, r: 450, note: 'Rhyolite knob on the west edge of town' },
  { name: 'Tonopah Airport', x: 12928, z: 1101, r: 1500, note: 'Built as Tonopah Army Air Field, 1942: B-24 crews trained here' },
  { name: 'Crescent Dunes Solar', x: -11690, z: -18896, r: 1700, note: '10,347 mirrors aimed at a 640-ft tower of molten salt' },
  { name: 'Crescent Dunes', x: -8300, z: -19400, r: 1800, note: 'Sand dunes that sing when they slide' },
  { name: 'Big Smoky Valley', x: -14000, z: -32000, r: 14000, note: 'Sixty miles of sagebrush and playa between the Toiyabe and the Toquima' },
  { name: 'Ralston Valley', x: 12000, z: -12000, r: 9000, note: 'Wild horse country north of the Test Range road' },
  { name: 'San Antonio Mountains', x: -331, z: -20749, r: 6500, note: 'Pinyon and juniper hills north of town' },
  { name: 'Lone Mountain', x: -23196, z: 4842, r: 5000, note: 'A 9,000-ft granite island in the Great Basin' },
  { name: 'Montezuma Range', x: -11600, z: 41400, r: 6000, note: 'Ghost camps and bristlecone ridges toward Goldfield' },
  { name: 'Clayton Valley', x: -36000, z: 32000, r: 7000, note: 'Lithium brine ponds glinting beside Silver Peak' },
  { name: 'Mud Lake', x: 3000, z: 26000, r: 6000, note: 'A dry playa south of Tonopah, white in the sun' },
  { name: 'Tonopah Test Range', x: 39500, z: 30900, r: 12000, note: 'Restricted airspace. Home of the F-117 Nighthawk, 1983\u20131992' },
  { name: 'Kawich Range', x: 32000, z: -10000, r: 9000, note: 'Remote peaks east of the Ralston Valley' },
];

const HIDDEN_ROADS = new Set([
  'Veterans Memorial Highway',
  'Grand Army of the Republic Highway',
  'North Main Street',
  'South Main Street',
  'Erie Street',
  'Tonopah\u2013Austin Road',
  'Smoky Valley Road',
  'Gabbs Pole Line Road',
  'Silver Peak Road',
  'Radar Road',
  'Belmont Road',
  'Ralston Valley Road',
  'US 95 Old',
  'Air Force Road',
  'Desert Queen Road',
  'Dynamite Road',
  'East Brougher Avenue',
  'West Brougher Avenue',
  'Burro Avenue',
]);

const ROAD_LABEL: Record<string, string> = {
  'Veterans Memorial Highway': 'US-95 \u00b7 Veterans Memorial Highway',
  'Grand Army of the Republic Highway': 'US-6 \u00b7 Grand Army of the Republic Hwy',
  'North Main Street': 'US-95 / US-6 \u00b7 Main Street',
  'South Main Street': 'US-95 / US-6 \u00b7 Main Street',
  'Erie Street': 'US-95 \u00b7 Erie Street',
  'Tonopah\u2013Austin Road': 'NV-376 \u00b7 to Austin',
  'Gabbs Pole Line Road': 'Gabbs Pole Line Road \u00b7 to the solar tower',
  'Silver Peak Road': 'NV-265 \u00b7 to Silver Peak',
  'US 95 Old': 'Old US-95 \u00b7 the Goldfield grade',
};

const POI_KIND: Record<string, string> = {
  casino: 'Casino & saloon',
  restaurant: 'Restaurant',
  fast_food: 'Drive-thru on US-95',
  cafe: 'Coffee & breakfast',
  bar: 'Saloon',
  fuel: 'Gas station',
  shop: 'Main Street shop',
  motel: 'Roadside motel',
  hotel: 'Hotel',
  museum: 'Museum',
  post_office: 'Post office',
  mineshaft: 'Historic silver mine',
  fire_station: 'Fire station',
  school: 'School',
  park: 'Park',
  viewpoint: 'Scenic viewpoint',
  information: 'Visitor information',
  place_of_worship: 'Church',
  caravan_site: 'RV park',
  social_facility: 'Community services',
};

export interface PlaceInfo {
  title: string;
  subtitle: string;
}

/** Names the landscape under the bird: businesses, peaks, ranges, towns and roads. */
export class Places {
  private roadGrid = new Map<string, { name: string; ax: number; az: number; bx: number; bz: number }[]>();
  private readonly cell = 250;
  private pois: OsmPoi[];

  constructor(private osm: OsmData) {
    for (const r of osm.roads) {
      if (!r.name || !HIDDEN_ROADS.has(r.name)) continue;
      const p = r.pts;
      for (let i = 0; i + 3 < p.length; i += 2) {
        const seg = { name: r.name, ax: p[i], az: p[i + 1], bx: p[i + 2], bz: p[i + 3] };
        const k = this.key((seg.ax + seg.bx) / 2, (seg.az + seg.bz) / 2);
        let list = this.roadGrid.get(k);
        if (!list) this.roadGrid.set(k, (list = []));
        list.push(seg);
      }
    }
    this.pois = osm.pois.filter((p) => p.name && POI_KIND[p.kind]);
  }

  private key(x: number, z: number) {
    return `${Math.floor(x / this.cell)},${Math.floor(z / this.cell)}`;
  }

  nearestRoad(x: number, z: number, maxDist: number): string | null {
    let best = maxDist;
    let name: string | null = null;
    const ci = Math.floor(x / this.cell);
    const cj = Math.floor(z / this.cell);
    for (let dj = -1; dj <= 1; dj++) {
      for (let di = -1; di <= 1; di++) {
        const list = this.roadGrid.get(`${ci + di},${cj + dj}`);
        if (!list) continue;
        for (const s of list) {
          const dx = s.bx - s.ax;
          const dz = s.bz - s.az;
          const t = Math.max(0, Math.min(1, ((x - s.ax) * dx + (z - s.az) * dz) / (dx * dx + dz * dz + 1e-6)));
          const d = Math.hypot(s.ax + dx * t - x, s.az + dz * t - z);
          if (d < best) {
            best = d;
            name = s.name;
          }
        }
      }
    }
    return name && (ROAD_LABEL[name] ?? name);
  }

  at(x: number, z: number, agl: number): PlaceInfo {
    // Low over town: name the business under the bird.
    if (agl < 160) {
      let best: OsmPoi | null = null;
      let bd = 55 + agl * 0.3;
      for (const p of this.pois) {
        const d = Math.hypot(p.x - x, p.z - z);
        if (d < bd) {
          bd = d;
          best = p;
        }
      }
      if (best) return { title: best.name, subtitle: POI_KIND[best.kind] };
    }

    let peak: { name: string; ele: number | null } | null = null;
    let pd = 650;
    for (const p of this.osm.peaks) {
      if (!p.name) continue;
      const d = Math.hypot(p.x - x, p.z - z);
      if (d < pd) {
        pd = d;
        peak = p;
      }
    }
    if (peak) {
      const sub = peak.ele ? `${peak.ele} m \u00b7 ${Math.round(peak.ele * 3.281).toLocaleString()} ft summit` : 'Great Basin summit';
      return { title: peak.name, subtitle: sub };
    }

    let area: Area | null = null;
    for (const a of AREAS) {
      if (Math.hypot(a.x - x, a.z - z) < a.r && (!area || a.r < area.r)) area = a;
    }
    const road = agl < 250 ? this.nearestRoad(x, z, 80) : null;
    // Landmarks inside town (the mining park, the cemetery) win over the town name.
    if (area && area.r < 800) return { title: area.name, subtitle: area.note ?? 'Tonopah' };

    let town: { name: string; d: number } | null = null;
    for (const p of this.osm.places) {
      const reach = p.kind === 'town' ? 1800 : p.kind === 'village' ? 1700 : 900;
      const d = Math.hypot(p.x - x, p.z - z);
      if (d < reach && (!town || d < town.d)) town = { name: p.name, d };
    }
    if (town) return { title: town.name, subtitle: road ? `Above ${road}` : town.name === 'Tonopah' ? 'Pop. 2,200 \u00b7 Elev. 6,047 ft' : 'Great Basin' };
    if (area) return { title: area.name, subtitle: road ? `Above ${road}` : area.note ?? 'Great Basin' };

    const dist = Math.hypot(x, z);
    const dir = compassWord(Math.atan2(x, -z));
    if (dist < 30000) {
      return { title: 'Nye County', subtitle: road ? `Above ${road}` : `${(dist / 1000).toFixed(0)} km ${dir} of Tonopah` };
    }
    return { title: 'Great Basin', subtitle: road ? `Above ${road}` : `${(dist / 1000).toFixed(0)} km ${dir} of Tonopah` };
  }
}

export function compassWord(rad: number): string {
  const names = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'];
  const i = Math.round(((rad / (Math.PI * 2)) * 8 + 8) % 8) % 8;
  return names[i];
}
