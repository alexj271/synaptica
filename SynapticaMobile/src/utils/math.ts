export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const average = (numbers: number[]): number => {
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
};
