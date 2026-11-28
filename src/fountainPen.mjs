// A fixed, angled elliptical nib makes stroke direction the main source of width.
const MAJOR = 5.2;
const MINOR = 2.1;
const ANGLE = -Math.PI / 4;
const STEP = 2;
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const fmt = value => Number(value.toFixed(2));

function interpolate(a, b, c, d, t) {
  const t2 = t * t, t3 = t2 * t;
  return [0, 1].map(i => 0.5 * ((2 * b[i]) + (-a[i] + c[i]) * t +
    (2 * a[i] - 5 * b[i] + 4 * c[i] - d[i]) * t2 +
    (-a[i] + 3 * b[i] - 3 * c[i] + d[i]) * t3));
}

export function fountainPenPath(points) {
  if (!points.length) return '';
  if (points.length === 1) {
    const [x, y] = points[0];
    const dx = MAJOR * Math.cos(ANGLE), dy = MAJOR * Math.sin(ANGLE);
    return `M${fmt(x + dx)} ${fmt(y + dy)}A${MAJOR} ${MINOR} -45 1 0 ${fmt(x - dx)} ${fmt(y - dy)}A${MAJOR} ${MINOR} -45 1 0 ${fmt(x + dx)} ${fmt(y + dy)}Z`;
  }
  const samples = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[Math.max(0, i - 1)], b = points[i], c = points[i + 1], d = points[Math.min(points.length - 1, i + 2)];
    const distance = Math.hypot(c[0] - b[0], c[1] - b[1]);
    const steps = Math.max(1, Math.ceil(distance / STEP));
    const speed = distance / Math.max(1, c[2] - b[2]);
    for (let j = 0; j < steps; j++) samples.push({p: interpolate(a, b, c, d, j / steps), speed});
  }
  samples.push({p: points.at(-1).slice(0, 2), speed: samples.at(-1).speed});
  let length = 0;
  const distances = samples.map((sample, i) => {
    if (i) length += Math.hypot(sample.p[0] - samples[i - 1].p[0], sample.p[1] - samples[i - 1].p[1]);
    return length;
  });
  if (length < 0.5) return fountainPenPath([points[0]]);
  const left = [], right = [];
  let previousWidth = null;
  for (let i = 0; i < samples.length; i++) {
    const before = samples[Math.max(0, i - 1)].p, after = samples[Math.min(samples.length - 1, i + 1)].p;
    const direction = Math.atan2(after[1] - before[1], after[0] - before[0]);
    const normal = direction + Math.PI / 2;
    const delta = normal - ANGLE;
    const nibWidth = Math.hypot(MAJOR * Math.cos(delta), MINOR * Math.sin(delta));
    const speedFactor = 1 - 0.14 * clamp(samples[i].speed / 1.2, 0, 1);
    const taper = 0.78 + 0.22 * clamp(Math.min(distances[i], length - distances[i]) / 10, 0, 1);
    const target = nibWidth * speedFactor * taper;
    const width = previousWidth === null ? target : previousWidth + 0.3 * (target - previousWidth);
    previousWidth = width;
    const nx = Math.cos(normal) * width, ny = Math.sin(normal) * width;
    left.push([samples[i].p[0] + nx, samples[i].p[1] + ny]);
    right.push([samples[i].p[0] - nx, samples[i].p[1] - ny]);
  }
  const start = samples[0].p, end = samples.at(-1).p;
  const first = samples[1].p, penultimate = samples.at(-2).p;
  const startAngle = Math.atan2(first[1] - start[1], first[0] - start[0]);
  const endAngle = Math.atan2(end[1] - penultimate[1], end[0] - penultimate[0]);
  const endCap = [end[0] + 3 * Math.cos(endAngle), end[1] + 3 * Math.sin(endAngle)];
  const startCap = [start[0] - 3 * Math.cos(startAngle), start[1] - 3 * Math.sin(startAngle)];
  const coord = p => `${fmt(p[0])} ${fmt(p[1])}`;
  return `M${left.map(coord).join('L')}Q${coord(endCap)} ${coord(right.at(-1))}L${right.reverse().map(coord).slice(1).join('L')}Q${coord(startCap)} ${coord(left[0])}Z`;
}
