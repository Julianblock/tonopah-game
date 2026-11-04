import { fitText, SANS, SERIF, type SignSpec } from './signKit';

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
];
