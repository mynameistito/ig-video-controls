export const clamp = (value: number, min: number, max: number): number =>
  Math.max(Math.min(value, max), min);

export const snapToStep = (value: number, stepSize: number): number =>
  stepSize * Math.round(value / stepSize);

export const valuesAreDifferentEnough = (
  a: number,
  b: number,
  minimumDiff = 0.01
): boolean => Math.abs(a - b) >= minimumDiff;
