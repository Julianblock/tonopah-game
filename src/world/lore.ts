import type * as THREE from 'three';
import type { Discoveries, Discovery } from '../ui/discoveries';
import type { CemeteryPlan } from './cemetery';
import type { Heightfield } from './heightfield';
import type { VolcanoVision } from './volcano';
import type { WaterKind } from './water';

export interface LoreState {
  pos: THREE.Vector3;
  driving: boolean;
  /** Camera under a pond. */
  underwater: boolean;
  /** Truck cab below the surface. */
  truckUnder: boolean;
  water: { name: string; kind: WaterKind } | null;
  /** Height of the actor above the water or ground. */
  agl: number;
  night: number;
  snowCover: number;
}

const TOWN = { x: -50, z: -40 };

type Spot = Discovery & { test: (s: LoreState) => boolean };

/** Summits as mapped; the summit height comes from the terrain itself. */
const PEAKS = {
  butler: { x: -209, z: 1975 },
  oddie: { x: 693, z: -523 },
  lone: { x: -23196, z: 4842 },
};

const SITES = {
  mizpah: { x: -45, z: -47 },
  dempsey: { x: -33, z: -40 },
  belvada: { x: -96, z: 13 },
  courthouse: { x: 47, z: -64 },
  clown: { x: -665, z: -468 },
  desertQueen: { x: 578, z: -219 },
  belmont: { x: 1083, z: -400 },
  brewing: { x: 124, z: 218 },
  station: { x: 1026, z: 1074 },
  museum: { x: 810, z: 892 },
  stargazing: { x: 1881, z: 1232 },
  solar: { x: -11690, z: -18896 },
  dunes: { x: -8300, z: -19400 },
  airport: { x: 12928, z: 1101 },
  goldfield: { x: -339, z: 39985 },
};

/** An egg on the learn-mode map: where it is, how to find it, and how the tour frames it. */
export interface Egg extends Discovery {
  x: number;
  z: number;
  hint: string;
  /** Tour camera orbit radius and height above the ground (m). */
  r: number;
  h: number;
  night?: boolean;
}

type Guide = { at: { x: number; z: number }; hint: string; r: number; h: number; night?: boolean };

const GUIDE: Record<string, Guide> = {
  tonopah: { at: TOWN, hint: 'Fly or drive into town.', r: 520, h: 200 },
  'jim-butler': { at: SITES.desertQueen, hint: 'Fly low over the headframes of the mining park on the hill above Main Street.', r: 220, h: 70 },
  'belmont-fire': { at: SITES.belmont, hint: 'Find the Belmont shaft on the east side of Mount Oddie.', r: 150, h: 50 },
  mizpah: { at: SITES.mizpah, hint: 'Drop below 40 m over the five-storey brick hotel on Main Street.', r: 90, h: 40 },
  'lady-in-red': { at: SITES.mizpah, hint: 'Fly into the Mizpah after dark and find your way to the fifth floor.', r: 60, h: 22, night: true },
  dempsey: { at: SITES.dempsey, hint: 'Step into the bar beside the Mizpah lobby.', r: 70, h: 20 },
  'wyatt-earp': { at: { x: -60, z: -110 }, hint: 'Walk Main Street on the wing, just above the sidewalk, north of the Mizpah.', r: 120, h: 18 },
  courthouse: { at: SITES.courthouse, hint: 'Circle the dome at the head of Brougher Avenue.', r: 80, h: 35 },
  belvada: { at: SITES.belvada, hint: 'Fly past the old State Bank building on Main Street.', r: 80, h: 30 },
  clown: { at: SITES.clown, hint: 'Pull in at the Clown Motel on the north edge of town. Go inside.', r: 90, h: 26 },
  'clown-night': { at: SITES.clown, hint: 'Visit the Clown Motel after midnight. Do not stop flying.', r: 140, h: 30, night: true },
  cemetery: { at: { x: 0, z: 0 }, hint: 'Fly low over the old cemetery beside the Clown Motel before nightfall.', r: 90, h: 28 },
  brewing: { at: SITES.brewing, hint: 'Find the brewery and BBQ on Main Street.', r: 70, h: 24 },
  station: { at: SITES.station, hint: 'Find the casino on Erie Street, by the museum.', r: 160, h: 50, night: true },
  museum: { at: SITES.museum, hint: 'Find the stamp mill and ore cars outside the museum.', r: 120, h: 40 },
  'dark-sky': { at: SITES.stargazing, hint: 'Come to the stargazing park on a clear, moonless night and climb above 300 m.', r: 600, h: 400, night: true },
  'mount-oddie': { at: PEAKS.oddie, hint: 'Land on Mount Oddie, the silver hill above the mines.', r: 300, h: 110 },
  'butler-summit': { at: PEAKS.butler, hint: 'Land on the summit of Mount Butler. Every visit replays the eruption.', r: 500, h: 200 },
  'lone-mountain': { at: PEAKS.lone, hint: 'Land on Lone Mountain, the granite island west of town.', r: 900, h: 320 },
  solar: { at: SITES.solar, hint: 'Fly out to the glowing tower in the Big Smoky Valley.', r: 1400, h: 450 },
  dunes: { at: SITES.dunes, hint: 'Skim the Crescent Dunes beyond the solar field.', r: 700, h: 120 },
  airport: { at: SITES.airport, hint: 'Find the old Army Air Field east of town on US-6.', r: 1100, h: 300 },
  f117: { at: { x: 24000, z: 6000 }, hint: 'Fly east toward the Test Range at night, high above the desert.', r: 2500, h: 900, night: true },
  goldfield: { at: SITES.goldfield, hint: 'Follow US-95 south to Tonopah\u2019s sister camp.', r: 1200, h: 360 },
  underwater: { at: { x: 1800, z: 2400 }, hint: 'Find one of Tonopah\u2019s rare ponds and dive in.', r: 60, h: 18 },
  'truck-underwater': { at: { x: 1800, z: 2400 }, hint: 'Drive the truck into a pond. There are only a few.', r: 120, h: 30 },
  'snow-camp': { at: TOWN, hint: 'Choose snow in the Sky menu and fly over town.', r: 500, h: 160 },
};

