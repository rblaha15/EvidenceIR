
export const textToFilter = (s: string) => s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

export const wordsToFilter = (s: string) => textToFilter(s)
    .split(' ')
    .map(it => it.replace('+', ' '));

/**
 * Two modes:
 * - normal: every searched word has to find a piece which is a substring of
 * - !exact: every searched word has to find a piece which is a start of
 */
export const includeItem = (search: string, pieces: string[]) =>
    wordsToFilter(search).every(
        filter => pieces.some(piece =>
            wordsToFilter(piece).some(word => word.includes(filter)) ||
            (filter.startsWith('!') ? textToFilter(piece).startsWith(filter.slice(1)) : textToFilter(piece).includes(filter)),
        ),
    );