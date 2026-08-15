import { round } from '@/utils/geometry'

/**
 * Arithmetic for number fields.
 *
 * Measuring on site produces sums rather than results: an edge sits at
 * `214+7`, the centre of a wall at `142/2+1`. Fields that allow it therefore
 * accept a small expression with `+`, `-`, `*`, `/` and brackets instead of a
 * plain number. The decimal separator is the point; a comma is accepted as an
 * alias because it has no other meaning in this grammar.
 *
 * The grammar is the usual one, so `*` and `/` bind tighter than `+` and `-`:
 *
 *     sum     = product (('+' | '-') product)*
 *     product = unary (('*' | '/') unary)*
 *     unary   = ('+' | '-') unary | atom
 *     atom    = number | '(' sum ')'
 */

type Token = { kind: 'number'; value: number } | { kind: 'operator'; value: string }

const OPERATORS = '+-*/()'
const NUMBER = /^(?:\d+(?:\.\d*)?|\.\d+)/

/** Splits the input into numbers and operators, or `null` on a stray character. */
function tokenize(input: string): Token[] | null {
  const text = input.replace(/,/g, '.')
  const tokens: Token[] = []
  let index = 0

  while (index < text.length) {
    const char = text[index]!
    if (char === ' ' || char === '\t') {
      index += 1
      continue
    }
    if (OPERATORS.includes(char)) {
      tokens.push({ kind: 'operator', value: char })
      index += 1
      continue
    }
    const match = NUMBER.exec(text.slice(index))
    if (!match) return null
    tokens.push({ kind: 'number', value: Number.parseFloat(match[0]) })
    index += match[0].length
  }

  return tokens
}

/**
 * Recursive descent over the token list. Every step returns `null` as soon as
 * the input does not fit the grammar; there is no error recovery, because a
 * half finished entry such as `214+` simply has no value yet.
 */
function parseTokens(tokens: Token[]): number | null {
  let index = 0

  function nextOperator(...allowed: string[]): string | null {
    const token = tokens[index]
    if (!token || token.kind !== 'operator' || !allowed.includes(token.value)) return null
    index += 1
    return token.value
  }

  function parseSum(): number | null {
    let value = parseProduct()
    if (value === null) return null
    for (let operator = nextOperator('+', '-'); operator; operator = nextOperator('+', '-')) {
      const right = parseProduct()
      if (right === null) return null
      value = operator === '+' ? value + right : value - right
    }
    return value
  }

  function parseProduct(): number | null {
    let value = parseUnary()
    if (value === null) return null
    for (let operator = nextOperator('*', '/'); operator; operator = nextOperator('*', '/')) {
      const right = parseUnary()
      if (right === null) return null
      value = operator === '*' ? value * right : value / right
    }
    return value
  }

  function parseUnary(): number | null {
    const operator = nextOperator('+', '-')
    if (!operator) return parseAtom()
    const value = parseUnary()
    if (value === null) return null
    return operator === '-' ? -value : value
  }

  function parseAtom(): number | null {
    const token = tokens[index]
    if (!token) return null
    if (token.kind === 'number') {
      index += 1
      return token.value
    }
    if (token.value !== '(') return null
    index += 1
    const value = parseSum()
    if (value === null) return null
    if (!nextOperator(')')) return null
    return value
  }

  const result = parseSum()
  // Trailing rubbish such as `12 34` must not pass as a valid entry.
  return index === tokens.length ? result : null
}

/**
 * Value of an arithmetic expression, or `null` when the input is incomplete,
 * malformed or divides by zero. The result is rounded to three decimals, which
 * is far below the accuracy of a plan and keeps `0.1+0.2` from showing up as
 * `0.30000000000000004`.
 */
export function evaluateExpression(input: string): number | null {
  const tokens = tokenize(input)
  if (!tokens || tokens.length === 0) return null
  const value = parseTokens(tokens)
  return value !== null && Number.isFinite(value) ? round(value, 3) : null
}
