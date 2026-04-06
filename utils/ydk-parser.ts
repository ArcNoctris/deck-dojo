/**
 * Parses a standard YDK string and extracts Konami IDs grouped by zone.
 * 
 * Standard YDK format example:
 * #created by ...
 * #main
 * 89631139
 * 89631139
 * 89631139
 * #extra
 * 23995346
 * !side
 * 5318639
 */
export function parseYDK(ydkString: string) {
  const lines = ydkString.split('\n').map(l => l.trim()).filter(l => l);
  
  const result = {
    main: [] as number[],
    extra: [] as number[],
    side: [] as number[]
  };

  let currentZone: 'main' | 'extra' | 'side' | null = null;

  for (const line of lines) {
    if (line.startsWith('#main')) {
      currentZone = 'main';
      continue;
    }
    if (line.startsWith('#extra')) {
      currentZone = 'extra';
      continue;
    }
    if (line.startsWith('!side')) {
      currentZone = 'side';
      continue;
    }

    // If it's a number and we are in a zone, push it to that zone
    if (currentZone && /^\d+$/.test(line)) {
      result[currentZone].push(parseInt(line, 10));
    }
  }

  return result;
}