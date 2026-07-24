/** Deterministic jitter so layout is stable for a given slot. */
function jitter(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

export interface TreasureSlotLayout {
  left: number
  bottom: number
  rotate: number
}

/** Pieces per row, base → tip — builds a wide triangular heap. */
const ROW_WIDTHS = [11, 10, 9, 8, 7, 6, 5, 4, 3, 3, 2, 2, 1, 1, 1]

function rowForSlot(slot: number): { row: number; col: number; colsInRow: number } {
  let remaining = slot
  let row = 0
  while (row < ROW_WIDTHS.length) {
    const colsInRow = ROW_WIDTHS[row]!
    if (remaining < colsInRow) {
      return { row, col: remaining, colsInRow }
    }
    remaining -= colsInRow
    row += 1
  }
  // Beyond the predefined pyramid: keep adding tiny tip rows.
  const extra = remaining
  return { row, col: extra % 2, colsInRow: 1 + (extra % 2) }
}

/**
 * Fixed layout for a placement slot. Depends only on `slot`, so older
 * pieces never move when new ones are added.
 * Wide base, tapering tip — reads as a pile, not a column.
 */
export function layoutTreasureSlot(slot: number): TreasureSlotLayout {
  const { row, col, colsInRow } = rowForSlot(slot)
  const j = jitter(slot * 7 + 3)
  const j2 = jitter(slot * 7 + 19)
  const j3 = jitter(slot * 11 + 5)

  const baseWidth = ROW_WIDTHS[0]!
  // Higher rows span a smaller fraction of the pile width (centered).
  const span = 0.42 + 0.52 * (colsInRow / baseWidth)
  const xNorm = colsInRow <= 1 ? 0.5 : (col + 0.5) / colsInRow
  const left = 50 + (xNorm - 0.5) * span * 100 + (j - 0.5) * 4.5

  // Gentle mound: lower rows sit on the floor; each tier rises a little.
  const bottom = 2 + row * 5.4 + j2 * 2.8 + (j3 - 0.5) * 1.5

  return {
    left: Math.min(96, Math.max(4, left)),
    bottom: Math.min(78, Math.max(1, bottom)),
    rotate: (j - 0.5) * 42,
  }
}
