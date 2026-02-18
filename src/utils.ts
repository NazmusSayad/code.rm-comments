export function regexpEscape(text: string) {
  return text.replace(/[[\]*|(){}\\.?^$+]/g, (match) => `\\${match}`);
}

export function range(from: number, to: number) {
  if (to <= from) {
    return [];
  }
  return [...Array(to - from).keys()].map((value) => value + from);
}
