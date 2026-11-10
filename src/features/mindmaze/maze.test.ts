import { describe, expect, it } from 'vitest'
import { DIRS, FLOOR_H, FLOOR_W, farthestFrom, generateFloor, mulberry32, pathTo } from './maze'

describe('generateFloor', () => {
  it('is deterministic for a given seed', () => {
    const a = generateFloor(42)
    const b = generateFloor(42)
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })

  it('produces a fully connected 10x10 maze', () => {
    const { cells } = generateFloor(7)
    // BFS from entrance reaches all 100 rooms
    const seen = new Set(['0,' + (FLOOR_H - 1)])
    const q = [[0, FLOOR_H - 1]]
    while (q.length) {
      const [x, y] = q.shift()!
      for (const d of DIRS) {
        if (!cells[y][x].open[d]) continue
        const nx = x + (d === 'E' ? 1 : d === 'W' ? -1 : 0)
        const ny = y + (d === 'S' ? 1 : d === 'N' ? -1 : 0)
        if (!seen.has(`${nx},${ny}`)) {
          seen.add(`${nx},${ny}`)
          q.push([nx, ny])
        }
      }
    }
    expect(seen.size).toBe(FLOOR_W * FLOOR_H)
  })

  it('places the staircase away from the entrance', () => {
    const f = generateFloor(123)
    expect(f.stair).toEqual(farthestFrom(f.cells, 0, FLOOR_H - 1))
    expect(f.stair.x === 0 && f.stair.y === FLOOR_H - 1).toBe(false)
  })

  it('pathTo connects entrance to staircase', () => {
    const f = generateFloor(9)
    const path = pathTo(f.cells, 0, FLOOR_H - 1, f.stair.x, f.stair.y)
    expect(path[0]).toEqual({ x: 0, y: FLOOR_H - 1 })
    expect(path[path.length - 1]).toEqual({ x: f.stair.x, y: f.stair.y })
    expect(path.length).toBeGreaterThan(5)
  })
})

describe('mulberry32', () => {
  it('yields stable sequences', () => {
    const r1 = mulberry32(1)
    const r2 = mulberry32(1)
    expect([r1(), r1(), r1()]).toEqual([r2(), r2(), r2()])
  })
})
