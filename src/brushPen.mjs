// Simulate a flexible brush tip using movement alone, including on touch screens.
const BRUSH_RADIUS = 5.2;
const DOT_RADIUS = 3.2;
const STEP = 2;
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const smoothstep = value => value * value * (3 - 2 * value);
const fmt = value => Number(value.toFixed(2));

function interpolate(a, b, c, d, t) {
  const t2 = t * t, t3 = t2 * t;
  return [0, 1].map(i => 0.5 * ((2 * b[i]) + (-a[i] + c[i]) * t +
    (2 * a[i] - 5 * b[i] + 4 * c[i] - d[i]) * t2 +
    (-a[i] + 3 * b[i] - 3 * c[i] + d[i]) * t3));
}

export function brushPenPath(points) {
  if (!points.length) return '';
  if (points.length === 1) {
    const [x, y] = points[0];
    return `M${fmt(x + DOT_RADIUS)} ${fmt(y)}A${DOT_RADIUS} ${DOT_RADIUS} 0 1 0 ${fmt(x - DOT_RADIUS)} ${fmt(y)}A${DOT_RADIUS} ${DOT_RADIUS} 0 1 0 ${fmt(x + DOT_RADIUS)} ${fmt(y)}Z`;
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
  if (length < 0.5) return brushPenPath([points[0]]);
  const left = [], right = [];
  let previousWidth = null;
  for (let i = 0; i < samples.length; i++) {
    const before = samples[Math.max(0, i - 1)].p, after = samples[Math.min(samples.length - 1, i + 1)].p;
    const direction = Math.atan2(after[1] - before[1], after[0] - before[0]);
    const normal = direction + Math.PI / 2;
    // The downward bias is gentle; speed supplies most of the brush variation.
    const directionFactor = 0.94 + 0.12 * Math.max(0, Math.sin(direction));
    const speedFactor = 1.27 - 0.55 * clamp(samples[i].speed / 1.5, 0, 1);
    const target = BRUSH_RADIUS * directionFactor * speedFactor;
    const smoothWidth = previousWidth === null ? target : previousWidth + 0.24 * (target - previousWidth);
    previousWidth = smoothWidth;
    const taperDistance = Math.min(14, length * 0.28);
    const tipWidth = length < 16 ? 0.68 : 0.36;
    const taperProgress = clamp(Math.min(distances[i], length - distances[i]) / taperDistance, 0, 1);
    const width = smoothWidth * (tipWidth + (1 - tipWidth) * smoothstep(taperProgress));
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
