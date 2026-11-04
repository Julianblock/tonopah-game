# Tonopah, Nevada

Fly as a desert bird over Tonopah, the silver camp halfway between Las Vegas and Reno on US-95, under the darkest skies in the lower 48. Fly into the Mizpah Hotel, check in at the Clown Motel, and stay out of the cemetery after dark.

**Play:** https://julianblock.github.io/tonopah-game/

The terrain, land cover, roads, buildings and trees all come from real survey data. The high desert changes with the season and time of day: snow on the headframes in January, globemallow on the hills in May, white-hot August afternoons, and at night the neon of the Mizpah, the Clown Motel's pole sign and the Milky Way blazing overhead.

## Features

- **Real terrain.** USGS elevation and aerial imagery cover Tonopah in high detail, with the San Antonio Mountains, Mount Butler, Lone Mountain, the Crescent Dunes and the Big Smoky Valley stretching to the horizon. The horizon follows the curvature of the Earth.
- **Physically based sky.** Rayleigh and Mie atmospheric scattering, with sun and moon positions calculated for the real date and place. Includes moon phases, one of the darkest Milky Ways in America, volumetric clouds and high-desert haze, with the faint glow of Las Vegas, Reno and the Tonopah Test Range on the horizon.
- **The Mizpah Hotel, inside and out.** Five storeys of 1907 red brick at Main and Brougher, with the neon blade sign, the bulb marquee and the painted sign on the side wall. Fly through the front doors into the lobby: mosaic floor, pressed-tin ceiling, chandeliers, the front desk and the slot banks. Then the Jack Dempsey Room bar, the switchback stairs, the cage elevator, the corridors on every floor and thirty-six furnished guest rooms, lit window by window at night.
- **The Lady in Red.** Room 502 is kept as a shrine to the Mizpah's ghost, with red velvet, roses, candles, her portrait and her pearls on the pillow. After dark she walks the fifth-floor hall to her room and stands at the window looking down on Main Street. Get too close and she's gone.
- **The Clown Motel, inside and out.** The pole sign on US-95, the office with more than a thousand clowns on its shelves and in glass cases, and a two-storey block of twenty-eight furnished rooms along the old cemetery fence, with a giant clown painted on the end wall. Ten of the doors stand open on the horror rooms: red balloons and a storm drain, the hexagon carpet and the twins, jack-o'-lanterns and a masked man, a TV on a dead channel, the doll with the knife, the summer-camp mask, the shower curtain and the stuffed birds, the possession room, the striped sweater and the bladed glove, and the puppet on its tricycle.
- **Killer clowns.** At night the clowns climb out of the Old Tonopah Cemetery and come after you, bird or truck, rising to your height and lunging when they get close, each trailing a red balloon. Outrun them past the edge of town, or let one catch you.
- **Sixteen high-desert birds**, each with researched plumage variants and its own flight model: red-tailed hawk, common raven, golden eagle, turkey vulture, prairie falcon, American kestrel, black-billed magpie, chukar, great horned owl, burrowing owl, common nighthawk, white-throated swift, broad-tailed hummingbird, ferruginous hawk, bald eagle and great blue heron.
- **Vegetation.** Plants detected from the imagery around town: big sagebrush, shadscale, rabbitbrush and Mormon tea in the valleys, pinyon and juniper on the ranges, cottonwoods and poplars in town.
- **Wildlife.** Wild horses of the Stone Cabin and Montezuma Peak herds, mule deer on the pinyon slopes, pronghorn on the flats, wild burros, coyotes and black-tailed jackrabbits. Overhead, ravens tumble, pinyon jays swirl over the woodland and flocks pass through on migration, all varying by season.
- **Roads and traffic.** Cars, pickups and big rigs drive the real road network, including US-95 and US-6 through town. Barbed-wire range fences line the highways. Headlights and taillights show at night.
- **The cemetery.** The Old Tonopah Cemetery, 1901 to 1911, with its wooden headboards and picket pens beside the Clown Motel. After dark, miners who died in the Belmont fire walk the graves with their carbide lamps.
- **Places.** The menu's Places tab starts you rolling into town on US-95, on Main Street, at the Clown Motel, at the cemetery gate, above the mining park, at Tonopah Station, at the stargazing park, over the Crescent Dunes solar tower, on the singing Crescent Dunes, on the road to Austin, over the Test Range, at the old Army Air Field or down the highway in Goldfield.
- **Weather.** Crystal-clear, clear, haze, scattered cloud, overcast, dust storms, rain, thunderstorms and snow. Rain darkens the ground; snow dusts the sagebrush and melts in the sun. Lightning lights up the desert and its thunder arrives late by the strike's distance.
- **Drive a pickup.** Swap between bird and truck at any time. The truck has a first-person cockpit with live gauges, headlights, wipers and dust trails. It grips on asphalt, slides on gravel and crawls over rock.
- **Easter eggs and lore.** About thirty discoveries are hidden around Tonopah, with a card for each one you find: Jim Butler and the burro that found the silver, the Belmont mine fire, Jack Dempsey tending bar at the Mizpah, Wyatt Earp, the Clown Motel's founding, the F-117s that flew in secret from the Test Range and more. Find the Lady in Red, let the clowns catch you, and stand on the summit of Mount Butler to see it erupt as it did 16 million years ago.
- **Procedural sound.** Wind rises with airspeed and whistles in a stoop, and wingbeats are audible. The ambience follows the time, season and terrain, and turns cold when something is haunting you.

## Controls

| Key | Action |
| --- | --- |
| W / S | Dive / climb |
| A / D | Bank |
| Q / E | Rudder |
| Space | Flap; take off when perched |
| Shift | Tuck and stoop |
| F / Ctrl | Flare, land |
| C | Cycle cameras |
| V | Call |
| M | Mute |
| H | Help |
| G | Switch between bird and truck |
| Esc | Menu |

Driving:

| Key | Action |
| --- | --- |
| W / S | Throttle / brake and reverse |
| A / D | Steer |
| Space | Handbrake |
| Shift | Boost |
| Mouse | Look around |
| C | Cockpit, chase or hood camera |
| L | Headlights |
| V | Horn |

On phones and tablets, on-screen controls replace the keyboard: a floating thumb-stick on the left, action buttons on the right, and buttons along the top for the menu, camera, bird/truck swap and help. The game goes full screen in landscape where the browser allows it, and you can add it to your home screen as an app. Mobile uses lighter rendering automatically; add `?hq` to the URL for full quality, or `?touch` to try the touch controls on a desktop.

## Development

```sh
npm install
npm run dev       # http://localhost:5173
npm run build
npm run data      # rebuild public/data from USGS / USDA / OSM sources
```

Debug URL parameters: `?fly` skips the menu, `?drive` starts in the truck, `?weather=storm` (or `rain`, `snow`, `dust`, …) and `?time=night` pick conditions, `?place=town` (or `main`, `clown`, `cemetery`, `overlook`, `miningpark`, `station`, `stargazing`, `solar`, `austin`, `testrange`, `goldfield`) picks the start point, and `?free&cam=x,y,z,yaw,pitch` starts a free camera.

Every push to `main` builds and deploys to GitHub Pages through `.github/workflows/pages.yml`.

## Data sources

- Elevation: AWS Terrain Tiles (USGS 3DEP / SRTM)
- Imagery: USGS National Map imagery
- Land cover: USDA NASS Cropland Data Layer
- Roads, buildings, landmarks and masts: © OpenStreetMap contributors
