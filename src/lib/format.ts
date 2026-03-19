// Formatage des nombres avec espaces (sans Unicode non-breaking spaces)
export function fmt(n: number): string {
  const s = Math.abs(Math.round(n)).toString()
  let r = ''
  for (let i = s.length - 1, count = 0; i >= 0; i--, count++) {
    if (count > 0 && count % 3 === 0) r = ' ' + r
    r = s[i] + r
  }
  return n < 0 ? '-' + r : r
}
