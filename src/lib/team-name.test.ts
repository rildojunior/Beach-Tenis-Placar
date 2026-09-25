import { describe, expect, it } from 'vitest'
import { splitTeamName } from './team-name'

describe('splitTeamName', () => {
  it.each([
    ['Ana e Bia', ['Ana', 'Bia']],
    ['Ana & Bia', ['Ana', 'Bia']],
    ['Ana/Bia', ['Ana', 'Bia']],
    ['Ana + Bia', ['Ana', 'Bia']],
    ['Ana, Bia', ['Ana', 'Bia']],
    ['Ana x Bia', ['Ana', 'Bia']],
    ['Ana com Bia', ['Ana', 'Bia']],
    ['Joana Silva E Maria Souza', ['Joana Silva', 'Maria Souza']]
  ])('separa "%s"', (name, expected) => {
    expect(splitTeamName(name)).toEqual(expected)
  })

  it('só separa uma vez, mantendo o resto junto', () => {
    expect(splitTeamName('Ana e Bia e Carla')).toEqual(['Ana', 'Bia e Carla'])
  })

  it('não separa dentro de palavras', () => {
    expect(splitTeamName('Alex Tavares')).toEqual(['Alex Tavares'])
    expect(splitTeamName('Emerson Leme')).toEqual(['Emerson Leme'])
  })

  it('mantém nomes sem separador ou com separador nas pontas', () => {
    expect(splitTeamName('Testando o nome do time grande')).toEqual([
      'Testando o nome do time grande'
    ])
    expect(splitTeamName('& Bia')).toEqual(['& Bia'])
    expect(splitTeamName('Time A')).toEqual(['Time A'])
  })
})
