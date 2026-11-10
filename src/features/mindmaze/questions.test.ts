import { describe, expect, it } from 'vitest'
import { buildQuestion, scoreFor } from './questions'
import { mulberry32 } from './maze'

const pool = [
  { title: 'Paris', description: 'capital and largest city of France' },
  { title: 'Lyon', description: 'city in Auvergne-Rhône-Alpes, France' },
  { title: 'Marseille', description: 'city in Provence-Alpes-Côte d’Azur, France' },
  { title: 'Bordeaux', description: 'city in Nouvelle-Aquitaine, France' },
  { title: 'Lille', description: 'city in Hauts-de-France, France' },
]

describe('buildQuestion', () => {
  it('builds a 4-choice question with exactly one correct answer', () => {
    const q = buildQuestion(pool, 2, mulberry32(5))!
    expect(q.choices).toHaveLength(4)
    expect(q.choices.filter((c) => c.isCorrect)).toHaveLength(1)
    expect(q.base).toBe(500)
  })
  it('returns null when the pool is too thin', () => {
    expect(buildQuestion(pool.slice(0, 3), 1, mulberry32(1))).toBeNull()
  })
})

describe('scoreFor', () => {
  it('gives full points for an instant first-attempt answer', () => {
    expect(scoreFor(1000, 0, 1)).toBe(1000)
  })
  it('gives nothing after 60 seconds', () => {
    expect(scoreFor(1000, 60000, 1)).toBe(0)
    expect(scoreFor(1000, 90000, 1)).toBe(0)
  })
  it('halves second-attempt scores', () => {
    expect(scoreFor(1000, 0, 2)).toBe(500)
  })
  it('decays linearly', () => {
    expect(scoreFor(1000, 30000, 1)).toBe(500)
  })
})