/**
 * Places and moments around Tonopah that tell a bit of its story when you find
 * them, plus the eruption vision from the top of Mount Butler.
 */
export class Lore {
  private spots: Spot[] = [];
  private visionArmed = true;
  readonly ids: string[];

  constructor(
    hf: Heightfield,
    private journal: Discoveries,
    private volcano: VolcanoVision,
    graveyard: CemeteryPlan | undefined,
  ) {
    const summit = (p: { x: number; z: number }) => {
      const h = hf.height(p.x, p.z);
      return (s: LoreState) => Math.hypot(s.pos.x - p.x, s.pos.z - p.z) < 150 && s.pos.y > h - 30 && s.pos.y < h + 220;
    };
    const near = (p: { x: number; z: number }, r: number, agl = 60) => (s: LoreState) =>
      Math.hypot(s.pos.x - p.x, s.pos.z - p.z) < r && s.agl < agl;
    const fromTown = (s: LoreState) => Math.hypot(s.pos.x - TOWN.x, s.pos.z - TOWN.z);
    const inside = (p: { x: number; z: number }, r: number, y0: number, y1: number) => (s: LoreState) => {
      const g = hf.height(p.x, p.z);
      return Math.hypot(s.pos.x - p.x, s.pos.z - p.z) < r && s.pos.y > g + y0 && s.pos.y < g + y1;
    };
    this.butlerSummit = summit(PEAKS.butler);
    this.spots = [
      {
        id: 'tonopah',
        kind: 'lore',
        kicker: 'Tonopah \u00b7 founded 1900',
        title: 'Queen of the Silver Camps',
        text: 'In May 1900 Jim Butler camped at a spring the Shoshone called Tonopah, \u201clittle water.\u201d By 1907 the camp held 10,000 people, five banks, a stock exchange and 32 saloons, and its silver had pulled all of Nevada out of a twenty-year slump.',
        test: (s) => fromTown(s) < 1100 && s.agl < 280,
      },
      {
        id: 'jim-butler',
        kind: 'lore',
        kicker: 'Desert Queen \u00b7 Mining Park',
        title: 'The burro that found a fortune',
        text: 'The story goes that Jim Butler\u2019s burro wandered off in a storm, and when he found it and picked up a rock to throw at it, the rock was heavy with silver. His Mizpah claim became one of the richest silver mines in the West: $150 million before the shafts went quiet.',
        test: near(SITES.desertQueen, 260, 90),
      },
      {
        id: 'belmont-fire',
        kind: 'lore',
        kicker: 'Belmont Mine \u00b7 February 23, 1911',
        title: 'Big Bill Murphy',
        text: 'Fire broke out 1,100 feet down in the Belmont. Cage operator Big Bill Murphy rode down into the smoke again and again, hauling miners to the surface, until he went down one last time and never came back up. Seventeen men died. Many lie in the old cemetery by the Clown Motel.',
        test: near(SITES.belmont, 140, 60),
      },
      {
        id: 'mizpah',
        kind: 'lore',
        kicker: 'Mizpah Hotel \u00b7 1907',
        title: 'The tallest building in Nevada',
        text: 'Five storeys of red brick with an electric elevator, steam heat and a bath down every hall: for twenty years the Mizpah was the grandest hotel in the state. It closed in 1999 and stood dark until 2011, when it reopened restored, down to the brass and the mahogany.',
        test: near(SITES.mizpah, 70, 45),
      },
      {
        id: 'lady-in-red',
        kind: 'secret',
        kicker: 'Mizpah Hotel \u00b7 Room 502',
        title: 'The Lady in Red',
        text: 'Rose was a working girl who met her lover in the hotel. Her jealous ex found them and stabbed and strangled her in the fifth-floor hall. Guests in 502 still wake to a woman in a red dress at the foot of the bed, and find pearls left on their pillows.',
        test: (s) => s.night > 0.5 && !s.driving && inside(SITES.mizpah, 20, 13, 21)(s),
      },
      {
        id: 'dempsey',
        kind: 'lore',
        kicker: 'Jack Dempsey Room',
        title: 'The Manassa Mauler',
        text: 'Before he was heavyweight champion of the world, a teenage Jack Dempsey worked in Tonopah as a mucker and a bouncer at the Mizpah bar, and fought a few of his first prizefights in town for a cut of the gate.',
        test: (s) => !s.driving && inside(SITES.dempsey, 14, 0, 5)(s),
      },
      {
        id: 'wyatt-earp',
        kind: 'lore',
        kicker: 'Main Street \u00b7 1902',
        title: 'Wyatt Earp\u2019s saloon',
        text: 'Twenty years after the O.K. Corral, Wyatt Earp and Josie came to Tonopah. He ran the Northern Saloon here and worked as a deputy U.S. marshal before the next strike pulled them on to Goldfield.',
        test: (s) => near({ x: -60, z: -110 }, 80, 8)(s) && !s.driving,
      },
      {
        id: 'courthouse',
        kind: 'lore',
        kicker: 'Nye County Courthouse \u00b7 1905',
        title: 'The county seat comes to town',
        text: 'So many people moved to Tonopah that Nye County moved its seat here from Belmont in 1905 and built this domed courthouse at the head of Brougher Avenue. Nye is the third-largest county in the lower 48, bigger than nine states.',
        test: near(SITES.courthouse, 60, 40),
      },
      {
        id: 'belvada',
        kind: 'lore',
        kicker: 'The Belvada \u00b7 1906',
        title: 'State Bank and Trust',
        text: 'The four-storey building began as the State Bank & Trust Company, back when Tonopah had more banks than churches. It sat empty for decades before reopening as a hotel, the Belvada, in 2019.',
        test: near(SITES.belvada, 55, 35),
      },
      {
        id: 'clown',
        kind: 'lore',
        kicker: 'Clown Motel \u00b7 1985',
        title: 'America\u2019s scariest motel',
        text: 'Siblings Leona and Leroy David opened the motel to honour their father Clarence, who collected clowns and is buried in the cemetery next door. Guests kept sending clowns. Now thousands of them stare out of the lobby shelves, and the themed rooms upstairs are named for horror films.',
        test: near(SITES.clown, 70, 30),
      },
      {
        id: 'clown-night',
        kind: 'secret',
        kicker: 'Clown Motel \u00b7 after midnight',
        title: 'They followed you',
        text: 'Something with a painted smile came out of the cemetery and chased you down Main Street. The front desk says they only come out when the neon is on. The front desk is lying.',
        test: (s) => s.night > 0.8 && near(SITES.clown, 160, 60)(s),
      },
      {
        id: 'cemetery',
        kind: 'lore',
        kicker: 'Old Tonopah Cemetery \u00b7 1901\u20131911',
        title: 'The Tonopah plague',
        text: 'Over 300 souls lie here: victims of the mysterious 1902 \u201cTonopah plague,\u201d the miners of the Belmont fire, gunfighters and children. The cemetery filled up in ten years and was closed. Some say they still walk the graves at night. Come back after dark\u2026',
        test: (s) => !!graveyard && s.night < 0.6 && Math.hypot(s.pos.x - graveyard.cx, s.pos.z - graveyard.cz) < 70 && s.agl < 40,
      },
      {
        id: 'brewing',
        kind: 'lore',
        kicker: 'Tonopah Brewing Co.',
        title: 'Beer in the silver camp',
        text: 'In 1907 Tonopah had its own brewery feeding the saloons on Main Street. The name came back to life in a brewpub and smokehouse, pouring beer brewed on site a block from the Mizpah.',
        test: near(SITES.brewing, 50, 30),
      },
      {
        id: 'station',
        kind: 'lore',
        kicker: 'Tonopah Station',
        title: 'Last stop on the T&G',
        text: 'The casino takes its name from the Tonopah & Goldfield Railroad, which ran ore trains and passengers through here from 1904 until 1947. Inside: slots, a steakhouse, and the cheapest prime rib for a hundred miles.',
        test: near(SITES.station, 140, 50),
      },
      {
        id: 'museum',
        kind: 'lore',
        kicker: 'Central Nevada Museum',
        title: 'Rusting giants',
        text: 'The yard outside is full of ore cars, a stamp mill, mining machinery and a rebuilt miner\u2019s cabin, and the museum inside holds the camp\u2019s photographs, its gambling tables and the story of the Tonopah Army Air Field.',
        test: near(SITES.museum, 110, 40),
      },
      {
        id: 'dark-sky',
        kind: 'secret',
        kicker: 'Clair Blackburn Stargazing Park \u00b7 night',
        title: 'The darkest sky in America',
        text: 'Tonopah sits under one of the darkest skies in the lower 48. On a moonless night the Milky Way is bright enough to cast a shadow, and you can see the Andromeda galaxy with your bare eyes, 2.5 million light-years away.',
        test: (s) => s.night > 0.85 && s.agl > 300 && !s.driving && Math.hypot(s.pos.x - SITES.stargazing.x, s.pos.z - SITES.stargazing.z) < 3000,
      },
      {
        id: 'mount-oddie',
        kind: 'lore',
        kicker: 'Summit \u00b7 Mount Oddie',
        title: 'A hill of silver',
        text: 'Named for Tasker Oddie, Butler\u2019s partner and later governor of Nevada. Beneath you, miles of tunnels and stopes honeycomb the hill, following veins of silver and gold laid down by hot water from the volcanoes 19 million years ago.',
        test: summit(PEAKS.oddie),
      },
      {
        id: 'butler-summit',
        kind: 'lore',
        kicker: 'Summit \u00b7 Mount Butler',
        title: 'A volcano, 16 million years ago',
        text: 'Mount Butler and Brougher Mountain are plugs of dacite lava that pushed up through the Tonopah volcanic field in the Miocene. The same heat drove the hot, mineral-laden water that left Tonopah its silver.',
        test: this.butlerSummit,
      },
      {
        id: 'lone-mountain',
        kind: 'lore',
        kicker: 'Summit \u00b7 Lone Mountain \u00b7 9,112 ft',
        title: 'An island of granite',
        text: 'Lone Mountain rises alone out of the Great Basin floor, a granite body 85 million years old. Pinyon and juniper cling to its slopes, and from the top you can see from the White Mountains of California to the Toiyabe.',
        test: summit(PEAKS.lone),
      },
      {
        id: 'solar',
        kind: 'lore',
        kicker: 'Crescent Dunes \u00b7 2015',
        title: 'A second sun',
        text: '10,347 heliostat mirrors, each the size of a garage door, track the sun and aim it at the top of a 640-foot tower, heating molten salt to 1,050 \u00b0F. The salt kept the turbines spinning after dark. Pilots flying over call it the brightest thing in Nevada.',
        test: near(SITES.solar, 1600, 600),
      },
      {
        id: 'dunes',
        kind: 'lore',
        kicker: 'Crescent Dunes',
        title: 'Singing sand',
        text: 'When the sand on the slip faces slides, the dunes boom with a low hum you can feel in your chest, one of only a few dozen singing dunes on Earth.',
        test: near(SITES.dunes, 1500, 100),
      },
      {
        id: 'airport',
        kind: 'lore',
        kicker: 'Tonopah Army Air Field \u00b7 1942',
        title: 'B-24s over the sagebrush',
        text: 'During World War II thousands of airmen trained here on B-24 Liberator bombers and P-39 fighters. The barracks are gone, but their concrete foundations still pattern the sage around the runways.',
        test: near(SITES.airport, 1600, 250),
      },
      {
        id: 'f117',
        kind: 'secret',
        kicker: 'Tonopah Test Range \u00b7 1983',
        title: 'A shape against the stars',
        text: 'For years the F-117 Nighthawk stealth fighter flew from the Test Range only at night, so no one would see it. Locals in Tonopah heard jets overhead in the dark and saw nothing at all. The Air Force admitted it existed in 1988.',
        test: (s) => s.night > 0.7 && s.pos.x > 15000 && s.agl > 400 && !s.driving,
      },
      {
        id: 'goldfield',
        kind: 'lore',
        kicker: 'Goldfield \u00b7 1902',
        title: 'The sister camp',
        text: 'Two Tonopah prospectors found gold 25 miles south in 1902, and Goldfield boomed to 20,000 people, the biggest city in Nevada. Today it\u2019s a near-ghost town with a stone courthouse, a closed grand hotel and a forest of cars stuck nose-down in the desert.',
        test: near(SITES.goldfield, 1800, 300),
      },
      {
        id: 'underwater',
        kind: 'secret',
        kicker: 'Little water',
        title: 'You found the water',
        text: 'Tonopah means \u201clittle water\u201d in Shoshone, and they meant it. The camp hauled its water in by wagon at a dollar a barrel until the pipeline came from Rye Patch in 1903.',
        test: (s) => s.underwater && !s.driving,
      },
      {
        id: 'truck-underwater',
        kind: 'secret',
        kicker: 'Achievement',
        title: 'Warranty void',
        text: 'There are about three ponds within fifty miles of Tonopah and you drove the truck into one of them. Impressive, honestly.',
        test: (s) => s.truckUnder,
      },
      {
        id: 'snow-camp',
        kind: 'secret',
        kicker: 'Winter at 6,000 feet',
        title: 'Snow on the silver camp',
        text: 'Tonopah sits higher than Denver. Winter storms dust the headframes and the sagebrush white, and January nights fall well below zero while the stars blaze overhead.',
        test: (s) => s.snowCover > 0.3 && fromTown(s) < 12000,
      },
    ];
    this.ids = this.spots.map((s) => s.id);
    if (graveyard) GUIDE.cemetery.at = { x: graveyard.cx, z: graveyard.cz };
  }

  /** Every lore spot and secret with its map position and finding hint. */
  atlas(): Egg[] {
    return this.spots.map(({ test: _t, ...d }) => {
      const g = GUIDE[d.id];
      return { ...d, x: g.at.x, z: g.at.z, hint: g.hint, r: g.r, h: g.h, night: g.night };
    });
  }

  private butlerSummit: (s: LoreState) => boolean;

  update(s: LoreState) {
    for (const spot of this.spots) {
      if (this.journal.has(spot.id) || !spot.test(s)) continue;
      const { test: _t, ...d } = spot;
      this.journal.discover(d);
    }
    // Every visit to the Mount Butler summit replays the vision.
    const atTop = this.butlerSummit(s);
    if (atTop && this.visionArmed && !this.volcano.active) {
      this.volcano.start();
      this.visionArmed = false;
      if (this.journal.has('butler-summit'))
        this.journal.whisper({ kind: 'lore', kicker: 'Mount Butler', title: 'The mountain awakens', text: 'For a moment you see it as it was, 16 million years ago.' });
    }
    if (!atTop && !this.volcano.active) this.visionArmed = true;
  }
}
