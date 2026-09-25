/**
 * Separa o nome de uma dupla nos dois jogadores, para mostrar um em cada linha.
 *
 * Reconhece "Ana e Bia", "Ana & Bia", "Ana / Bia", "Ana + Bia", "Ana, Bia",
 * "Ana x Bia" e "Ana com Bia". Sem separador, devolve o nome inteiro.
 */
const SEPARATOR = /\s*[&/+,]\s*|\s+(?:e|x|com)\s+/i

export function splitTeamName(name: string): string[] {
  const trimmed = name.trim()
  const match = SEPARATOR.exec(trimmed)
  if (!match) return [trimmed]

  const first = trimmed.slice(0, match.index).trim()
  const second = trimmed.slice(match.index + match[0].length).trim()
  if (!first || !second) return [trimmed]
  return [first, second]
}
