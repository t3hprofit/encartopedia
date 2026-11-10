// The castle of King Miser the First: 5 floors, each a 10x10 maze of rooms.
// A perfect maze (recursive backtracker) — every room reachable, no loops,
// which keeps the "find the staircase" hunt honest.

export const FLOOR_W = 10
export const FLOOR_H = 10
export const FLOORS = 5

export type Dir = 'N' | 'E' | 'S' | 'W'
export const DIRS: Dir[] = ['N', 'E', 'S', 'W']

const DX: Record<Dir, number> = { N: 0, E: 1, S: 0, W: -1 }
const DY: Record<Dir, number> = { N: -1, E: 0, S: 1, W: 0 }
const OPP: Record<Dir, Dir> = { N: 'S', S: 'N', E: 'W', W: 'E' }

export interface Cell {
  open: Record<Dir, boolean>
}

export interface Floor {
  cells: Cell[][] // [y][x]
  stair: { x: number; y: number }
}

/** Deterministic RNG so a saved game regenerates the same castle. */
export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function generateFloor(seed: number): Floor {
  const rand = mulberry32(seed)
  const cells: Cell[][] = Array.from({ length: FLOOR_H }, () =>
    Array.from({ length: FLOOR_W }, () => ({ open: { N: false, E: false, S: false, W: false } })),
  )
  // recursive backtracker
  const stack: [number, number][] = [[0, FLOOR_H - 1]] // start bottom-left
  const visited = new Set<string>(['0,' + (FLOOR_H - 1)])
  while (stack.length) {
    const [x, y] = stack[stack.length - 1]
    const options = DIRS.filter((d) => {
      const nx = x + DX[d]
      const ny = y + DY[d]
      return nx >= 0 && nx < FLOOR_W && ny >= 0 && ny < FLOOR_H && !visited.has(`${nx},${ny}`)
    })
    if (!options.length) {
      stack.pop()
      continue
    }
    const d = options[Math.floor(rand() * options.length)]
    const nx = x + DX[d]
    const ny = y + DY[d]
    cells[y][x].open[d] = true
    cells[ny][nx].open[OPP[d]] = true
    visited.add(`${nx},${ny}`)
    stack.push([nx, ny])
  }
  // staircase: the farthest room from the entrance
  const far = farthestFrom(cells, 0, FLOOR_H - 1)
  return { cells, stair: far }
}

export function farthestFrom(cells: Cell[][], sx: number, sy: number): { x: number; y: number } {
  const dist = new Map<string, number>([[`${sx},${sy}`, 0]])
  const q: [number, number][] = [[sx, sy]]
  let best = { x: sx, y: sy, d: 0 }
  while (q.length) {
    const [x, y] = q.shift()!
    const d = dist.get(`${x},${y}`)!
    if (d > best.d) best = { x, y, d }
    for (const dir of DIRS) {
      if (!cells[y][x].open[dir]) continue
      const nx = x + DX[dir]
      const ny = y + DY[dir]
      if (!dist.has(`${nx},${ny}`)) {
        dist.set(`${nx},${ny}`, d + 1)
        q.push([nx, ny])
      }
    }
  }
  return { x: best.x, y: best.y }
}

/** Shortest path from (sx,sy) to (tx,ty) — lit up by a match. */
export function pathTo(cells: Cell[][], sx: number, sy: number, tx: number, ty: number): { x: number; y: number }[] {
  const prev = new Map<string, string | null>([[`${sx},${sy}`, null]])
  const q: [number, number][] = [[sx, sy]]
  while (q.length) {
    const [x, y] = q.shift()!
    if (x === tx && y === ty) break
    for (const dir of DIRS) {
      if (!cells[y][x].open[dir]) continue
      const nx = x + DX[dir]
      const ny = y + DY[dir]
      if (!prev.has(`${nx},${ny}`)) {
        prev.set(`${nx},${ny}`, `${x},${y}`)
        q.push([nx, ny])
      }
    }
  }
  const path: { x: number; y: number }[] = []
  let cur: string | null = `${tx},${ty}`
  while (cur) {
    const [x, y] = cur.split(',').map(Number)
    path.unshift({ x, y })
    cur = prev.get(cur) ?? null
  }
  return path
}

export const step = (x: number, y: number, d: Dir) => ({ x: x + DX[d], y: y + DY[d] })
