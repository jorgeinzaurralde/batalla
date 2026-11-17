// La API marca como 'sunk' solo el disparo que hundió el barco; las demás
// casillas de ese barco quedan como 'hit'. Para el tablero queremos ver el
// barco entero hundido, así que acá se calculan todas sus casillas.

const key = ([column, row]) => `${column},${row}`;

// Con la flota a la vista (la propia, o la del rival al terminar), un barco
// está hundido si todas sus casillas recibieron un disparo.
function sunkCellsFromFleet(shots, fleet) {
  const hitCells = new Set(
    shots
      .filter((shot) => shot.result === 'hit' || shot.result === 'sunk')
      .map((shot) => key(shot.coordinate))
  );

  const sunk = new Set();

  for (const cells of Object.values(fleet)) {
    if (cells.length > 0 && cells.every((cell) => hitCells.has(key(cell)))) {
      cells.forEach((cell) => sunk.add(key(cell)));
    }
  }

  return sunk;
}

// Con la flota del rival oculta, se deduce: el barco hundido es la línea de
// casillas tocadas que sigue al disparo 'sunk', en horizontal o en vertical.
// Si las dos direcciones son posibles, se elige la que coincide con el largo
// de algún barco que todavía no se hundió.
function sunkCellsFromShots(shots, shipSizes) {
  const results = new Map(
    shots.map((shot) => [key(shot.coordinate), shot.result])
  );
  const sunk = new Set();
  const remaining = [...shipSizes];

  const isFreeHit = (cell) =>
    results.get(key(cell)) === 'hit' && !sunk.has(key(cell));

  function line([column, row], dc, dr) {
    const cells = [];
    let cell = [column + dc, row + dr];

    while (isFreeHit(cell)) {
      cells.push(cell);
      cell = [cell[0] + dc, cell[1] + dr];
    }

    return cells;
  }

  for (const shot of shots) {
    if (shot.result !== 'sunk') {
      continue;
    }

    const at = shot.coordinate;
    const horizontal = [...line(at, -1, 0), ...line(at, 1, 0)];
    const vertical = [...line(at, 0, -1), ...line(at, 0, 1)];

    const fits = (cells) => remaining.includes(cells.length + 1);
    let chosen;

    if (fits(horizontal) && !fits(vertical)) {
      chosen = horizontal;
    } else if (fits(vertical) && !fits(horizontal)) {
      chosen = vertical;
    } else {
      chosen = horizontal.length >= vertical.length ? horizontal : vertical;
    }

    sunk.add(key(at));
    chosen.forEach((cell) => sunk.add(key(cell)));

    const index = remaining.indexOf(chosen.length + 1);
    if (index >= 0) {
      remaining.splice(index, 1);
    }
  }

  return sunk;
}

// Devuelve los disparos con 'sunk' en todas las casillas de cada barco
// hundido. shipSizes solo se usa cuando la flota no se conoce.
export function markSunkShips(shots, { fleet = null, shipSizes = [] } = {}) {
  const sunk = fleet
    ? sunkCellsFromFleet(shots, fleet)
    : sunkCellsFromShots(shots, shipSizes);

  return shots.map((shot) =>
    shot.result === 'hit' && sunk.has(key(shot.coordinate))
      ? { ...shot, result: 'sunk' }
      : shot
  );
}
