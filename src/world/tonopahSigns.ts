import { fitText, neon, SANS, SCRIPT, SERIF, type SignSpec } from './signKit';

/** Marquee bulbs around a sign's edge. */
function bulbs(g: CanvasRenderingContext2D, w: number, h: number, inset: number, pitch: number, color: string, frame = 0) {
  const pts: [number, number][] = [];
  for (let x = inset; x <= w - inset; x += pitch) pts.push([x, inset], [x, h - inset]);
  for (let y = inset + pitch; y < h - inset; y += pitch) pts.push([inset, y], [w - inset, y]);
  pts.forEach(([x, y], i) => {
    g.fillStyle = (i + frame) % 3 === 0 ? '#fff6d8' : color;
    g.beginPath();
    g.arc(x, y, pitch * 0.28, 0, Math.PI * 2);
    g.fill();
  });
}

/** Tonopah's signs, from the highway welcome boards to the lettering on the Mizpah. */
export const TONOPAH_SIGNS: SignSpec[] = [
  {
    // The brown Nevada town board on US-95.
    name: 'welcome',
    w: 640,
    h: 260,
    draw(g, w, h) {
      g.fillStyle = '#5a3a22';
      g.fillRect(0, 0, w, h);
      g.strokeStyle = '#f0e2c0';
      g.lineWidth = 8;
      g.strokeRect(14, 14, w - 28, h - 28);
      g.fillStyle = '#f0e2c0';
      fitText(g, 'WELCOME TO', w / 2, h * 0.24, w * 0.6, (p) => `bold ${p}px ${SANS}`, h * 0.13);
      fitText(g, 'TONOPAH', w / 2, h * 0.5, w * 0.86, (p) => `bold ${p}px ${SERIF}`, h * 0.32);
      fitText(g, 'QUEEN OF THE SILVER CAMPS · EST. 1900', w / 2, h * 0.78, w * 0.84, (p) => `bold ${p}px ${SANS}`, h * 0.1);
    },
  },
  {
    // The Mizpah's vertical blade: red neon letters stacked down a black can, bulbs chasing round it.
    name: 'mizpahBlade',
    w: 180,
    h: 980,
    draw(g, w, h) {
      g.fillStyle = '#140808';
      g.fillRect(0, 0, w, h);
      g.strokeStyle = '#c8a050';
      g.lineWidth = 6;
      g.strokeRect(8, 8, w - 16, h - 16);
      bulbs(g, w, h, 20, 34, '#ffd27a');
      const letters = 'MIZPAH';
      letters.split('').forEach((c, i) => neon(g, c, w / 2, 90 + i * 128, w * 0.7, (p) => `bold ${p}px ${SERIF}`, 128, '#ff2a2a'));
      neon(g, 'HOTEL', w / 2, h - 82, w * 0.72, (p) => `bold ${p}px ${SANS}`, 46, '#ffe08a');
    },
  },
  {
    // Marquee canopy front over the Main Street doors.
    name: 'mizpahMarquee',
    w: 900,
    h: 150,
    draw(g, w, h) {
      g.fillStyle = '#1a0a08';
      g.fillRect(0, 0, w, h);
      bulbs(g, w, h, 14, 30, '#ffd27a');
      neon(g, 'MIZPAH HOTEL', w / 2, h * 0.42, w * 0.8, (p) => `bold ${p}px ${SERIF}`, h * 0.48, '#ff3a2a');
      g.fillStyle = '#e8d8b0';
      fitText(g, 'EST. 1907 · CASINO · RESTAURANT · BAR', w / 2, h * 0.8, w * 0.7, (p) => `bold ${p}px ${SANS}`, h * 0.14);
    },
  },
  {
    // Faded painted ghost sign high on the Brougher Avenue brick.
    name: 'mizpahWall',
    w: 1400,
    h: 260,
    cutout: true,
    draw(g, w, h) {
      g.globalAlpha = 0.78;
      g.fillStyle = '#ece2c8';
      fitText(g, 'MIZPAH HOTEL', w / 2, h * 0.4, w * 0.95, (p) => `bold ${p}px ${SERIF}`, h * 0.62);
      fitText(g, 'STEAM HEAT · ELECTRIC ELEVATOR · BATHS', w / 2, h * 0.85, w * 0.8, (p) => `bold ${p}px ${SANS}`, h * 0.16);
    },
  },
  {
    name: 'dempsey',
    w: 700,
    h: 140,
    draw(g, w, h) {
      g.fillStyle = '#1a0c06';
      g.fillRect(0, 0, w, h);
      g.strokeStyle = '#c8a050';
      g.lineWidth = 5;
      g.strokeRect(8, 8, w - 16, h - 16);
      g.fillStyle = '#e8c878';
      fitText(g, 'Jack Dempsey Room', w / 2, h * 0.52, w * 0.85, (p) => `${p}px ${SCRIPT}`, h * 0.62);
    },
  },
  {
    name: 'mizpahDesk',
    w: 520,
    h: 110,
    draw(g, w, h) {
      g.fillStyle = '#2a1408';
      g.fillRect(0, 0, w, h);
      g.fillStyle = '#d8b060';
      fitText(g, 'FRONT DESK · REGISTRATION', w / 2, h * 0.5, w * 0.86, (p) => `bold ${p}px ${SERIF}`, h * 0.4);
    },
  },
];
