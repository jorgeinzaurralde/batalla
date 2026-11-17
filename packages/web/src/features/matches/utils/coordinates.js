export function coordinateLabel([column, row]) {
  return `${String.fromCharCode(65 + column)}${row + 1}`;
}

export function sameCoordinate(first, second) {
  return first[0] === second[0] && first[1] === second[1];
}
