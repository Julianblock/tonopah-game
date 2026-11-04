import { BLACK, fitText, neon, rounded, SANS, SCRIPT, SERIF, type SignSpec } from './signKit';

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

/**
 * A painted clown face centred on (x, y): white greasepaint, diamond eyes, a red
 * nose and a grin, a shock of hair and a little hat. `creep` 0..1 turns the
 * friendly motel clown into the thing in the hall at 3 a.m.
 */
function clownFace(g: CanvasRenderingContext2D, x: number, y: number, r: number, hair: string, hat: string, creep = 0) {
  g.save();
  g.translate(x, y);
  // Hair tufts either side.
  g.fillStyle = hair;
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      g.beginPath();
      g.arc(s * r * (0.95 + i * 0.12), -r * 0.15 + i * r * 0.18, r * (0.32 - i * 0.03), 0, Math.PI * 2);
      g.fill();
    }
  }
  g.fillStyle = '#f8f4ee';
  g.strokeStyle = '#1a1a1a';
  g.lineWidth = r * 0.05;
  g.beginPath();
  g.ellipse(0, 0, r, r * 1.08, 0, 0, Math.PI * 2);
  g.fill();
  g.stroke();
  // Eyes: blue diamonds, or black pits with a pinprick of light.
  for (const s of [-1, 1]) {
    g.fillStyle = creep > 0.5 ? '#1a0a0a' : '#2a6ad8';
    g.beginPath();
    g.moveTo(s * r * 0.38, -r * 0.62);
    g.lineTo(s * r * 0.55, -r * 0.3);
    g.lineTo(s * r * 0.38, r * 0.02);
    g.lineTo(s * r * 0.21, -r * 0.3);
    g.closePath();
    g.fill();
    g.fillStyle = creep > 0.5 ? '#ffe84a' : '#ffffff';
    g.beginPath();
    g.arc(s * r * 0.38, -r * 0.3, r * (creep > 0.5 ? 0.04 : 0.09), 0, Math.PI * 2);
    g.fill();
    if (creep <= 0.5) {
      g.fillStyle = '#1a1a1a';
      g.beginPath();
      g.arc(s * r * 0.38, -r * 0.28, r * 0.05, 0, Math.PI * 2);
      g.fill();
    }
  }
  // The grin: a wide red mouth, with teeth once it turns.
  g.fillStyle = '#d81a1a';
  g.beginPath();
  g.moveTo(-r * 0.7, r * 0.25);
  g.quadraticCurveTo(0, r * (1.15 + creep * 0.2), r * 0.7, r * 0.25);
  g.quadraticCurveTo(0, r * (0.6 + creep * 0.1), -r * 0.7, r * 0.25);
  g.fill();
  if (creep > 0.5) {
    g.fillStyle = '#f0e8c0';
    for (let i = -5; i <= 5; i++) {
      const tx = i * r * 0.11;
      const ty = r * 0.62 + (1 - (i / 5) ** 2) * r * 0.14;
      g.beginPath();
      g.moveTo(tx - r * 0.045, ty);
      g.lineTo(tx + r * 0.045, ty);
      g.lineTo(tx, ty + r * 0.14);
      g.closePath();
      g.fill();
    }
  }
  // Red nose with a highlight.
  g.fillStyle = '#e81a1a';
  g.beginPath();
  g.arc(0, r * 0.08, r * 0.17, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = 'rgba(255,255,255,0.6)';
  g.beginPath();
  g.arc(-r * 0.05, r * 0.03, r * 0.05, 0, Math.PI * 2);
  g.fill();
  // A little cone hat with a pompom, cocked to one side.
  g.rotate(0.25);
  g.fillStyle = hat;
  g.beginPath();
  g.moveTo(-r * 0.4, -r * 0.92);
  g.lineTo(r * 0.4, -r * 0.92);
  g.lineTo(0, -r * 1.75);
  g.closePath();
  g.fill();
  g.fillStyle = '#f8f4ee';
  g.beginPath();
  g.arc(0, -r * 1.78, r * 0.12, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

/** Clown portraits for the motel walls: kindly, sad, sly and outright wrong. */
const CLOWN_ART: SignSpec[] = [0, 1, 2, 3, 4, 5].map((i) => ({
  name: `clownArt${i}`,
  w: 240,
  h: 300,
  draw(g, w, h) {
    const bg = ['#2a4a8a', '#8a2a4a', '#2a6a4a', '#4a2a6a', '#1a1a1a', '#6a5a2a'][i];
    g.fillStyle = '#6a4a20';
    g.fillRect(0, 0, w, h);
    g.fillStyle = bg;
    g.fillRect(16, 16, w - 32, h - 32);
    const hair = ['#ff6a1a', '#3ad84a', '#e81a1a', '#2a6ad8', '#ff6a1a', '#e8c82a'][i];
    const hat = ['#e8c82a', '#2a6ad8', '#f0f0f0', '#d81a1a', '#1a1a1a', '#8a3ad8'][i];
    clownFace(g, w / 2, h * 0.56, w * 0.24, hair, hat, i >= 4 ? 1 : 0);
    if (i === 1) {
      // A painted tear.
      g.fillStyle = '#4a8ae8';
      g.beginPath();
      g.ellipse(w / 2 + w * 0.09, h * 0.62, 5, 9, 0, 0, Math.PI * 2);
      g.fill();
    }
  },
}));

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
  {
    // The Clown Motel's pole sign on US-95: a grinning clown and circus lettering.
    name: 'clownPole',
    w: 760,
    h: 520,
    draw(g, w, h) {
      g.fillStyle = '#f6f2e8';
      g.fillRect(0, 0, w, h);
      g.strokeStyle = '#d81a1a';
      g.lineWidth = 16;
      rounded(g, 12, 12, w - 24, h - 24, 30);
      g.stroke();
      // Circus-tent stripes behind the clown.
      g.save();
      rounded(g, 24, 24, 300, h - 48, 22);
      g.clip();
      for (let i = 0; i < 12; i++) {
        g.fillStyle = i % 2 ? '#e8c82a' : '#2a6ad8';
        g.beginPath();
        g.moveTo(170, h * 0.5);
        g.arc(170, h * 0.5, 400, (i / 12) * Math.PI * 2, ((i + 1) / 12) * Math.PI * 2);
        g.closePath();
        g.fill();
      }
      g.restore();
      clownFace(g, 170, h * 0.56, 105, '#ff6a1a', '#d81a1a');
      const word = (t: string, y: number, cols: string[]) => {
        g.font = `${120}px ${BLACK}`;
        const total = g.measureText(t).width;
        const sc = Math.min(1, 400 / total);
        let x = 345 + (400 - total * sc) / 2;
        for (const [i, c] of t.split('').entries()) {
          const cw = g.measureText(c).width * sc;
          g.save();
          g.translate(x + cw / 2, y + Math.sin(i * 1.3) * 8);
          g.rotate(Math.sin(i * 2.1) * 0.08);
          g.scale(sc, 1);
          g.textAlign = 'center';
          g.textBaseline = 'middle';
          g.lineWidth = 12;
          g.strokeStyle = '#1a1a1a';
          g.strokeText(c, 0, 0);
          g.fillStyle = cols[i % cols.length];
          g.fillText(c, 0, 0);
          g.restore();
          x += cw;
        }
      };
      word('CLOWN', h * 0.3, ['#d81a1a', '#2a6ad8', '#e8c82a', '#2aa84a', '#e86ab8']);
      word('MOTEL', h * 0.58, ['#2a6ad8', '#d81a1a', '#2aa84a', '#e8c82a', '#8a3ad8']);
      g.fillStyle = '#1a1a1a';
      fitText(g, 'TONOPAH · NEVADA', 545, h * 0.83, 380, (p) => `bold ${p}px ${SANS}`, 40);
    },
  },
  {
    name: 'clownVacancy',
    w: 480,
    h: 110,
    frames: 2,
    draw(g, w, h, f) {
      g.fillStyle = '#0a0606';
      g.fillRect(0, 0, w, h);
      if (f === 0) neon(g, 'VACANCY', w / 2, h * 0.52, w * 0.86, (p) => `bold ${p}px ${SANS}`, h * 0.62, '#ff2a3a');
      else {
        g.fillStyle = '#3a1a1a';
        fitText(g, 'VACANCY', w / 2, h * 0.52, w * 0.86, (p) => `bold ${p}px ${SANS}`, h * 0.62);
      }
    },
  },
  {
    name: 'clownOffice',
    w: 520,
    h: 120,
    draw(g, w, h) {
      g.fillStyle = '#d81a1a';
      g.fillRect(0, 0, w, h);
      g.fillStyle = '#fff6e0';
      fitText(g, 'OFFICE · CLOWN MUSEUM', w / 2, h * 0.54, w * 0.88, (p) => `${p}px ${BLACK}`, h * 0.5);
    },
  },
  {
    // The giant clown painted on the end wall of the room block, facing the highway.
    name: 'clownMural',
    w: 700,
    h: 760,
    cutout: true,
    draw(g, w, h) {
      // Balloons rising on strings.
      const balloons: [number, number, string][] = [[90, 120, '#d81a1a'], [170, 70, '#2a6ad8'], [600, 90, '#e8c82a'], [640, 190, '#2aa84a']];
      for (const [bx, by, c] of balloons) {
        g.strokeStyle = '#2a2a2a';
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(bx, by + 50);
        g.quadraticCurveTo(bx + 30, by + 200, w / 2 + (bx < w / 2 ? -200 : 200), h * 0.88);
        g.stroke();
        g.fillStyle = c;
        g.beginPath();
        g.ellipse(bx, by, 38, 48, 0, 0, Math.PI * 2);
        g.fill();
      }
      // Ruffled collar.
      g.fillStyle = '#f0f0f0';
      for (let i = 0; i < 9; i++) {
        g.beginPath();
        g.arc(w / 2 - 240 + i * 60, h * 0.88, 52, 0, Math.PI * 2);
        g.fill();
      }
      clownFace(g, w / 2, h * 0.55, 230, '#ff6a1a', '#2a6ad8');
      g.fillStyle = '#1a1a1a';
      fitText(g, 'WELCOME TO THE CLOWN MOTEL', w / 2, h * 0.975, w * 0.9, (p) => `${p}px ${BLACK}`, 34);
    },
  },
  ...CLOWN_ART,
];
