export function coordinateLabel([column, row]) {
  return `${String.fromCharCode(65 + column)}${row + 1}`;
}
